-- ─────────────────────────────────────────────────────────────
--  Nocturna Records · Esquema de la demo
--  Ejecutar una vez en Supabase → SQL Editor (o `supabase db push`).
--  Después ejecutar supabase/seed.sql y `npm run seed:users`.
-- ─────────────────────────────────────────────────────────────

create extension if not exists pgcrypto with schema extensions;

-- ── Perfiles (rol de cada usuario de Supabase Auth) ──────────
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  role text not null check (role in ('admin', 'artist')),
  artist_id text,            -- slug del artista en src/config.ts (solo rol artist)
  created_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.my_artist_id() returns text
language sql stable security definer set search_path = '' as $$
  select artist_id from public.profiles where id = auth.uid();
$$;

-- ── Newsletter ───────────────────────────────────────────────
create table public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email ~* '^[^\s@,;]+@[^\s@,;]+\.[a-z]{2,}$'),
  name text not null default '',
  source text not null default 'web' check (source in ('web', 'concierto', 'importado', 'manual')),
  status text not null default 'active' check (status in ('active', 'unsubscribed')),
  created_at timestamptz not null default now()
);

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  preheader text not null default '',
  body text not null default '',
  cta_text text not null default '',
  cta_url text not null default '',
  sent_count int not null default 0,
  open_count int not null default 0,
  click_count int not null default 0,
  sent_at timestamptz not null default now()
);

create table public.automations (
  key text primary key check (key in ('welcome', 'release')),
  enabled boolean not null default true,
  sent_count int not null default 0
);

create table public.automation_log (
  id uuid primary key default gen_random_uuid(),
  key text not null references public.automations,
  text text not null,
  created_at timestamptz not null default now()
);

-- ── Formulario de contacto ───────────────────────────────────
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 120),
  email text not null check (email ~* '^[^\s@,;]+@[^\s@,;]+\.[a-z]{2,}$'),
  reason text not null check (reason in ('demo', 'press', 'booking', 'other')),
  message text not null check (char_length(trim(message)) between 20 and 1000),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ── Contratos, firmas y auditoría ────────────────────────────
create table public.contracts (
  id text primary key,                      -- p. ej. c-2026-041
  artist_id text not null,
  title text not null,
  type text not null check (type in ('recording', 'distribution', 'publishing')),
  scope text not null,
  start_date date not null,
  end_date date not null,
  royalty_pct numeric(5, 2) not null,
  territory text not null,
  advance_eur int not null default 0,
  status text not null default 'pending' check (status in ('pending', 'signed')),
  signed_on date,                           -- firmas anteriores al portal (papel, etc.)
  signed_note text,
  created_at timestamptz not null default now()
);

create table public.signatures (
  id uuid primary key default gen_random_uuid(),
  contract_id text not null unique references public.contracts on delete cascade,
  user_id uuid references auth.users on delete set null,
  full_name text not null,
  signature_png text not null,              -- data URL (en producción: Storage privado)
  document_text text not null,
  document_hash text not null,
  algo text not null,
  doc_id text not null,
  signed_at timestamptz not null default now(),
  ip text not null,
  ip_source text not null,
  user_agent text not null default '',
  client jsonb not null default '{}'        -- navegador, SO, idioma, zona horaria, pantalla…
);

create table public.contract_events (
  id uuid primary key default gen_random_uuid(),
  contract_id text not null references public.contracts on delete cascade,
  event text not null check (event in ('sent', 'opened', 'read', 'signed')),
  detail text not null default '',
  created_at timestamptz not null default now()
);

create index on public.contract_events (contract_id, created_at desc);
create index on public.automation_log (created_at desc);

-- ── Row Level Security ───────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.subscribers enable row level security;
alter table public.campaigns enable row level security;
alter table public.automations enable row level security;
alter table public.automation_log enable row level security;
alter table public.contact_messages enable row level security;
alter table public.contracts enable row level security;
alter table public.signatures enable row level security;
alter table public.contract_events enable row level security;

create policy "propio perfil" on public.profiles for select using (id = auth.uid() or public.is_admin());

create policy "admin" on public.subscribers for all using (public.is_admin()) with check (public.is_admin());
create policy "admin" on public.campaigns for all using (public.is_admin()) with check (public.is_admin());
create policy "admin" on public.automations for all using (public.is_admin()) with check (public.is_admin());
create policy "admin" on public.automation_log for all using (public.is_admin()) with check (public.is_admin());

create policy "cualquiera escribe" on public.contact_messages for insert to anon, authenticated with check (is_read = false);
create policy "admin lee" on public.contact_messages for select using (public.is_admin());
create policy "admin marca" on public.contact_messages for update using (public.is_admin());
create policy "admin borra" on public.contact_messages for delete using (public.is_admin());

create policy "artista o admin" on public.contracts for select
  using (public.is_admin() or artist_id = public.my_artist_id());
create policy "artista o admin" on public.signatures for select
  using (exists (select 1 from public.contracts c where c.id = contract_id));
create policy "artista o admin" on public.contract_events for select
  using (exists (select 1 from public.contracts c where c.id = contract_id));
-- El artista solo puede registrar aperturas y lecturas; la firma va por sign_contract()
create policy "artista registra" on public.contract_events for insert to authenticated
  with check (event in ('opened', 'read') and exists (select 1 from public.contracts c where c.id = contract_id));

-- ── Funciones ────────────────────────────────────────────────

-- Suma un envío a una automatización y lo apunta en el registro
create or replace function public.log_automation(p_key text, p_text text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Solo administradores'; end if;
  update public.automations set sent_count = sent_count + 1 where key = p_key;
  insert into public.automation_log (key, text) values (p_key, p_text);
end $$;

-- Alta en la newsletter desde la web (anónimo) o desde el panel (admin).
-- Devuelve 'ok' | 'welcome' (alta + bienvenida enviada) | 'dup' | 'invalid'. Si la automatización de bienvenida está activa, la "envía".
create or replace function public.subscribe(p_email text, p_name text default '', p_source text default 'web')
returns text language plpgsql security definer set search_path = '' as $$
declare
  v_email text := lower(trim(p_email));
  v_admin boolean := public.is_admin();
  v_status text;
begin
  if v_email !~* '^[^\s@,;]+@[^\s@,;]+\.[a-z]{2,}$' then return 'invalid'; end if;
  if not v_admin then p_source := 'web'; p_name := ''; end if;

  select status into v_status from public.subscribers where email = v_email;
  if v_status = 'active' then return 'dup'; end if;
  if v_status = 'unsubscribed' then
    update public.subscribers set status = 'active', created_at = now() where email = v_email;
  else
    insert into public.subscribers (email, name, source) values (v_email, coalesce(trim(p_name), ''), p_source);
  end if;

  -- API REAL: aquí se encolaría el email de bienvenida (doble opt-in recomendado)
  if p_source = 'web' and exists (select 1 from public.automations where key = 'welcome' and enabled) then
    update public.automations set sent_count = sent_count + 1 where key = 'welcome';
    insert into public.automation_log (key, text) values ('welcome', 'Bienvenida enviada a ' || v_email);
    return 'welcome';
  end if;
  return 'ok';
end $$;

-- Firma de un contrato. La IP se toma de la cabecera de la petición (no del cliente)
-- y la huella SHA-256 se calcula aquí sobre el texto firmado + la fecha de firma.
create or replace function public.sign_contract(
  p_contract_id text, p_full_name text, p_signature_png text, p_document_text text, p_client jsonb
) returns public.signatures
language plpgsql security definer set search_path = '' as $$
declare
  v_contract public.contracts;
  v_now timestamptz := now();
  v_iso text := to_char(v_now at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
  v_headers json := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::json;
  v_ip text := split_part(coalesce(v_headers ->> 'x-forwarded-for', v_headers ->> 'x-real-ip', ''), ',', 1);
  v_hash text;
  v_sig public.signatures;
begin
  if auth.uid() is null then raise exception 'Sesión requerida'; end if;
  select * into v_contract from public.contracts where id = p_contract_id and artist_id = public.my_artist_id();
  if not found then raise exception 'Contrato no encontrado'; end if;
  if v_contract.status <> 'pending' then raise exception 'El contrato ya está firmado'; end if;
  if not exists (select 1 from public.contract_events where contract_id = p_contract_id and event = 'read') then
    raise exception 'Debes leer el contrato completo antes de firmar';
  end if;
  if array_length(regexp_split_to_array(trim(p_full_name), '\s+'), 1) < 2 then
    raise exception 'Escribe nombre y al menos un apellido';
  end if;

  v_hash := encode(extensions.digest(p_document_text || E'\n' || v_iso, 'sha256'), 'hex');

  insert into public.signatures (contract_id, user_id, full_name, signature_png, document_text, document_hash, algo,
                                 doc_id, signed_at, ip, ip_source, user_agent, client)
  values (p_contract_id, auth.uid(), trim(p_full_name), p_signature_png, p_document_text, v_hash,
          'SHA-256 (pgcrypto, calculado en servidor)',
          'NCT-' || upper(p_contract_id) || '-' || upper(left(v_hash, 10)), v_now,
          coalesce(nullif(trim(v_ip), ''), 'desconocida'), 'cabecera X-Forwarded-For (servidor)',
          coalesce(v_headers ->> 'user-agent', ''), coalesce(p_client, '{}'))
  returning * into v_sig;

  update public.contracts set status = 'signed', signed_on = v_now::date where id = p_contract_id;
  insert into public.contract_events (contract_id, event, detail)
  values (p_contract_id, 'signed', trim(p_full_name) || ' · IP ' || v_sig.ip || ' · SHA-256 ' || left(v_hash, 16) || '…');
  return v_sig;
end $$;

-- Datos iniciales de la demo (fechas relativas a hoy). La usan seed.sql y reset_demo().
create or replace function public.seed_demo() returns void
language plpgsql security definer set search_path = '' as $$
declare d date := current_date;
begin
  insert into public.subscribers (email, name, source, status, created_at) values
    ('lucia.moreno@example.com', 'Lucía Moreno', 'web', 'active', now() - interval '2 days'),
    ('javi.ortega@example.org', 'Javier Ortega', 'web', 'active', now() - interval '4 days'),
    ('carla.nieto@example.net', 'Carla Nieto', 'concierto', 'active', now() - interval '7 days'),
    ('pablo.serrano@example.com', 'Pablo Serrano', 'web', 'active', now() - interval '9 days'),
    ('ainhoa.goikoetxea@example.org', 'Ainhoa Goikoetxea', 'importado', 'active', now() - interval '12 days'),
    ('marc.puig@example.com', 'Marc Puig', 'web', 'active', now() - interval '15 days'),
    ('elena.vidal@example.net', 'Elena Vidal', 'concierto', 'active', now() - interval '21 days'),
    ('hugo.campos@example.com', 'Hugo Campos', 'web', 'active', now() - interval '26 days'),
    ('sara.lopez@example.org', 'Sara López', 'web', 'active', now() - interval '33 days'),
    ('dani.ferrer@example.com', 'Dani Ferrer', 'importado', 'active', now() - interval '40 days'),
    ('noelia.ramos@example.net', 'Noelia Ramos', 'web', 'active', now() - interval '48 days'),
    ('ivan.castro@example.com', 'Iván Castro', 'concierto', 'active', now() - interval '55 days'),
    ('paula.mendez@example.org', 'Paula Méndez', 'web', 'active', now() - interval '63 days'),
    ('alex.rubio@example.com', 'Álex Rubio', 'importado', 'unsubscribed', now() - interval '77 days'),
    ('marina.soler@example.net', 'Marina Soler', 'web', 'active', now() - interval '90 days');

  insert into public.campaigns (subject, sent_count, open_count, click_count, sent_at) values
    ('Ya disponible: «Mareas de Neón» de Luna Vega', 14, 8, 3, now() - interval '9 days'),
    ('Agenda de otoño: todas las fechas del sello', 13, 6, 2, now() - interval '38 days'),
    ('Seda, el nuevo disco de Inés Marlo', 12, 7, 2, now() - interval '60 days'),
    ('Nocturna Summer Sessions: playlist del verano', 10, 4, 1, now() - interval '110 days');

  insert into public.automations (key, enabled, sent_count) values ('welcome', true, 46), ('release', true, 5);
  insert into public.automation_log (key, text, created_at) values
    ('release', 'Aviso de «Mareas de Neón» enviado a 14 contactos', now() - interval '9 days'),
    ('welcome', 'Bienvenida enviada a lucia.moreno@example.com', now() - interval '2 days');

  insert into public.contact_messages (name, email, reason, message, is_read, created_at) values
    ('Clara Duarte', 'clara.duarte@example.com', 'press', 'Hola, escribo desde una revista cultural online. Nos gustaría entrevistar a Luna Vega con motivo del lanzamiento de «Mareas de Neón». ¿Con quién puedo coordinarlo?', false, now() - interval '1 day'),
    ('Tomás Beltrán', 'tomas.beltran@example.org', 'demo', 'Buenas, soy productor de electrónica en Zaragoza. Os dejo un enlace privado con un EP de cuatro temas. Creo que encaja con la línea de Aura Sur y Luna Vega. ¡Gracias por escuchar!', false, now() - interval '3 days'),
    ('Festival Mar de Fondo', 'booking@example.net', 'booking', 'Queremos cerrar a Fósforo para nuestra edición de primavera. ¿Podéis enviarnos caché, rider y disponibilidad para abril y mayo?', true, now() - interval '8 days');

  insert into public.contracts (id, artist_id, title, type, scope, start_date, end_date, royalty_pct, territory, advance_eur, status, signed_on, signed_note) values
    ('c-2023-014', 'luna-vega', 'Contrato de grabación', 'recording',
     'la grabación, producción y explotación comercial de los álbumes «Ciudad Dormida» y «Mareas de Neón», así como de los sencillos derivados',
     d - 1027, d + 68, 18, 'Mundial', 12000, 'signed', d - 1030, 'Firma electrónica realizada en una versión anterior del portal.'),
    ('c-2026-041', 'luna-vega', 'Contrato de distribución digital', 'distribution',
     'la distribución digital, gestión de metadatos, entrega a plataformas de streaming y descarga, y monetización de contenido en redes sociales del catálogo de LA ARTISTA',
     d + 7, d + 7 + 365 * 3, 22, 'Mundial', 0, 'pending', null, null),
    ('c-2020-007', 'luna-vega', 'Contrato de edición musical', 'publishing',
     'la administración y explotación editorial de las composiciones musicales de LA ARTISTA, incluyendo sincronizaciones y derechos de comunicación pública',
     d - 1580, d - 118, 15, 'España y Latinoamérica', 3000, 'signed', d - 1584, 'Firma manuscrita en papel; el original escaneado está archivado por el sello.');

  insert into public.contract_events (contract_id, event, detail, created_at) values
    ('c-2020-007', 'sent', 'Por Marta Ríos', now() - interval '1590 days'),
    ('c-2020-007', 'signed', 'Firma manuscrita en papel (archivo escaneado)', now() - interval '1584 days'),
    ('c-2023-014', 'sent', 'Por Marta Ríos', now() - interval '1036 days'),
    ('c-2023-014', 'opened', 'Portal de artistas', now() - interval '1033 days'),
    ('c-2023-014', 'signed', 'Firma electrónica en el portal', now() - interval '1030 days'),
    ('c-2026-041', 'sent', 'Por Marta Ríos · pendiente de firma', now() - interval '6 days');
end $$;

-- Botón «Restablecer datos de la demo»: vacía todo (menos usuarios) y vuelve a sembrar
create or replace function public.reset_demo() returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Inicia sesión para restablecer la demo'; end if;
  truncate public.signatures, public.contract_events, public.contracts, public.contact_messages,
           public.automation_log, public.automations, public.campaigns, public.subscribers;
  perform public.seed_demo();
end $$;

revoke execute on function public.seed_demo() from public, anon, authenticated;
revoke execute on function public.reset_demo() from public, anon;
revoke execute on function public.sign_contract(text, text, text, text, jsonb) from public, anon;
revoke execute on function public.log_automation(text, text) from public, anon;
grant execute on function public.subscribe(text, text, text) to anon, authenticated;

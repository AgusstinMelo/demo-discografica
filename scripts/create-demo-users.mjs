// Crea (o actualiza) los dos usuarios de la demo en Supabase Auth y sus perfiles.
// Uso: npm run seed:users   (lee VITE_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY de .env.local)
import { createClient } from "@supabase/supabase-js";

const url = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Faltan VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
const PASSWORD = "demo123";
const USERS = [
  { email: "admin@nocturna.demo", role: "admin", artist_id: null },
  { email: "artista@nocturna.demo", role: "artist", artist_id: "luna-vega" },
];

const { data: list, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
if (listError) throw listError;

for (const u of USERS) {
  let user = list.users.find((x) => x.email === u.email);
  if (user) {
    const { error } = await supabase.auth.admin.updateUserById(user.id, { password: PASSWORD, email_confirm: true });
    if (error) throw error;
  } else {
    const { data, error } = await supabase.auth.admin.createUser({ email: u.email, password: PASSWORD, email_confirm: true });
    if (error) throw error;
    user = data.user;
  }
  const { error } = await supabase.from("profiles").upsert({ id: user.id, email: u.email, role: u.role, artist_id: u.artist_id });
  if (error) throw error;
  console.log(`✓ ${u.email} (${u.role})`);
}
console.log(`Contraseña de ambos: ${PASSWORD}`);

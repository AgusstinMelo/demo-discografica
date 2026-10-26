# Nocturna Records · Demo web

Web de un sello discográfico independiente **ficticio**: sitio público, portal privado de artistas (contratos con firma digital, catálogo y pagos) y panel de administración (newsletter, campañas, automatizaciones y mensajes). React + Vite + TypeScript + Tailwind CSS, con **Supabase** como backend.

## Detalles de la propuesta

> Texto listo para pegar en la propuesta. Sustituye lo que está entre corchetes.

Hola [nombre del cliente], mi nombre es [tu nombre], soy desarrollador web especializado en sitios y aplicaciones a medida para proyectos musicales y creativos, con [X] años de experiencia. Para que veas desde el primer momento cómo podría quedar tu web, preparé una demo funcional de un sello discográfico: [enlace a la demo].

En la demo puedes recorrer las tres partes del proyecto:

- **Web pública:** artistas con su ficha y discografía, próximos lanzamientos, playlists, página del sello, formulario de contacto para demos, prensa y booking, y alta en la newsletter.
- **Portal privado de artistas:** cada artista consulta sus contratos y los firma digitalmente desde el navegador (con registro de fecha, IP y huella del documento), y ve su catálogo, sus streams, sus pagos de royalties y sus documentos.
- **Panel de administración:** gestión de suscriptores (alta, importación y exportación CSV), envío de campañas por email con vista previa, emails automáticos y bandeja de mensajes del formulario de contacto.

Está hecha con tecnologías actuales (React, TypeScript y Supabase), es rápida, se adapta a móviles y queda publicada en Vercel, así que no tendrás que encargarte de servidores. Todo el contenido se puede cambiar fácilmente y la adapto a tu marca, tus artistas y tus textos.

En mi perfil encontrarás otros trabajos destacados. He trabajado para [cliente 1], [cliente 2] y [cliente 3], y mis calificaciones son de [X] estrellas. Puedo entregarte el proyecto en [X] días, con hasta [X] rondas de revisiones, y te entrego el código completo y los accesos a todo. Si quieres, hablamos ahora mismo y lo ponemos en marcha. ¡Estamos en contacto!

## Arrancar

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # genera la carpeta dist/ (sitio estático)
npm run preview   # sirve dist/ para comprobar el build
```

Sin configurar nada, la demo funciona en **modo local**: los datos se guardan en el `localStorage` del navegador. Para que sean reales y compartidos, conecta Supabase (abajo).

## Credenciales de prueba

| Área | Ruta | Email | Contraseña |
| --- | --- | --- | --- |
| Portal de artistas | `/portal` | `artista@nocturna.demo` | `demo123` |
| Panel del sello | `/admin` | `admin@nocturna.demo` | `demo123` |

Cada pantalla de login las muestra con un botón «Autocompletar».

**Recorrido sugerido para presentar:** suscribirse a la newsletter → enviar un mensaje desde Contacto → entrar al portal y firmar el contrato pendiente (`C-2026-041`) → entrar al admin y ver el suscriptor nuevo, el mensaje en la bandeja y enviar una campaña.

## Conectar Supabase (5 pasos)

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. En **SQL Editor**, ejecuta `supabase/migrations/0001_schema.sql` y después `supabase/seed.sql`.
3. Copia `.env.example` como `.env.local` y rellena `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` (Project Settings → API).
4. Crea los dos usuarios de prueba: `npm run seed:users`.
5. `npm run dev`. En el login ya no aparece el aviso «Modo local».

> La `SUPABASE_SERVICE_ROLE_KEY` solo la usa el script del paso 4, nunca llega al navegador. No la subas al repositorio ni a Vercel.

### Qué hace el backend

| Tabla / función | Para qué |
| --- | --- |
| `profiles` | Rol de cada usuario (`admin` · `artist`) y artista vinculado |
| `subscribers`, `campaigns`, `automations`, `automation_log` | Newsletter y campañas. Solo el admin puede leerlas |
| `contact_messages` | Formulario de contacto: cualquiera escribe, solo el admin lee |
| `contracts`, `signatures`, `contract_events` | Contratos, firmas y auditoría. Cada artista solo ve los suyos |
| `subscribe()` | Alta en la newsletter (dispara el email de bienvenida si está activo) |
| `sign_contract()` | Firma: exige sesión y lectura completa, toma la **IP del servidor** y calcula el **SHA-256 en Postgres** |
| `reset_demo()` | Botón «Restablecer datos de la demo» (requiere sesión) |

Todas las tablas tienen Row Level Security. Con Supabase los datos son compartidos: lo que hace un visitante lo ve el siguiente.

## Cambiar los datos del sello

Todo el contenido fijo está en **`src/config.ts`**:

| Bloque | Qué contiene |
| --- | --- |
| `label` | Nombre, descripción, dirección, teléfono, emails y redes |
| `artists` | Roster: bio, ciudad, género, foto, oyentes y redes |
| `releases` | Lanzamientos y canciones. `daysFromToday` negativo = publicado, positivo = próximo |
| `playlists` | Playlists de la página de artistas (`spotifyId` para el embed real) |
| `about` | Página «El sello»: historia, hitos, misión, valores, cifras y equipo |
| `portal` | Artista del portal, manager, avisos, pagos, documentos y FAQ |
| `admin` | Plantilla de campaña y emails de las automatizaciones |

- **Datos iniciales** (suscriptores, mensajes, contratos…): `seed_demo()` en la migración SQL y `src/lib/api/seed.ts` para el modo local. Si cambias uno, cambia el otro.
- **Fotos**: placeholders de pravatar.cc. Sustitúyelas por URLs reales en `config.ts`.
- **Colores y fuentes**: variables de `:root` y `@theme` al principio de `src/index.css`.
- **Meta title, description y Open Graph**: en `index.html` (lleva `noindex` por ser demo).

## Qué está simulado

| Funcionalidad | En la demo | En la versión real |
| --- | --- | --- |
| Reproductor | Progreso animado sin audio | `<audio>` con previews de 30 s en Supabase Storage |
| Embeds de Spotify | Componente visual propio | `<iframe>` oficial con `spotifyId` |
| Portadas | SVG generativos | Imágenes subidas desde el panel |
| Envío de campañas | Barra de progreso y métricas aleatorias | Edge Function + proveedor (Resend, Brevo…) con píxel de apertura y clics |
| Automatizaciones | Contador y registro | Disparadores en servidor (alta de suscriptor, publicación de lanzamiento) |
| Firma digital | Canvas + IP + SHA-256 (en servidor con Supabase) | Mismo flujo y, si se requiere, un proveedor cualificado eIDAS |
| Documentos | Archivos de texto generados al vuelo | Supabase Storage privado con URL firmada |

> La firma de esta demo **no tiene validez legal**. Todos los nombres, emails (dominios `example.*` y `.demo`), contratos y cifras son ficticios.

## Desplegar en Vercel (2 pasos)

1. Sube el proyecto a un repositorio de GitHub.
2. En [vercel.com/new](https://vercel.com/new), importa el repositorio, añade `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en **Environment Variables** y pulsa **Deploy**. `vercel.json` ya redirige todas las rutas a la app.

> Sin GitHub: `npx vercel` desde la carpeta del proyecto. En Netlify, arrastra la carpeta `dist/` a [app.netlify.com/drop](https://app.netlify.com/drop) (`public/_redirects` ya está incluido).

// ─────────────────────────────────────────────────────────────
//  Nocturna Records · Todos los textos y datos fijos del sello
//  Cambia aquí nombre, artistas, lanzamientos, playlists, equipo…
//  y se actualiza toda la web. Lo que cambia con el uso (suscriptores,
//  mensajes, contratos, firmas…) vive en Supabase (o en localStorage).
// ─────────────────────────────────────────────────────────────

/** Foto de placeholder (pravatar.cc). Sustituir por URLs reales. */
const avatar = (n: number) => `https://i.pravatar.cc/600?img=${n}`;

export type Genre = "Electrónica" | "Indie" | "Hip-hop" | "Soul" | "Ambient" | "Post-punk";
export type ReleaseType = "LP" | "EP" | "Single";
export type SocialNetwork = "instagram" | "spotify" | "youtube" | "tiktok";
export type Socials = Record<SocialNetwork, string>;

export interface Artist {
  id: string;
  name: string;
  genre: Genre;
  city: string;
  photo: string;
  since: number;
  listeners: number;
  bio: string;
  socials: Socials;
}

export interface ReleaseInput {
  id: string;
  title: string;
  artist: string;
  type: ReleaseType;
  /** Días respecto a hoy: negativo = ya publicado, positivo = próximo lanzamiento */
  daysFromToday: number;
  tracks: string[];
  blurb?: string;
}

export interface Playlist {
  id: string;
  title: string;
  color: string;
  followers: number;
  description: string;
  /** "idLanzamiento:índiceCanción" */
  tracks: string[];
  /** API REAL: ID de la playlist en Spotify para el <iframe> oficial */
  spotifyId?: string;
}

export const config = {
  label: {
    name: "Nocturna Records",
    shortName: "Nocturna",
    tagline: "La música que suena después de medianoche.",
    description:
      "Nocturna Records es un sello independiente con sede en Madrid. Editamos, distribuimos y acompañamos a artistas que hacen música sin pedir permiso.",
    founded: 2017,
    legalName: "NOCTURNA RECORDS S.L.",
    taxId: "B-00000000 (ficticio)",
    address: "Calle de la Medianoche 12, 28012 Madrid",
    phone: "+34 910 000 000",
    emails: { demos: "demos@nocturna.demo", press: "prensa@nocturna.demo", booking: "booking@nocturna.demo" },
    socials: { instagram: "@nocturna.records", spotify: "Nocturna Records", youtube: "NocturnaRecords", tiktok: "@nocturnarecords" } as Socials,
  },

  nav: [
    { to: "/", label: "Inicio" },
    { to: "/sello", label: "El sello" },
    { to: "/artistas", label: "Artistas" },
    { to: "/contacto", label: "Contacto" },
  ],

  genres: ["Electrónica", "Indie", "Hip-hop", "Soul", "Ambient", "Post-punk"] as Genre[],
  marquee: ["Directos", "Vinilo", "Madrid · Bilbao · Sevilla"],

  artists: [
    { id: "luna-vega", name: "Luna Vega", genre: "Electrónica", city: "Madrid", photo: avatar(47), since: 2021, listeners: 482300,
      bio: "Productora y vocalista madrileña. Construye paisajes de synth-pop nocturno a partir de grabaciones de campo de la ciudad dormida: metros vacíos, farolas que zumban, lluvia sobre la Gran Vía. Su debut «Ciudad Dormida» entró en listas editoriales de 30 países y la llevó a girar por Europa con un directo audiovisual propio.",
      socials: { instagram: "@lunavega.music", spotify: "Luna Vega", youtube: "LunaVegaOfficial", tiktok: "@lunavega" } },
    { id: "kairo", name: "Kairo", genre: "Hip-hop", city: "Sevilla", photo: avatar(12), since: 2020, listeners: 315800,
      bio: "Rimas afiladas sobre bases que mezclan flamenco electrónico, boom bap y graves de club. Kairo escribe sobre el barrio, la familia y el miedo a no llegar. Su disco «Barrio Alto» es ya un clásico del rap andaluz contemporáneo.",
      socials: { instagram: "@kairo.sev", spotify: "Kairo", youtube: "KairoTV", tiktok: "@kairo" } },
    { id: "los-desvelados", name: "Los Desvelados", genre: "Indie", city: "Valencia", photo: avatar(33), since: 2019, listeners: 201450,
      bio: "Cuarteto valenciano de guitarras luminosas y estribillos para cantar a gritos. Empezaron ensayando en un bajo de Ruzafa y hoy llenan salas por toda la península con su pop de insomnio.",
      socials: { instagram: "@losdesvelados", spotify: "Los Desvelados", youtube: "LosDesvelados", tiktok: "@losdesvelados" } },
    { id: "ines-marlo", name: "Inés Marlo", genre: "Soul", city: "Barcelona", photo: avatar(44), since: 2022, listeners: 158900,
      bio: "Voz cálida, banda de nueve músicos y una devoción absoluta por el soul de los setenta. Inés Marlo graba en cinta, en directo y sin red. «Seda» es su segundo largo y el más personal.",
      socials: { instagram: "@inesmarlo", spotify: "Inés Marlo", youtube: "InesMarloMusic", tiktok: "@inesmarlo" } },
    { id: "bruma", name: "Bruma", genre: "Ambient", city: "A Coruña", photo: avatar(68), since: 2018, listeners: 96400,
      bio: "Proyecto ambient de un músico gallego que trabaja con sintetizadores modulares, cintas degradadas y el sonido del Atlántico. Música para leer, para dormir o para mirar el mar desde la ventana.",
      socials: { instagram: "@bruma.ambient", spotify: "Bruma", youtube: "BrumaSounds", tiktok: "@bruma" } },
    { id: "fosforo", name: "Fósforo", genre: "Post-punk", city: "Bilbao", photo: avatar(59), since: 2020, listeners: 87200,
      bio: "Bajo al frente, baterías secas y una voz que escupe poesía industrial. Fósforo son tres amigos de Bilbao que convierten la nostalgia de la ría en canciones tensas, oscuras y bailables.",
      socials: { instagram: "@fosforo.band", spotify: "Fósforo", youtube: "FosforoBanda", tiktok: "@fosforo" } },
    { id: "aura-sur", name: "Aura Sur", genre: "Electrónica", city: "Málaga", photo: avatar(26), since: 2023, listeners: 134700,
      bio: "House balear, disco reciclada y atardeceres en la Costa del Sol. Aura Sur es la productora detrás de algunas de las sesiones más compartidas del verano pasado.",
      socials: { instagram: "@aurasur", spotify: "Aura Sur", youtube: "AuraSurMusic", tiktok: "@aurasur" } },
    { id: "delta-norte", name: "Delta Norte", genre: "Indie", city: "Gijón", photo: avatar(15), since: 2021, listeners: 72900,
      bio: "Dúo asturiano de dream pop con alma de ferry nocturno. Guitarras con reverb, cajas de ritmo baratas y letras sobre irse y volver. Su nuevo EP «Verano Eterno» llega muy pronto.",
      socials: { instagram: "@deltanorte", spotify: "Delta Norte", youtube: "DeltaNorte", tiktok: "@deltanorte" } },
  ] satisfies Artist[] as Artist[],

  /** El lanzamiento destacado en la portada */
  featuredRelease: "nct-031",

  releases: [
    { id: "nct-031", title: "Mareas de Neón", artist: "luna-vega", type: "LP", daysFromToday: -9,
      tracks: ["Mareas de Neón", "Línea 2 (Madrugada)", "Faros", "Cristal Líquido", "Hora Azul", "Despertar"],
      blurb: "Un viaje de synth-pop nocturno grabado entre Madrid y Lisboa: diez meses de grabaciones de campo, cajas de ritmos analógicas y una voz que suena a las cuatro de la mañana." },
    { id: "nct-032", title: "Ruido Blanco", artist: "fosforo", type: "EP", daysFromToday: 12, tracks: ["Ruido Blanco", "Hormigas", "Fábrica Cerrada", "Pánico"] },
    { id: "nct-033", title: "Lenguas de Fuego", artist: "kairo", type: "Single", daysFromToday: 26, tracks: ["Lenguas de Fuego", "Lenguas de Fuego (Instrumental)"] },
    { id: "nct-034", title: "Agua Lenta", artist: "bruma", type: "LP", daysFromToday: 41, tracks: ["Marea Baja", "Agua Lenta", "Faro de Hércules", "Niebla en Riazor", "Último Ferry", "Sal"] },
    { id: "nct-035", title: "Verano Eterno", artist: "delta-norte", type: "EP", daysFromToday: 63, tracks: ["Verano Eterno", "Ferry de Noche", "Playa de San Lorenzo", "Volver"] },
    { id: "nct-028", title: "Seda", artist: "ines-marlo", type: "LP", daysFromToday: -60, tracks: ["Seda", "Mañana No", "Fuego Lento", "Café a las Tres", "Terciopelo Azul", "Quédate"] },
    { id: "nct-026", title: "Quedarse Despierto", artist: "los-desvelados", type: "Single", daysFromToday: -90, tracks: ["Quedarse Despierto", "Insomnio Compartido"] },
    { id: "nct-025", title: "Brisa de Levante", artist: "aura-sur", type: "EP", daysFromToday: -120, tracks: ["Brisa de Levante", "Malagueta", "Atardecer 21:47", "Chiringuito Disco"] },
    { id: "nct-024", title: "Satélite", artist: "luna-vega", type: "Single", daysFromToday: -260, tracks: ["Satélite", "Satélite (Aura Sur Remix)"] },
    { id: "nct-022", title: "Cartas al Insomnio", artist: "los-desvelados", type: "LP", daysFromToday: -200, tracks: ["Cartas al Insomnio", "Ruzafa", "Tres de la Mañana", "Desvelados", "Luz de Neón", "Hasta Mañana"] },
    { id: "nct-021", title: "Costa Brava FM", artist: "aura-sur", type: "Single", daysFromToday: -300, tracks: ["Costa Brava FM", "Costa Brava FM (Extended)"] },
    { id: "nct-020", title: "Terciopelo", artist: "ines-marlo", type: "Single", daysFromToday: -330, tracks: ["Terciopelo", "Domingo"] },
    { id: "nct-019", title: "Ciudad Dormida", artist: "luna-vega", type: "LP", daysFromToday: -540, tracks: ["Ciudad Dormida", "Metro Vacío", "Farolas", "Lluvia en Gran Vía", "Nocturno", "Amanecer en Lavapiés", "Silencio"] },
    { id: "nct-017", title: "Hormigón", artist: "fosforo", type: "LP", daysFromToday: -480, tracks: ["Hormigón", "La Ría", "Altos Hornos", "Grises", "Sirena"] },
    { id: "nct-015", title: "Barrio Alto", artist: "kairo", type: "LP", daysFromToday: -400, tracks: ["Barrio Alto", "Triana 3AM", "Madre", "Lenguas", "No Llegar", "Azotea"] },
    { id: "nct-014", title: "Ferry", artist: "delta-norte", type: "LP", daysFromToday: -620, tracks: ["Ferry", "Cimadevilla", "Niebla", "Faro", "Norte"] },
    { id: "nct-012", title: "Niebla Baja", artist: "bruma", type: "EP", daysFromToday: -700, tracks: ["Niebla Baja", "Atlántico", "Cinta Rota", "Orilla"] },
  ] satisfies ReleaseInput[] as ReleaseInput[],

  playlists: [
    { id: "pl-night", title: "Night Drive", color: "#4a2a10", followers: 48210, description: "Synths, autopista vacía y luces de neón. Actualizada cada viernes.",
      tracks: ["nct-031:0", "nct-025:2", "nct-021:0", "nct-019:1", "nct-024:0"] },
    { id: "pl-calma", title: "Calma Nocturna", color: "#123a3a", followers: 31950, description: "Ambient y soul suave para cuando la ciudad por fin se calla.",
      tracks: ["nct-012:0", "nct-028:3", "nct-019:6", "nct-012:1", "nct-020:1"] },
    { id: "pl-ruido", title: "Ruido de Garaje", color: "#3a1222", followers: 22480, description: "Guitarras, bajos al frente y estribillos para gritar en la primera fila.",
      tracks: ["nct-017:1", "nct-022:1", "nct-026:0", "nct-014:0", "nct-015:1"] },
  ] satisfies Playlist[] as Playlist[],

  about: {
    eyebrow: "El sello · Desde 2017",
    quote: "«Empezamos grabando a amigos en un local sin ventanas. Seguimos igual, pero ahora el mundo escucha.»",
    quoteAuthor: "Marta Ríos, fundadora",
    paragraphs: [
      "Nocturna nació en 2017 de una idea sencilla: los artistas emergentes merecen las mismas herramientas que los grandes sellos, sin renunciar a su independencia ni a sus derechos. Empezamos editando cassettes de tirada corta para la escena de Lavapiés y hoy gestionamos un catálogo de más de 140 lanzamientos.",
      "Trabajamos con un roster deliberadamente pequeño. Cada artista tiene una persona de referencia en el sello, acceso a sus contratos, cifras y pagos desde un portal privado, y un equipo que se implica en cada disco como si fuera el primero.",
    ],
    milestones: [
      ["2017", "Nace Nocturna en un local de Lavapiés con tres artistas y un cassette."],
      ["2019", "Primer vinilo agotado: «Niebla Baja» de Bruma. Primera gira conjunta del sello."],
      ["2022", "Distribución propia en 150 plataformas y lanzamiento del portal de artistas."],
      ["2026", "«Mareas de Neón» de Luna Vega entra en listas editoriales de 30 países."],
    ] as [string, string][],
    mission: {
      title: "Dar a los artistas independientes la estructura de un gran sello sin quitarles el control.",
      text: "Producción, distribución, promoción, sincronización y gestión de derechos bajo un mismo techo, con contratos justos y datos abiertos.",
    },
    vision: {
      title: "Ser el sello de referencia de la música alternativa en español en 2030.",
      text: "Un catálogo que se escuche en todo el mundo y una forma de trabajar que inspire a la industria a ser más transparente.",
    },
    values: [
      ["Independencia", "Las decisiones artísticas son de los artistas. Nosotros ponemos los medios, no las condiciones."],
      ["Transparencia", "Contratos claros, liquidaciones trimestrales y acceso a los datos en tiempo real desde el portal."],
      ["Comunidad", "Un roster pequeño que se cuida, colabora entre sí y comparte escenario."],
      ["Riesgo", "Apostamos por sonidos que todavía no tienen nombre. Si suena a algo conocido, no es para nosotros."],
    ] as [string, string][],
    stats: [
      { value: 32, suffix: "", label: "artistas en el catálogo" },
      { value: 148, suffix: "", label: "lanzamientos editados" },
      { value: 86, suffix: "M", label: "streams acumulados" },
      { value: 9, suffix: "", label: "años de música nocturna" },
    ],
    team: [
      { name: "Marta Ríos", role: "Fundadora · A&R", photo: avatar(5), bio: "Quince años buscando canciones que no se parecen a nada." },
      { name: "Diego Salvatierra", role: "Operaciones y distribución", photo: avatar(11), bio: "Hace que cada lanzamiento llegue a tiempo a 150 plataformas." },
      { name: "Noa Ferrer", role: "Comunicación y prensa", photo: avatar(32), bio: "Conecta a los artistas con medios, radios y festivales." },
      { name: "Bruno Echeverría", role: "Sincronización y licencias", photo: avatar(53), bio: "Lleva la música del sello a cine, series y publicidad." },
    ],
  },

  /** Motivos del formulario de contacto (las claves se guardan en la base de datos) */
  contactReasons: { demo: "Envío de demo", press: "Prensa", booking: "Booking", other: "Otros" },

  // ── Portal de artistas ──────────────────────────────────────
  portal: {
    /** Artista que entra con artista@nocturna.demo */
    artistId: "luna-vega",
    signedWithLabelDaysAgo: 1095,
    manager: { name: "Marta Ríos", role: "Artist manager asignada", email: "marta.rios@nocturna.demo", phone: "+34 600 000 112", photo: avatar(5), hours: "L–V · 10:00–18:00" },
    royaltiesLast12m: 14820,
    notices: [
      { daysAgo: 1, icon: "chart", title: "«Mareas de Neón» supera los 250.000 streams", text: "Tu nuevo LP ha superado el cuarto de millón de reproducciones en su primera semana. ¡Enhorabuena!" },
      { daysAgo: 3, icon: "music", title: "Pitching editorial enviado", text: "Hemos presentado «Hora Azul» a las listas editoriales de Spotify y Apple Music. Respuesta estimada: 2 semanas." },
      { daysAgo: 6, icon: "file", title: "Nuevo contrato pendiente de firma", text: "Tienes disponible el contrato de distribución digital para revisar y firmar desde el portal." },
      { daysAgo: 12, icon: "calendar", title: "Fecha confirmada: Sala Copérnico (Madrid)", text: "Presentación del disco el próximo trimestre. Producción técnica te escribirá con el rider." },
    ] as const,
    payments: [
      { period: "T3 2026 (jul–sep)", daysFromToday: 18, amount: 4820, status: "En cálculo" },
      { period: "T4 2026 (oct–dic)", daysFromToday: 110, amount: 6150, status: "Estimado" },
      { period: "T1 2027 (ene–mar)", daysFromToday: 200, amount: 5300, status: "Estimado" },
      { period: "T2 2026 (abr–jun)", daysFromToday: -74, amount: 3910, status: "Pagado" },
    ] as const,
    documents: [
      { file: "guia-entrega-masters.txt", name: "Guía de entrega de masters", meta: "TXT · 3 KB · Actualizado hace 2 meses",
        body: "NOCTURNA RECORDS — GUÍA DE ENTREGA DE MASTERS (documento de ejemplo)\n\n1. Formato: WAV 24 bit / 48 kHz, estéreo.\n2. Pico máximo: -1 dBTP. Sonoridad orientativa: -14 LUFS integrados.\n3. Nombrar archivos: ARTISTA_TITULO_MASTER_V1.wav\n4. Incluir metadatos: compositores, productores, ISRC si existe.\n5. Entregar portada en 3000 x 3000 px, JPG RGB.\n" },
      { file: "liquidacion-T2-2026.csv", name: "Liquidación de royalties T2 2026", meta: "CSV · 1 KB · Pagado",
        body: "plataforma;streams;ingresos_brutos_eur;royalty_artista_eur\nSpotify;612040;2142.14;385.59\nApple Music;188220;1317.54;237.16\nYouTube Music;240110;480.22;86.44\nAmazon Music;96410;385.64;69.42\nOtros;51800;155.40;27.97\n" },
      { file: "kit-de-prensa-2026.txt", name: "Kit de prensa 2026", meta: "TXT · 2 KB · Bio, fotos y contacto",
        body: "LUNA VEGA — KIT DE PRENSA (ejemplo)\n\nBio corta: Productora y vocalista madrileña de synth-pop nocturno.\nÚltimo lanzamiento: «Mareas de Neón» (LP, Nocturna Records).\nPrensa: prensa@nocturna.demo\n" },
      { file: "manual-del-portal.txt", name: "Manual del portal de artistas", meta: "TXT · 2 KB · Cómo firmar y consultar datos",
        body: "MANUAL DEL PORTAL (ejemplo)\n\n- Mis contratos: consulta, lee y firma digitalmente.\n- Mi catálogo: ISRC, UPC y streams por canción.\n- Fechas de contrato: avisos de vencimiento.\n- Mi relación con el sello: pagos, documentos y FAQ.\n" },
    ],
    faq: [
      ["¿Cuándo se pagan los royalties?", "Las liquidaciones son trimestrales. Se emiten durante los 45 días siguientes al cierre de cada trimestre y se transfieren a la cuenta que tengas registrada."],
      ["¿Qué validez tiene la firma digital del portal?", "En la versión real la firma se registra con sello de tiempo, IP, dispositivo y huella SHA-256 del documento, y puede complementarse con un proveedor cualificado de firma electrónica (eIDAS). En esta demo no tiene validez legal."],
      ["¿Puedo cambiar los datos bancarios?", "Sí, escribiendo a tu artist manager. Por seguridad, los cambios bancarios se confirman siempre por una segunda vía."],
      ["¿Cómo se calculan los streams que veo en el catálogo?", "Se agregan los informes que envían las plataformas (DSPs) cada mes. Pueden existir diferencias de hasta 60 días respecto a los datos en tiempo real de cada plataforma."],
      ["¿Qué pasa cuando un contrato vence?", "Te avisamos con 90 días de antelación. Puedes renovarlo, renegociarlo o finalizarlo. El catálogo publicado sigue disponible según lo pactado en la cláusula de terminación."],
    ] as [string, string][],
    platforms: ["Spotify", "Apple Music", "YouTube Music", "Amazon Music", "Tidal", "Bandcamp"],
  },

  // ── Panel de administración ─────────────────────────────────
  admin: {
    campaignTemplate: {
      subject: "Nuevo lanzamiento: «Ruido Blanco» de Fósforo",
      preheader: "Cuatro canciones tensas, oscuras y bailables. Preescucha exclusiva para suscriptores.",
      body: "¡Hola!\n\nFósforo vuelve con **Ruido Blanco**, un EP de cuatro canciones grabado en directo en un antiguo taller de la ría de Bilbao.\n\nComo suscriptor de la newsletter puedes escucharlo **una semana antes** que nadie y reservar el vinilo de edición limitada (300 copias en color ámbar).\n\nNos vemos en primera fila.\n— El equipo de Nocturna",
      cta: "Escuchar la preescucha",
      url: "https://nocturna.demo/ruido-blanco",
    },
    automations: {
      welcome: {
        title: "Email de bienvenida al suscribirse",
        description: "Se envía al instante a cada nuevo suscriptor de la newsletter.",
        trigger: "Nuevo suscriptor",
        action: "Email de bienvenida",
        email: { subject: "Bienvenida a la noche", preheader: "Gracias por suscribirte a Nocturna Records.", body: "Gracias por unirte. A partir de ahora recibirás **preescuchas exclusivas**, preventas de vinilo y las fechas de los conciertos del sello.\n\nPara empezar, te dejamos nuestra playlist Night Drive.", cta: "Escuchar Night Drive", url: "#" },
      },
      release: {
        title: "Aviso de nuevo lanzamiento",
        description: "Se envía a toda la lista el día que sale un nuevo disco del sello.",
        trigger: "Lanzamiento publicado",
        action: "Aviso a toda la lista",
        email: { subject: "Ya disponible: «Ruido Blanco» de Fósforo", preheader: "El nuevo EP ya está en todas las plataformas.", body: "El nuevo EP de **Fósforo** ya suena en todas las plataformas. Cuatro canciones grabadas en directo en Bilbao.", cta: "Escuchar ahora", url: "#" },
      },
    },
  },

  /** Credenciales que se muestran en las pantallas de login */
  demoCredentials: {
    artist: "artista@nocturna.demo",
    admin: "admin@nocturna.demo",
    password: "demo123",
  },
};

export type ContactReason = keyof typeof config.contactReasons;
export type EmailContent = typeof config.admin.campaignTemplate;

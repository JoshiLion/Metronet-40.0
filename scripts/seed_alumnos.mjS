// seed_alumnos.js
import { createClient } from '@supabase/supabase-js';

// ====== ENV ======
const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno');
  process.exit(1);
}
const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ====== Datos que me diste ======
const alumnos = [
  { nombre: "ALFARO PIMENTEL VALERIA XIMENA", matricula: "203110341", contraseña: "160404", imagenUrl: "user-203110341.jpg" },
  { nombre: "BALMACEDA SANCHEZ ALESSANDRO", matricula: "223111900", contraseña: "090704", imagenUrl: "user-223111900.jpg" },
  { nombre: "BERLANGA VAZQUEZ JOSE LUIS", matricula: "223111193", contraseña: "260804", imagenUrl: "user-223111193.jpg" },
  { nombre: "CARRASCO MARTINEZ DAVID", matricula: "223111854", contraseña: "200204", imagenUrl: "user-223111854.jpg" },
  { nombre: "CORTES RESENDIZ MICHEL", matricula: "223110219", contraseña: "290504", imagenUrl: "user-223110219.jpg" },
  { nombre: "FLORES ROSALES ARIEL NAIM", matricula: "223110717", contraseña: "261004", imagenUrl: "user-223110717.jpg" },
  { nombre: "GARCIA HERNANDEZ TANIA SENYAZI", matricula: "223111914", contraseña: "080604", imagenUrl: "user-223111914.jpg" },
  { nombre: "GONZALEZ GARCIA JUAN DIEGO", matricula: "223110719", contraseña: "270704", imagenUrl: "user-223110719.jpg" },
  { nombre: "GRAJEDA MORENO ALAN", matricula: "223110100", contraseña: "211104", imagenUrl: "user-223110100.jpg" },
  { nombre: "HERNANDEZ CASTAÑEDA ERICK MANUEL", matricula: "223111116", contraseña: "091004", imagenUrl: "user-223111116.jpg" },
  { nombre: "HERNANDEZ GARCIA JESSICA", matricula: "223111294", contraseña: "271004", imagenUrl: "user-223111294.jpg" },
  { nombre: "HERNANDEZ HERNANDEZ ALFREDO JOSUE", matricula: "223110365", contraseña: "240504", imagenUrl: "user-223110365.jpg" },
  { nombre: "HINOJOSA CARRILLO YAEL MARTIN", matricula: "223110303", contraseña: "100104", imagenUrl: "user-223110303.jpg" },
  { nombre: "JUAREZ VITE EFREN", matricula: "223111064", contraseña: "030104", imagenUrl: "user-223111064.jpg" },
  { nombre: "LOPEZ ESQUIVEL METZTONALLI", matricula: "213111964", contraseña: "080404", imagenUrl: "user-213111964.jpg" },
  { nombre: "LOZANO ANGELES PAOLA VANESSA", matricula: "223111852", contraseña: "251104", imagenUrl: "user-223111852.jpg" },
  { nombre: "MARTINEZ GUERRERO ALAN", matricula: "223111621", contraseña: "230604", imagenUrl: "user-223111621.jpg" },
  { nombre: "MARTINEZ RUBIO JOSUE", matricula: "223111057", contraseña: "291104", imagenUrl: "user-223111057.jpg" },
  { nombre: "MAYOR MARCELINO JAIR", matricula: "223110485", contraseña: "091104", imagenUrl: "user-223110485.jpg" },
  { nombre: "MORALES GARCIA ALFONSO", matricula: "223110550", contraseña: "280704", imagenUrl: "user-223110550.jpg" },
  { nombre: "NAVARRETE LAZCANO JOB", matricula: "223111192", contraseña: "061004", imagenUrl: "user-223111192.jpg" },
  { nombre: "PEREZ LOPEZ YAMIR", matricula: "223111930", contraseña: "270604", imagenUrl: "user-223111930.jpg" },
  { nombre: "PEREZ TORRUCO HECTOR", matricula: "223111089", contraseña: "190104", imagenUrl: "user-223111089.jpg" },
  { nombre: "QUINTANA ESPINOSA ANGEL EDUARDO", matricula: "223111395", contraseña: "010704", imagenUrl: "user-223111395.jpg" },
  { nombre: "RAMIREZ HERNANDEZ EDUARDO SAHID", matricula: "223112018", contraseña: "080904", imagenUrl: "user-223112018.jpg" },
  { nombre: "RAMIREZ ROMERO ANA PAOLA", matricula: "223111939", contraseña: "260504", imagenUrl: "user-223111939.jpg" },
  { nombre: "RIVERO CRUZ FATIMA JULIET", matricula: "223110326", contraseña: "220704", imagenUrl: "user-223110326.jpg" },
  { nombre: "ROJAS MEJIA YAEL", matricula: "223111293", contraseña: "020204", imagenUrl: "user-223111293.jpg" },
  { nombre: "SALAS CASASOLA URIEL", matricula: "223110914", contraseña: "290404", imagenUrl: "user-223110914.jpg" },
  { nombre: "SALINAS HERNANDEZ ALONDRA VIOLETA", matricula: "223110527", contraseña: "260504", imagenUrl: "user-223110527.jpg" },
  { nombre: "VAZQUEZ MALDONADO ALBERTO", matricula: "223110508", contraseña: "210604", imagenUrl: "user-223110508.jpg" },
  { nombre: "ZAMUDIO GARDUÑO AXL SAUL", matricula: "223110141", contraseña: "280104", imagenUrl: "user-223110141.jpg" }
];

const BUILDING_ID = 'ud3';
const QUARTER = 8;
const GROUP = 'B';
const PROGRAMA_ITI = 'Ingeniería en Tecnologías de la Información';

function splitNombreCompleto(nombre) {
  // divide y trata de quedarse con último token como "nombre" y el resto como apellidos
  const parts = nombre.trim().split(/\s+/);
  if (parts.length < 2) return { first: nombre, last: '' };
  const first = parts.pop();             // nombre de pila al final
  const last = parts.join(' ');          // apellidos al inicio
  return { first, last };
}

async function main() {
  // 1) Obtén program_id de ITI
  const { data: progRows, error: progErr } = await sb
    .from('programs')
    .select('id')
    .eq('name', PROGRAMA_ITI)
    .limit(1)
    .maybeSingle();

  if (progErr || !progRows) {
    console.error('No encontré el programa ITI, corre primero el SQL de programas.', progErr);
    process.exit(1);
  }
  const programId = progRows.id;

  for (const a of alumnos) {
    try {
      const email = `${a.matricula}@alumnos.upmh.edu.mx`;
      // 2) Crea usuario en Auth (email + password)
      const { data: created, error: createErr } = await sb.auth.admin.createUser({
        email,
        password: a.contraseña,
        email_confirm: true,
        user_metadata: {
          identifier: a.matricula
        }
      });
      if (createErr) throw createErr;
      const userId = created.user.id;

      // 3) Inserta/actualiza en profiles
      const { first, last } = splitNombreCompleto(a.nombre);
      const { error: profErr } = await sb
        .from('profiles')
        .upsert({
          id: userId,
          identifier: a.matricula,
          role: 'student',
          is_lab_admin: false,
          first_name: first,
          last_name: last,
          avatar_url: a.imagenUrl, // ruta dentro del bucket avatars
          email
        }, { onConflict: 'id' });
      if (profErr) throw profErr;

      // 4) Inserta/actualiza en students
      const { error: stuErr } = await sb
        .from('students')
        .upsert({
          user_id: userId,
          quarter: QUARTER,
          group_name: GROUP,
          program_id: programId
        }, { onConflict: 'user_id' });
      if (stuErr) throw stuErr;

      console.log(`✔ Alumno listo: ${a.matricula} (${email})`);
    } catch (e) {
      console.error(`✖ Error con ${a.matricula}:`, e.message || e);
    }
  }

  console.log('Fin.');
}

main();

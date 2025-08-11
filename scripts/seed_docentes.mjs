// scripts/seed_docentes.mjs
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.seeder');
  process.exit(1);
}
const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Comprobación rápida: debe funcionar un endpoint admin
const { error: adminErr } = await sb.auth.admin.listUsers({ page: 1, perPage: 1 });
if (adminErr) {
  console.error('admin.listUsers falló (¿estás usando anon key en vez de service role?):', adminErr);
  process.exit(1);
}

const BUILDING_ID = 'ud3';

const docentes = [
  { titulo: "Mtra.", nombre: "ANDREA GENOVEVA ROJAS PONCIANO", correo: "arojas@upmh.edu.mx", indicador: "102345", contraseña: "102345", imagenUrl: "user-102345.jpg" },
  { titulo: "Dr.",   nombre: "ROEL GONZALEZ MONTES DE OCA",    correo: "rmontes@upmh.edu.mx", indicador: "203456", contraseña: "203456", imagenUrl: "user-203456.jpg" },
  { titulo: "Mtra.", nombre: "MARIA TERESA RENTERIA ORDAZ",    correo: "mrenteria@upmh.edu.mx", indicador: "304567", contraseña: "304567", imagenUrl: "user-304567.jpg" },
  { titulo: "Mtra.", nombre: "FARIDE HERNANDEZ PEREZ",         correo: "fahernandez@upmh.edu.mx", indicador: "405678", contraseña: "405678", imagenUrl: "user-405678.jpg" },
  { titulo: "Lic.",  nombre: "EDGAR QUEZADA FLORES",           correo: "equezada@upmh.edu.mx", indicador: "506789", contraseña: "506789", imagenUrl: "user-506789.jpg" },
  { titulo: "Dr.",   nombre: "JAIME AGUILAR ORTIZ",            correo: "joaguilar@upmh.edu.mx", indicador: "607890", contraseña: "607890", imagenUrl: "user-607890.jpg" },
  { titulo: "Ing.",  nombre: "EDUARDO GALVEZ CASTRO",          correo: "egalvez@upmh.edu.mx", indicador: "708901", contraseña: "708901", imagenUrl: "user-708901.jpg" },
  { titulo: "Dr.",   nombre: "ERNESTO GARCIA AMARO",           correo: "ergarcia@upmh.edu.mx", indicador: "809012", contraseña: "809012", imagenUrl: "user-809012.jpg" },
  { titulo: "Dr.",   nombre: "VICTOR MANUEL ZAMUDIO GARCÍA",   correo: "vzamudio@upmh.edu.mx", indicador: "910123", contraseña: "910123", imagenUrl: "user-910123.jpg" }
];

// Estos dos serán admin de laboratorio
const LAB_ADMINS = new Set(['arojas@upmh.edu.mx', 'ergarcia@upmh.edu.mx']);

// Helpers
const loginEmailFromIndicador = (indicador) => `${indicador}@alumnos.upmh.edu.mx`;

function splitNombreCompleto(nombre) {
  const parts = nombre.trim().split(/\s+/);
  if (parts.length < 2) return { first: nombre, last: '' };
  const first = parts.pop();
  const last = parts.join(' ');
  return { first, last };
}

function pickDepartment(fullName) {
  const s = fullName.toUpperCase();
  if (s.includes('ANIMACIÓN') || s.includes('EFECTOS')) return 'Animación y Efectos Visuales';
  if (s.includes('SISTEM') || s.includes('GALVEZ'))     return 'Ingeniería de Sistemas';
  if (s.includes('ZAMUDIO'))                            return 'Coordinación de ITI';
  return 'Departamento Académico';
}

// Busca un profile por indicador o por correo “real”
async function findProfileId(indicador, correo) {
  let { data: p1, error: e1 } = await sb.from('profiles').select('id').eq('identifier', indicador).maybeSingle();
  if (!e1 && p1) return p1.id;

  let { data: p2, error: e2 } = await sb.from('profiles').select('id').eq('email', correo).maybeSingle();
  if (!e2 && p2) return p2.id;

  return null;
}

async function ensureAuthUser(userId, loginEmail, password) {
  if (userId) {
    // Actualiza el email de auth para que sea el de login (indicador@alumnos...)
    await sb.auth.admin.updateUserById(userId, { email: loginEmail, email_confirm: true });
    return userId;
  }
  // Crea usuario en Auth
  const { data, error } = await sb.auth.admin.createUser({
    email: loginEmail,
    password,
    email_confirm: true
  });
  if (error) throw error;
  return data.user.id;
}

async function upsertDocente(d, idx) {
  const isAdmin      = LAB_ADMINS.has(d.correo);
  const depto        = pickDepartment(d.nombre);
  const room         = `UD3-${200 + idx}`;
  const buildingRole = isAdmin ? 'Encargado(a) de Laboratorio' : 'Docente';

  const loginEmail = loginEmailFromIndicador(d.indicador); // ESTE es el correo de acceso

  // 1) Detectar si ya existe por indicador/correo “real”
  const existingProfileId = await findProfileId(d.indicador, d.correo);

  // 2) Asegurar usuario en Auth con el email de acceso
  const userId = await ensureAuthUser(existingProfileId, loginEmail, d.contraseña);

  // 3) profiles: email = correo real (para contactar), identifier = indicador
  const { first, last } = splitNombreCompleto(d.nombre);
  const { error: profErr } = await sb
    .from('profiles')
    .upsert({
      id: userId,
      identifier: d.indicador,
      role: 'professor',
      is_lab_admin: isAdmin,
      first_name: first,
      last_name: last,
      avatar_url: d.imagenUrl, // ruta dentro de bucket 'avatars'
      email: d.correo          // ESTE es el institucional para "Contactar"
    }, { onConflict: 'id' });
  if (profErr) throw profErr;

  // 4) professors
  const { error: prErr } = await sb
    .from('professors')
    .upsert({
      user_id: userId,
      department: depto,
      title: d.titulo,
      is_lab_admin: isAdmin
    }, { onConflict: 'user_id' });
  if (prErr) throw prErr;

  // 5) building_staff (liga con UD3 para que salga en la card)
  const { error: bsErr } = await sb
    .from('building_staff')
    .upsert({
      building_id: BUILDING_ID,
      profile_id: userId,
      title: buildingRole,
      room_code: room
    }, { onConflict: 'building_id,profile_id' });
  if (bsErr) throw bsErr;

  console.log(`✔ Docente listo: ${d.indicador} (login: ${loginEmail})  contacto: ${d.correo}${isAdmin ? ' [LAB ADMIN]' : ''}`);
}

async function main() {
  // Warning si UD3 no existe
  const { data: b, error: bErr } = await sb.from('buildings').select('id').eq('id', BUILDING_ID).maybeSingle();
  if (bErr || !b) console.warn(`⚠ El edificio ${BUILDING_ID} no existe; building_staff fallará si no existe.`);

  for (let i = 0; i < docentes.length; i++) {
    try {
      await upsertDocente(docentes[i], i);
      await new Promise(r => setTimeout(r, 120)); // throttle
    } catch (e) {
      console.error(`✖ Error con ${docentes[i].indicador}:`, e.message || e);
    }
  }
  console.log('Fin docentes.');
}

main();

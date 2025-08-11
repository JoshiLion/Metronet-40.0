// src/lib/fetchBuildingData.js
import { supabase } from '../supabaseClient';

// Utilidad para avatar público
function publicAvatarUrl(pathOrNull) {
  if (!pathOrNull) return null;
  const { data } = supabase.storage.from('avatars').getPublicUrl(pathOrNull);
  return data?.publicUrl || null;
}

export async function fetchBuildingData(buildingId) {
  // 1) Personal (JOIN embebido por FK profile_id → profiles.id)
  const staffQ = supabase
    .from('building_staff')
    .select(`
      title,
      room_code,
      profiles:profile_id (
        id, first_name, last_name, identifier, email, avatar_url
      )
    `)
    .eq('building_id', buildingId);

  // 2) Programas del edificio
  const programsQ = supabase
    .from('building_programs')
    .select(`programs ( id, name )`)
    .eq('building_id', buildingId);

  // 3) Aulas / Rooms
  const roomsQ = supabase
    .from('rooms')
    .select(`id, code, kind`)
    .eq('building_id', buildingId);

  const [staffRes, programsRes, roomsRes] = await Promise.all([staffQ, programsQ, roomsQ]);

  // Manejo básico de errores
  if (staffRes.error)   console.error('staff error', staffRes.error);
  if (programsRes.error)console.error('programs error', programsRes.error);
  if (roomsRes.error)   console.error('rooms error', roomsRes.error);

  // Normaliza "personal" para la card
  const personal = (staffRes.data || []).map(row => {
    const p = row.profiles || {};
    const fullName = [p.first_name, p.last_name].filter(Boolean).join(' ') || p.identifier;
    return {
      name: fullName,
      title: row.title || 'Docente',
      room: row.room_code || null,
      email: p.email || null,
      avatarUrl: publicAvatarUrl(p.avatar_url),
      identifier: p.identifier || null
    };
  });

  const programs = (programsRes.data || []).map(r => r.programs).filter(Boolean); // {id, name}
  const rooms    = roomsRes.data || []; // [{id, code, kind}]

  return {
    buildingId,
    personal,
    programs,
    rooms
  };
}

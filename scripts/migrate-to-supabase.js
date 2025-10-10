#!/usr/bin/env node

/**
 * Script de migración de datos JSON a Supabase
 * Ejecuta: node scripts/migrate-to-supabase.js
 */

const fs = require('fs');
const path = require('path');

// Cargar variables de entorno desde .env.local
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Importar el cliente de Supabase
const { createClient } = require('@supabase/supabase-js');

// Verificar variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas');
  console.error('Asegúrate de tener configurado:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Función para leer archivos JSON
function readJsonFile(filename) {
  try {
    const filePath = path.join(__dirname, '..', 'bd', filename);
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`❌ Error leyendo ${filename}:`, error.message);
    return [];
  }
}

// Función para insertar datos en lotes
async function insertBatch(table, data, batchSize = 100) {
  const batches = [];
  for (let i = 0; i < data.length; i += batchSize) {
    batches.push(data.slice(i, i + batchSize));
  }

  for (const batch of batches) {
    const { error } = await supabase
      .from(table)
      .insert(batch);

    if (error) {
      console.error(`❌ Error insertando en ${table}:`, error);
      throw error;
    }
  }
}

// Función principal de migración
async function migrate() {
  console.log('🚀 Iniciando migración a Supabase...\n');

  try {
    // 1. Migrar organizaciones
    console.log('📁 Migrando organizaciones...');
    const organizaciones = readJsonFile('organizaciones.json');
    if (organizaciones.length > 0) {
      const orgData = organizaciones.map(org => ({
        id: org.id,
        name: org.nombre,
        description: org.descripcion || '',
        active: org.estado === 'Activa',
        created_at: org.createdAt || new Date().toISOString(),
        updated_at: org.updatedAt || new Date().toISOString()
      }));
      
      await insertBatch('organizations', orgData);
      console.log(`✅ ${organizaciones.length} organizaciones migradas`);
    }

    // 2. Migrar roles
    console.log('👥 Migrando roles...');
    const roles = readJsonFile('roles.json');
    if (roles.length > 0) {
      const roleData = roles.map(role => ({
        id: role.id,
        name: role.nombre,
        description: role.descripcion || '',
        permissions: role.permisos || [],
        created_at: role.createdAt || new Date().toISOString()
      }));
      
      await insertBatch('roles', roleData);
      console.log(`✅ ${roles.length} roles migrados`);
    }

    // 3. Migrar space_tags
    console.log('🏷️ Migrando etiquetas de espacios...');
    const spaceTags = readJsonFile('spaceTags.json');
    if (spaceTags.length > 0) {
      const tagData = spaceTags.map(tag => ({
        id: tag.id,
        name: tag.name,
        color: tag.color || '#3B82F6',
        created_at: new Date().toISOString()
      }));
      
      await insertBatch('space_tags', tagData);
      console.log(`✅ ${spaceTags.length} etiquetas migradas`);
    }

    // 4. Migrar espacios
    console.log('🏢 Migrando espacios...');
    const spaces = readJsonFile('spaces.json');
    if (spaces.length > 0) {
      const spaceData = spaces.map(space => ({
        id: space.id,
        name: space.name,
        capacity: space.capacity,
        description: space.description || '',
        equipment: space.amenities || [],
        tags: space.tags || [],
        image_url: space.backgroundImage || '',
        active: space.isActive !== false,
        created_at: space.createdAt || new Date().toISOString(),
        updated_at: space.updatedAt || new Date().toISOString()
      }));
      
      await insertBatch('spaces', spaceData);
      console.log(`✅ ${spaces.length} espacios migrados`);
    }

    // 5. Migrar usuarios
    console.log('👤 Migrando usuarios...');
    const usuarios = readJsonFile('usuarios.json');
    if (usuarios.length > 0) {
      const userData = usuarios.map(user => ({
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        organizacion: user.organizacion,
        rol: user.rol,
        estado: user.estado || 'Activo',
        password: user.password,
        temporary_password: user.temporaryPassword || false,
        last_password_change: user.lastPasswordChange,
        assigned_space_id: user.assignedSpaceId || null,
        created_at: user.createdAt || new Date().toISOString(),
        updated_at: user.updatedAt || new Date().toISOString()
      }));
      
      await insertBatch('users', userData);
      console.log(`✅ ${usuarios.length} usuarios migrados`);
    }

    // 6. Migrar reservaciones
    console.log('📅 Migrando reservaciones...');
    const reservations = readJsonFile('reservations.json');
    if (reservations.length > 0) {
      // Obtener todos los usuarios para mapear emails a IDs
      const { data: users } = await supabase
        .from('users')
        .select('id, correo');
      
      const userEmailToId = {};
      if (users) {
        users.forEach(user => {
          userEmailToId[user.correo] = user.id;
        });
      }

      const reservationData = reservations.map(res => {
        // Crear fechas ISO para start_time y end_time
        const date = res.date;
        const startTime = `${date}T${res.startTime}:00.000Z`;
        const endTime = `${date}T${res.endTime}:00.000Z`;

        // Buscar user_id por email del coordinador
        const coordinatorEmail = res.coordinatorEmail || res.coordinatorName?.toLowerCase().replace(/\s+/g, '.') + '@system.com';
        const userId = userEmailToId[coordinatorEmail] || userEmailToId['garzakareny5@gmail.com']; // Fallback a un usuario existente

        return {
          id: res.id,
          space_id: res.space.id,
          user_id: userId,
          title: res.title,
          description: res.notes || '',
          start_time: startTime,
          end_time: endTime,
          status: res.status || 'confirmed',
          attendees: res.numberOfPeople || 1,
          organization: res.company || 'Unknown',
          created_at: res.createdAt || new Date().toISOString(),
          updated_at: res.updatedAt || new Date().toISOString()
        };
      }).filter(res => res.user_id); // Solo incluir reservaciones con user_id válido
      
      await insertBatch('reservations', reservationData);
      console.log(`✅ ${reservationData.length} reservaciones migradas`);
    }

    console.log('\n🎉 ¡Migración completada exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`- Organizaciones: ${organizaciones.length}`);
    console.log(`- Roles: ${roles.length}`);
    console.log(`- Etiquetas: ${spaceTags.length}`);
    console.log(`- Espacios: ${spaces.length}`);
    console.log(`- Usuarios: ${usuarios.length}`);
    console.log(`- Reservaciones: ${reservations.length}`);

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  }
}

// Ejecutar migración
migrate();

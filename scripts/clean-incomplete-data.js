/**
 * Script para limpiar datos incompletos de Supabase
 * Elimina espacios, reservaciones y otros registros con información incompleta
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Cargar variables de entorno
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan las credenciales de Supabase en .env.local');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanIncompleteData() {
  console.log('\n🧹 ═══════════════════════════════════════════════════════');
  console.log('   LIMPIEZA DE DATOS INCOMPLETOS EN SUPABASE');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // 1. Limpiar espacios sin nombre o con campos nulos
    console.log('📦 Limpiando espacios incompletos...');
    const { data: spaces, error: spacesError } = await supabase
      .from('spaces')
      .select('*');

    if (spacesError) {
      console.error('❌ Error obteniendo espacios:', spacesError);
    } else {
      const incompleteSpaces = spaces.filter(space => 
        !space.name || 
        space.name.trim() === '' ||
        space.capacity === null ||
        space.capacity === undefined ||
        !space.id
      );

      console.log(`   Espacios incompletos encontrados: ${incompleteSpaces.length}`);

      for (const space of incompleteSpaces) {
        console.log(`   - Eliminando espacio: ID=${space.id}, Name=${space.name || 'SIN NOMBRE'}`);
        const { error: deleteError } = await supabase
          .from('spaces')
          .delete()
          .eq('id', space.id);

        if (deleteError) {
          console.error(`   ❌ Error eliminando espacio ${space.id}:`, deleteError);
        } else {
          console.log(`   ✅ Espacio ${space.id} eliminado`);
        }
      }
    }

    // 2. Limpiar reservaciones sin fecha/hora o con campos nulos
    console.log('\n📅 Limpiando reservaciones incompletas...');
    const { data: reservations, error: reservationsError } = await supabase
      .from('reservations')
      .select('*');

    if (reservationsError) {
      console.error('❌ Error obteniendo reservaciones:', reservationsError);
    } else {
      const incompleteReservations = reservations.filter(res => 
        !res.start_time || 
        !res.end_time ||
        !res.space_id ||
        !res.user_id ||
        !res.id
      );

      console.log(`   Reservaciones incompletas encontradas: ${incompleteReservations.length}`);

      for (const reservation of incompleteReservations) {
        console.log(`   - Eliminando reservación: ID=${reservation.id}, Title=${reservation.title || 'SIN TÍTULO'}`);
        const { error: deleteError } = await supabase
          .from('reservations')
          .delete()
          .eq('id', reservation.id);

        if (deleteError) {
          console.error(`   ❌ Error eliminando reservación ${reservation.id}:`, deleteError);
        } else {
          console.log(`   ✅ Reservación ${reservation.id} eliminada`);
        }
      }
    }

    // 3. Actualizar espacios existentes para asegurar que tengan arrays
    console.log('\n🔧 Actualizando espacios para asegurar campos completos...');
    const { data: allSpaces, error: allSpacesError } = await supabase
      .from('spaces')
      .select('*');

    if (allSpacesError) {
      console.error('❌ Error obteniendo espacios:', allSpacesError);
    } else {
      for (const space of allSpaces) {
        const updates = {};
        let needsUpdate = false;

        if (!space.equipment || !Array.isArray(space.equipment)) {
          updates.equipment = [];
          needsUpdate = true;
        }

        if (!space.tags || !Array.isArray(space.tags)) {
          updates.tags = [];
          needsUpdate = true;
        }

        if (space.active === null || space.active === undefined) {
          updates.active = true;
          needsUpdate = true;
        }

        if (needsUpdate) {
          console.log(`   - Actualizando espacio: ${space.name} (ID: ${space.id})`);
          const { error: updateError } = await supabase
            .from('spaces')
            .update(updates)
            .eq('id', space.id);

          if (updateError) {
            console.error(`   ❌ Error actualizando espacio ${space.id}:`, updateError);
          } else {
            console.log(`   ✅ Espacio ${space.id} actualizado`);
          }
        }
      }
    }

    // 4. Mostrar estadísticas finales
    console.log('\n📊 Estadísticas finales:');
    const { count: spacesCount } = await supabase
      .from('spaces')
      .select('*', { count: 'exact', head: true });

    const { count: reservationsCount } = await supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true });

    console.log(`   ✅ Espacios válidos: ${spacesCount}`);
    console.log(`   ✅ Reservaciones válidas: ${reservationsCount}`);

    console.log('\n✅ ═══════════════════════════════════════════════════════');
    console.log('   LIMPIEZA COMPLETADA EXITOSAMENTE');
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Error durante la limpieza:', error);
    process.exit(1);
  }
}

// Ejecutar limpieza
cleanIncompleteData()
  .then(() => {
    console.log('🎉 Script completado exitosamente');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });


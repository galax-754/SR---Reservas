#!/usr/bin/env node

/**
 * Script para crear un usuario tipo Tablet con espacio asignado
 * Ejecuta: node create-tablet-user.js
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function createTabletUser() {
  try {
    console.log('📱 Creando usuario tipo Tablet...\n');
    
    // Primero, obtener los espacios disponibles
    console.log('1️⃣ Obteniendo espacios disponibles...');
    const spacesResponse = await fetch(`${BASE_URL}/api/spaces`);
    const spacesData = await spacesResponse.json();
    
    if (!spacesResponse.ok) {
      throw new Error(`Error obteniendo espacios: ${spacesData.error}`);
    }
    
    const activeSpaces = spacesData.data.filter(space => space.isActive);
    console.log(`✅ Espacios activos encontrados: ${activeSpaces.length}`);
    activeSpaces.forEach(space => {
      console.log(`   - ${space.name} (ID: ${space.id}, Capacidad: ${space.capacity})`);
    });
    
    if (activeSpaces.length === 0) {
      throw new Error('No hay espacios activos disponibles');
    }
    
    // Usar el primer espacio disponible
    const selectedSpace = activeSpaces[0];
    console.log(`\n🎯 Usando espacio: ${selectedSpace.name} (ID: ${selectedSpace.id})\n`);
    
    // Crear usuario tipo Tablet
    console.log('2️⃣ Creando usuario tipo Tablet...');
    const tabletUser = {
      nombre: 'Tablet Usuario Demo',
      correo: 'tablet.demo@empresa.com',
      organizacion: 'Sofroma', // Asegúrate de que esta organización exista
      rol: 'Tablet',
      assignedSpaceId: selectedSpace.id // ¡Esto es lo importante!
    };
    
    console.log('📋 Datos del usuario:');
    console.log(`   - Nombre: ${tabletUser.nombre}`);
    console.log(`   - Email: ${tabletUser.correo}`);
    console.log(`   - Organización: ${tabletUser.organizacion}`);
    console.log(`   - Rol: ${tabletUser.rol}`);
    console.log(`   - Espacio Asignado: ${selectedSpace.name} (${selectedSpace.id})`);
    
    const createResponse = await fetch(`${BASE_URL}/api/usuarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tabletUser),
    });
    
    const createResult = await createResponse.json();
    
    if (!createResponse.ok) {
      throw new Error(`Error creando usuario: ${createResult.error}`);
    }
    
    console.log('\n✅ ¡Usuario Tablet creado exitosamente!');
    console.log('📧 Se ha enviado un email con las credenciales de acceso');
    console.log('\n📱 Características del usuario Tablet:');
    console.log(`   - Solo puede ver reservaciones del espacio: ${selectedSpace.name}`);
    console.log(`   - Acceso limitado a su espacio asignado`);
    console.log(`   - Ideal para tablets físicas en espacios específicos`);
    
    return createResult.data;
    
  } catch (error) {
    console.error('❌ Error creando usuario Tablet:', error.message);
    process.exit(1);
  }
}

// Ejecutar solo si es el archivo principal
if (require.main === module) {
  createTabletUser();
}

module.exports = { createTabletUser };

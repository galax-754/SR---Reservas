/**
 * Script de migración para agregar contraseñas a usuarios existentes
 * Este script agrega los campos necesarios para el nuevo sistema de autenticación
 * 
 * NOTA: Solo ejecutar una vez después de implementar el nuevo sistema
 */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;
const BD_PATH = path.join(process.cwd(), 'bd');
const USUARIOS_FILE = path.join(BD_PATH, 'usuarios.json');

// Contraseña temporal por defecto para usuarios existentes
const DEFAULT_TEMP_PASSWORD = 'Temporal123';

async function migrateUsers() {
  try {
    console.log('🔄 Iniciando migración de usuarios...\n');

    // Leer usuarios actuales
    const usuariosData = fs.readFileSync(USUARIOS_FILE, 'utf-8');
    const usuarios = JSON.parse(usuariosData);

    console.log(`📊 Encontrados ${usuarios.length} usuarios\n`);

    // Hashear la contraseña temporal
    console.log('🔐 Generando hash de contraseña temporal...');
    const hashedPassword = await bcrypt.hash(DEFAULT_TEMP_PASSWORD, SALT_ROUNDS);
    console.log('✅ Hash generado\n');

    // Migrar cada usuario
    const usuariosMigrados = await Promise.all(
      usuarios.map(async (usuario) => {
        // Si el usuario ya tiene contraseña, no hacer nada
        if (usuario.password) {
          console.log(`⏭️  ${usuario.nombre} - Ya tiene contraseña, omitiendo...`);
          return usuario;
        }

        console.log(`🔧 Migrando ${usuario.nombre} (${usuario.correo})...`);

        return {
          ...usuario,
          password: hashedPassword,
          temporaryPassword: true,
          assignedSpaceId: usuario.assignedSpaceId || undefined,
          lastPasswordChange: new Date().toISOString()
        };
      })
    );

    // Guardar usuarios migrados
    fs.writeFileSync(
      USUARIOS_FILE,
      JSON.stringify(usuariosMigrados, null, 2),
      'utf-8'
    );

    console.log('\n✅ Migración completada exitosamente!');
    console.log('\n📋 Resumen:');
    console.log(`   - Total de usuarios: ${usuarios.length}`);
    console.log(`   - Contraseña temporal: "${DEFAULT_TEMP_PASSWORD}"`);
    console.log('\n⚠️  IMPORTANTE:');
    console.log('   - Todos los usuarios deben cambiar su contraseña en el primer inicio de sesión');
    console.log('   - Notifica a los usuarios sobre sus nuevas credenciales');
    console.log('\n💡 Credenciales de prueba:');
    usuariosMigrados.forEach(u => {
      console.log(`   - ${u.correo} / ${DEFAULT_TEMP_PASSWORD}`);
    });

  } catch (error) {
    console.error('\n❌ Error durante la migración:', error);
    process.exit(1);
  }
}

// Ejecutar migración
migrateUsers();






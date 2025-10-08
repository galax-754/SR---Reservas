const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

const dbPath = path.join(__dirname, '..', 'bd');

async function askQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase().trim());
    });
  });
}

async function resetDatabase() {
  try {
    console.log('⚠️  ADVERTENCIA: Esta acción eliminará todos los datos de la base de datos');
    console.log('📁 Se eliminarán los archivos: spaces.json, spaceTags.json, reservations.json');
    
    const confirm = await askQuestion('¿Estás seguro de que quieres continuar? (escribe "si" para confirmar): ');
    
    if (confirm !== 'si') {
      console.log('❌ Operación cancelada');
      process.exit(0);
    }
    
    console.log('🔄 Iniciando reset de base de datos...');
    
    // Verificar si la carpeta bd existe
    try {
      await fs.access(dbPath);
    } catch {
      console.error('❌ La carpeta bd no existe. Ejecuta "npm run db:init" primero.');
      process.exit(1);
    }
    
    // Hacer backup antes de resetear
    console.log('💾 Creando backup antes del reset...');
    const backupPath = path.join(dbPath, 'backups');
    await fs.mkdir(backupPath, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const backupDir = path.join(backupPath, `backup-before-reset-${timestamp}`);
    await fs.mkdir(backupDir);
    
    const files = ['spaces.json', 'spaceTags.json', 'reservations.json'];
    
    for (const file of files) {
      try {
        const sourcePath = path.join(dbPath, file);
        const destPath = path.join(backupDir, file);
        await fs.copyFile(sourcePath, destPath);
        console.log(`✅ ${file} respaldado antes del reset`);
      } catch (error) {
        console.warn(`⚠️  No se pudo respaldar ${file}:`, error.message);
      }
    }
    
    // Eliminar archivos existentes
    for (const file of files) {
      try {
        const filePath = path.join(dbPath, file);
        await fs.unlink(filePath);
        console.log(`🗑️  ${file} eliminado`);
      } catch (error) {
        console.warn(`⚠️  No se pudo eliminar ${file}:`, error.message);
      }
    }
    
    console.log('🎉 Reset completado. Ejecuta "npm run db:init" para restaurar datos iniciales.');
    
  } catch (error) {
    console.error('❌ Error reseteando base de datos:', error);
    process.exit(1);
  }
}

resetDatabase();






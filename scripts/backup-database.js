const fs = require('fs').promises;
const path = require('path');

const dbPath = path.join(__dirname, '..', 'bd');

async function backupDatabase() {
  try {
    console.log('💾 Iniciando backup de base de datos...');
    
    // Verificar si la carpeta bd existe
    try {
      await fs.access(dbPath);
    } catch {
      console.error('❌ La carpeta bd no existe. Ejecuta "npm run db:init" primero.');
      process.exit(1);
    }
    
    // Crear carpeta de backups
    const backupPath = path.join(dbPath, 'backups');
    await fs.mkdir(backupPath, { recursive: true });
    
    // Crear carpeta con timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const backupDir = path.join(backupPath, `backup-${timestamp}`);
    await fs.mkdir(backupDir);
    
    // Archivos a respaldar
    const files = ['spaces.json', 'spaceTags.json', 'reservations.json'];
    
    for (const file of files) {
      try {
        const sourcePath = path.join(dbPath, file);
        const destPath = path.join(backupDir, file);
        
        await fs.copyFile(sourcePath, destPath);
        console.log(`✅ ${file} respaldado`);
      } catch (error) {
        console.warn(`⚠️  No se pudo respaldar ${file}:`, error.message);
      }
    }
    
    console.log(`🎉 Backup completado en: ${backupDir}`);
    
  } catch (error) {
    console.error('❌ Error creando backup:', error);
    process.exit(1);
  }
}

backupDatabase();






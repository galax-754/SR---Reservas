import { database } from '@/services/database';

/**
 * Inicializa la base de datos al iniciar la aplicación
 * Solo se ejecuta en el servidor (no en el cliente)
 */
export async function initializeDatabase() {
  if (typeof window === 'undefined') {
    try {
      await database.initializeDatabase();
      console.log('✅ Base de datos local inicializada');
    } catch (error) {
      console.error('❌ Error inicializando base de datos:', error);
    }
  }
}

/**
 * Crea un backup automático de la base de datos
 */
export async function createBackup() {
  if (typeof window === 'undefined') {
    try {
      await database.backupDatabase();
      console.log('✅ Backup automático creado');
    } catch (error) {
      console.error('❌ Error creando backup:', error);
    }
  }
}






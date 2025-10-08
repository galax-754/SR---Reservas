import { promises as fs } from 'fs';
import path from 'path';

export class DatabaseService {
  private dbPath: string;

  constructor() {
    this.dbPath = path.join(process.cwd(), 'bd');
  }

  /**
   * Lee un archivo JSON desde la carpeta bd
   */
  async readFile<T>(filename: string): Promise<T[]> {
    try {
      const filePath = path.join(this.dbPath, `${filename}.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data) as T[];
    } catch (error) {
      console.error(`Error leyendo archivo ${filename}:`, error);
      return [];
    }
  }

  /**
   * Escribe datos a un archivo JSON en la carpeta bd
   */
  async writeFile<T>(filename: string, data: T[]): Promise<void> {
    try {
      const filePath = path.join(this.dbPath, `${filename}.json`);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error(`Error escribiendo archivo ${filename}:`, error);
      throw new Error(`No se pudo escribir el archivo ${filename}`);
    }
  }

  /**
   * Obtiene todos los elementos de una tabla
   */
  async getAll<T>(table: string): Promise<T[]> {
    return this.readFile<T>(table);
  }

  /**
   * Obtiene un elemento por ID
   */
  async getById<T extends { id: string }>(table: string, id: string): Promise<T | null> {
    const items = await this.readFile<T>(table);
    return items.find(item => item.id === id) || null;
  }

  /**
   * Crea un nuevo elemento
   */
  async create<T extends { id?: string }>(table: string, data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const items = await this.readFile<T>(table);
    const newItem = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as T;
    
    items.push(newItem);
    await this.writeFile(table, items);
    return newItem;
  }

  /**
   * Actualiza un elemento existente
   */
  async update<T extends { id: string }>(table: string, id: string, data: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<T> {
    const items = await this.readFile<T>(table);
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) {
      throw new Error(`Elemento con ID ${id} no encontrado en ${table}`);
    }

    items[index] = {
      ...items[index],
      ...data,
      updatedAt: new Date().toISOString()
    };

    await this.writeFile(table, items);
    return items[index];
  }

  /**
   * Elimina un elemento
   */
  async delete<T extends { id: string }>(table: string, id: string): Promise<void> {
    const items = await this.readFile<T>(table);
    const filteredItems = items.filter(item => item.id !== id);
    
    if (filteredItems.length === items.length) {
      throw new Error(`Elemento con ID ${id} no encontrado en ${table}`);
    }

    await this.writeFile(table, filteredItems);
  }

  /**
   * Busca elementos por criterios
   */
  async findBy<T>(table: string, criteria: Partial<T>): Promise<T[]> {
    const items = await this.readFile<T>(table);
    return items.filter(item => {
      return Object.entries(criteria).every(([key, value]) => {
        return (item as any)[key] === value;
      });
    });
  }

  /**
   * Inicializa la base de datos con datos de ejemplo si no existen
   */
  async initializeDatabase(): Promise<void> {
    try {
      // Verificar si la carpeta bd existe
      await fs.access(this.dbPath);
      
      // Verificar si los archivos existen
      const files = ['spaces', 'spaceTags', 'reservations', 'usuarios', 'organizaciones', 'roles'];
      
      for (const file of files) {
        try {
          await fs.access(path.join(this.dbPath, `${file}.json`));
        } catch {
          // Si el archivo no existe, crearlo vacío
          await this.writeFile(file, []);
        }
      }
      
      console.log('Base de datos inicializada correctamente');
    } catch (error) {
      console.error('Error inicializando base de datos:', error);
    }
  }

  /**
   * Hace backup de todos los archivos JSON
   */
  async backupDatabase(): Promise<void> {
    try {
      const backupPath = path.join(this.dbPath, 'backups');
      await fs.mkdir(backupPath, { recursive: true });
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupDir = path.join(backupPath, `backup-${timestamp}`);
      await fs.mkdir(backupDir);
      
      const files = ['spaces', 'spaceTags', 'reservations', 'usuarios', 'organizaciones', 'roles'];
      
      for (const file of files) {
        try {
          const sourcePath = path.join(this.dbPath, `${file}.json`);
          const destPath = path.join(backupDir, `${file}.json`);
          await fs.copyFile(sourcePath, destPath);
        } catch (error) {
          console.warn(`No se pudo hacer backup de ${file}:`, error);
        }
      }
      
      console.log(`Backup creado en: ${backupDir}`);
    } catch (error) {
      console.error('Error creando backup:', error);
    }
  }
}

// Instancia singleton del servicio de base de datos
export const database = new DatabaseService();

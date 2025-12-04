import { supabase } from '@/lib/supabase/client';

class StorageAPI {
  private bucketName = 'space-images';

  /**
   * Sube una imagen al storage de Supabase
   * @param file - Archivo de imagen a subir
   * @param folder - Carpeta donde guardar (opcional)
   * @returns URL pública de la imagen subida
   */
  async uploadImage(file: File, folder: string = 'spaces'): Promise<string> {
    try {
      // Generar un nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Subir el archivo a Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error subiendo imagen:', error);
        throw new Error(`Error al subir la imagen: ${error.message}`);
      }

      // Obtener la URL pública de la imagen
      const { data: { publicUrl } } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Error en uploadImage:', error);
      throw error;
    }
  }

  /**
   * Elimina una imagen del storage
   * @param imageUrl - URL de la imagen a eliminar
   */
  async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Extraer el path de la URL
      const urlParts = imageUrl.split(`${this.bucketName}/`);
      if (urlParts.length < 2) {
        console.warn('URL de imagen inválida:', imageUrl);
        return;
      }

      const filePath = urlParts[1];

      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) {
        console.error('Error eliminando imagen:', error);
        throw new Error(`Error al eliminar la imagen: ${error.message}`);
      }
    } catch (error) {
      console.error('Error en deleteImage:', error);
      throw error;
    }
  }

  /**
   * Reemplaza una imagen existente con una nueva
   * @param oldImageUrl - URL de la imagen anterior (opcional)
   * @param newFile - Nuevo archivo de imagen
   * @param folder - Carpeta donde guardar
   * @returns URL pública de la nueva imagen
   */
  async replaceImage(oldImageUrl: string | undefined, newFile: File, folder: string = 'spaces'): Promise<string> {
    try {
      // Eliminar la imagen anterior si existe
      if (oldImageUrl && oldImageUrl.includes(this.bucketName)) {
        await this.deleteImage(oldImageUrl);
      }

      // Subir la nueva imagen
      return await this.uploadImage(newFile, folder);
    } catch (error) {
      console.error('Error en replaceImage:', error);
      throw error;
    }
  }
}

export const storageAPI = new StorageAPI();


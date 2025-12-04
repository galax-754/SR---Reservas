class StorageAPI {
  /**
   * Sube una imagen al storage de Supabase usando la API del backend
   * @param file - Archivo de imagen a subir
   * @param folder - Carpeta donde guardar (opcional)
   * @returns URL pública de la imagen subida
   */
  async uploadImage(file: File, folder: string = 'spaces'): Promise<string> {
    try {
      // Crear FormData para enviar el archivo
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      // Enviar el archivo a la API del backend
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al subir la imagen');
      }

      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error('Error en uploadImage:', error);
      throw error;
    }
  }

  /**
   * Elimina una imagen del storage usando la API del backend
   * @param imageUrl - URL de la imagen a eliminar
   */
  async deleteImage(imageUrl: string): Promise<void> {
    try {
      if (!imageUrl || !imageUrl.includes('space-img/')) {
        console.warn('URL de imagen inválida:', imageUrl);
        return;
      }

      const response = await fetch(`/api/upload-image?url=${encodeURIComponent(imageUrl)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar la imagen');
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


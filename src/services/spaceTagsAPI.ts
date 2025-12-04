import { SpaceTag, CreateTagData } from '@/types/space';

// API que utiliza las rutas de Next.js para manejar archivos JSON
class SpaceTagsAPI {

  async getAll(): Promise<SpaceTag[]> {
    try {
      const response = await fetch('/api/space-tags');
      if (!response.ok) {
        throw new Error('Error al obtener etiquetas');
      }
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error en getAll:', error);
      return [];
    }
  }

  async getById(id: string): Promise<SpaceTag | null> {
    try {
      const response = await fetch(`/api/space-tags/${id}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Error al obtener etiqueta');
      }
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error en getById:', error);
      return null;
    }
  }

  async create(tagData: CreateTagData): Promise<{ data: SpaceTag }> {
    try {
      const response = await fetch('/api/space-tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tagData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        const error: any = new Error(errorData.error || 'Error al crear etiqueta');
        error.response = { data: errorData };
        throw error;
      }
      
      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error('Error en create:', error);
      throw error;
    }
  }

  async update(id: string, tagData: Partial<CreateTagData>): Promise<{ data: SpaceTag }> {
    try {
      const response = await fetch(`/api/space-tags/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tagData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        const error: any = new Error(errorData.error || 'Error al actualizar etiqueta');
        error.response = { data: errorData };
        throw error;
      }
      
      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error('Error en update:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/space-tags/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Error al eliminar etiqueta');
      }
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  }

  async searchByCriteria(criteria: Partial<SpaceTag>): Promise<SpaceTag[]> {
    // Para búsquedas complejas, podríamos implementar un endpoint específico
    // Por ahora, obtenemos todos y filtramos en el cliente
    const allTags = await this.getAll();
    return allTags.filter(tag => {
      return Object.entries(criteria).every(([key, value]) => {
        return (tag as any)[key] === value;
      });
    });
  }
}

export const spaceTagsAPI = new SpaceTagsAPI();

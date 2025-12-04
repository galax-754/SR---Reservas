import { Space, CreateSpaceData } from '@/types/space';

// API que utiliza las rutas de Next.js para manejar archivos JSON
class SpacesAPI {

  async getAll(): Promise<Space[]> {
    try {
      const response = await fetch('/api/spaces');
      if (!response.ok) {
        throw new Error('Error al obtener espacios');
      }
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error en getAll:', error);
      return [];
    }
  }

  async getById(id: string): Promise<Space | null> {
    try {
      const response = await fetch(`/api/spaces/${id}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Error al obtener espacio');
      }
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error en getById:', error);
      return null;
    }
  }

  async create(spaceData: CreateSpaceData): Promise<{ data: Space }> {
    try {
      const response = await fetch('/api/spaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(spaceData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        const error: any = new Error(errorData.error || 'Error al crear espacio');
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

  async update(id: string, spaceData: Partial<CreateSpaceData>): Promise<{ data: Space }> {
    try {
      const response = await fetch(`/api/spaces/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(spaceData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        const error: any = new Error(errorData.error || 'Error al actualizar espacio');
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
      const response = await fetch(`/api/spaces/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Error al eliminar espacio');
      }
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  }

  async searchByCriteria(criteria: Partial<Space>): Promise<Space[]> {
    // Para búsquedas complejas, podríamos implementar un endpoint específico
    // Por ahora, obtenemos todos y filtramos en el cliente
    const allSpaces = await this.getAll();
    return allSpaces.filter(space => {
      return Object.entries(criteria).every(([key, value]) => {
        return (space as any)[key] === value;
      });
    });
  }
}

export const spacesAPI = new SpacesAPI();

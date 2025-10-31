// API que utiliza las rutas de Next.js para manejar archivos JSON
import type { Reservation } from '@/types/reservation';

export interface CreateReservationData {
  spaceId?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  attendees?: number;
  requirements?: string[];
  coordinatorName?: string;
  coordinatorEmail?: string;
  coordinatorPhone?: string;
  company?: string;
  numberOfPeople?: number;
  space?: any;
  meetingType?: 'presencial' | 'hibrido';
  coffeeBreak?: 'si' | 'no' | 'buscando';
  cateringProvider?: any;
  notes?: string;
  status?: 'confirmed' | 'cancelled' | 'pending';
}

export type { Reservation };

// API que utiliza las rutas de Next.js para manejar archivos JSON
class ReservationsAPI {
  async getAll(): Promise<Reservation[]> {
    try {
      const response = await fetch('/api/reservations');
      if (!response.ok) {
        throw new Error('Error al obtener reservas');
      }
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error en getAll:', error);
      return [];
    }
  }

  async getById(id: string): Promise<Reservation | null> {
    try {
      const response = await fetch(`/api/reservations/${id}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Error al obtener reserva');
      }
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error en getById:', error);
      return null;
    }
  }

  async create(reservationData: CreateReservationData): Promise<{ data: Reservation }> {
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservationData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        const error: any = new Error(errorData.error || 'Error al crear reserva');
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

  async update(id: string, reservationData: Partial<CreateReservationData & { status?: string }>): Promise<{ data: Reservation }> {
    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservationData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error al actualizar reserva' }));
        
        // Construir mensaje de error más detallado
        let errorMessage = errorData.error || 'Error al actualizar reserva';
        if (errorData.details) {
          errorMessage += `: ${errorData.details}`;
        }
        if (errorData.suggestion) {
          errorMessage += `\n\nSugerencia: ${errorData.suggestion}`;
        }
        
        const error: any = new Error(errorMessage);
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
      const response = await fetch(`/api/reservations/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Error al eliminar reserva');
      }
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  }

  async getBySpaceId(spaceId: string): Promise<Reservation[]> {
    try {
      const response = await fetch(`/api/reservations?spaceId=${spaceId}`);
      if (!response.ok) {
        throw new Error('Error al obtener reservas por espacio');
      }
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error en getBySpaceId:', error);
      return [];
    }
  }

  async getByUserId(userId: string): Promise<Reservation[]> {
    try {
      const response = await fetch(`/api/reservations?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Error al obtener reservas por usuario');
      }
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error en getByUserId:', error);
      return [];
    }
  }

  async getByDateRange(startDate: string, endDate: string): Promise<Reservation[]> {
    try {
      const response = await fetch(`/api/reservations?startDate=${startDate}&endDate=${endDate}`);
      if (!response.ok) {
        throw new Error('Error al obtener reservas por rango de fechas');
      }
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error en getByDateRange:', error);
      return [];
    }
  }

  async updateStatus(id: string, status: 'pending' | 'confirmed' | 'cancelled'): Promise<{ data: Reservation }> {
    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar estado de reserva');
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error en updateStatus:', error);
      throw error;
    }
  }
}

export const reservationsAPI = new ReservationsAPI();

export const spaceTypes = [
  { value: 'meeting-room', label: 'Sala de Reuniones' },
  { value: 'conference-room', label: 'Sala de Conferencias' },
  { value: 'training-room', label: 'Sala de Capacitación' },
  { value: 'workshop', label: 'Taller' },
  { value: 'auditorium', label: 'Auditorio' },
  { value: 'coworking', label: 'Espacio de Coworking' },
  { value: 'office', label: 'Oficina' },
  { value: 'other', label: 'Otro' }
];

export const dayOptions = [
  { value: 'monday', label: 'Lunes' },
  { value: 'tuesday', label: 'Martes' },
  { value: 'wednesday', label: 'Miércoles' },
  { value: 'thursday', label: 'Jueves' },
  { value: 'friday', label: 'Viernes' },
  { value: 'saturday', label: 'Sábado' },
  { value: 'sunday', label: 'Domingo' }
];

export const colorOptions = [
  '#3CC47C', // Verde
  '#FF6B6B', // Rojo
  '#4ECDC4', // Turquesa
  '#45B7D1', // Azul
  '#96CEB4', // Verde claro
  '#FFEAA7', // Amarillo
  '#DDA0DD', // Púrpura
  '#98D8C8', // Verde menta
  '#F7DC6F', // Amarillo dorado
  '#BB8FCE', // Púrpura claro
  '#85C1E9', // Azul claro
  '#F8C471', // Naranja
  '#82E0AA', // Verde lima
  '#F1948A', // Rosa
  '#D7BDE2'  // Lavanda
];

export interface Space {
  id: string;
  name: string;
  type: string;
  capacity: number;
  location: string;
  amenities: string[];
  setupTypes: string[];
  isActive: boolean;
  requiresCatering: boolean;
  requiresGuestList: boolean;
  availableHours?: {
    start: string;
    end: string;
  };
  tags: string[];
  backgroundImage?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SpaceTag {
  id: string;
  name: string;
  color: string;
  allowedDays: string[];
  allowedHours: {
    start: string;
    end: string;
  };
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSpaceData {
  name: string;
  type: string;
  capacity: number;
  location: string;
  amenities: string[];
  setupTypes: string[];
  isActive: boolean;
  requiresCatering: boolean;
  requiresGuestList: boolean;
  availableHours?: {
    start: string;
    end: string;
  };
  tags: string[];
  backgroundImage?: string;
  description?: string;
}

export interface CreateTagData {
  name: string;
  color: string;
  allowedDays: string[];
  allowedHours: {
    start: string;
    end: string;
  };
  description: string;
}

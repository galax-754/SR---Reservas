export interface CateringProvider {
  name: string;
  contact: string;
  phone: string;
}

export interface CateringStaff {
  name: string;
  company?: string;
}

export interface ExternalVisitor {
  id: string;
  name: string;
  company?: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  ticketSent: boolean;
}

export interface Reservation {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  space: {
    id: string;
    name: string;
    capacity?: number;
    location?: string;
    requiresCatering?: boolean;
  };
  coordinatorName?: string;
  coordinatorEmail?: string;
  coordinatorPhone?: string;
  company?: string;
  numberOfPeople?: number;
  meetingType: 'presencial' | 'hibrido';
  setupType?: string;
  coffeeBreak?: 'si' | 'no' | 'buscando';
  cateringProvider?: CateringProvider;
  cateringStaff?: CateringStaff[];
  externalVisitors?: ExternalVisitor[];
  notes?: string;
  status?: 'confirmed' | 'cancelled' | 'pending';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateReservationData {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  spaceId: string;
  coordinatorName?: string;
  coordinatorEmail?: string;
  coordinatorPhone?: string;
  company?: string;
  numberOfPeople?: number;
  meetingType: 'presencial' | 'hibrido';
  setupType?: string;
  coffeeBreak?: 'si' | 'no' | 'buscando';
  cateringProvider?: CateringProvider;
  cateringStaff?: CateringStaff[];
  externalVisitors?: ExternalVisitor[];
  notes?: string;
}

export interface UpdateReservationData extends Partial<CreateReservationData> {
  id: string;
}

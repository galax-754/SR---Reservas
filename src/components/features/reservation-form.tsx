"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { 
  Users, 
  Coffee, 
  X, 
  AlertCircle,
  Calendar,
  Clock,
  CheckCircle,
  Upload,
  Download,
  FileText,
  Mail,
  Phone,
  Building,
  User,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Space, SpaceTag } from '@/types/space';
import { Reservation, CateringProvider } from '@/types/reservation';
import { spacesAPI } from '@/services/spacesAPI';
import { reservationsAPI } from '@/services/reservationsAPI';
import { spaceTagsAPI } from '@/services/spaceTagsAPI';
import * as XLSX from 'xlsx';

// ==================== INTERFACES ====================

interface ReservationFormData {
  personName: string;
  company: string;
  numberOfPeople: string;
  duration: string;
  email: string;
  phone: string;
  reason: string;
  space: string;
  date: string;
  startTime: string;
  endTime: string;
  hasCatering: '' | 'si' | 'no';
  cateringCompany: string;
}

interface ReservationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editingReservation?: Reservation | null;
  preselectedSpace?: string;
  preselectedTime?: string;
  preselectedDate?: Date;
}

// ==================== COMPONENTE PRINCIPAL ====================

export function ReservationForm({
  isOpen,
  onClose,
  onSuccess,
  editingReservation,
  preselectedSpace,
  preselectedTime,
  preselectedDate
}: ReservationFormProps) {
  // Estados del formulario
  const [formData, setFormData] = useState<ReservationFormData>({
    personName: '',
    company: '',
    numberOfPeople: '',
    duration: '',
    email: '',
    phone: '',
    reason: '',
    space: preselectedSpace || '',
    date: preselectedDate?.toISOString().split('T')[0] || '',
    startTime: preselectedTime || '',
    endTime: '',
    hasCatering: '',
    cateringCompany: ''
  });
  
  // Estados de validación
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [capacityError, setCapacityError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para espacios
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [isLoadingSpaces, setIsLoadingSpaces] = useState(true);
  
  // Estados para tags
  const [allTags, setAllTags] = useState<SpaceTag[]>([]);
  const [spaceTags, setSpaceTags] = useState<SpaceTag[]>([]);
  
  // Estados para organizaciones
  const [organizaciones, setOrganizaciones] = useState<any[]>([]);
  const [isLoadingOrganizaciones, setIsLoadingOrganizaciones] = useState(true);
  const [selectedOrganizacion, setSelectedOrganizacion] = useState<any>(null);

  // Opciones de duración (en horas)
  const durationOptions = [
    { value: '0.5', label: '30 minutos' },
    { value: '1', label: '1 hora' },
    { value: '1.5', label: '1 hora 30 minutos' },
    { value: '2', label: '2 horas' },
    { value: '2.5', label: '2 horas 30 minutos' },
    { value: '3', label: '3 horas' },
    { value: '4', label: '4 horas' },
    { value: '5', label: '5 horas' },
    { value: '6', label: '6 horas' },
    { value: '8', label: '8 horas' }
  ];

  // Horarios disponibles (8:00 AM - 11:00 PM) - Extendido para soportar horarios nocturnos
  const allTimeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00'
  ];

  // Estados para reservas existentes
  const [existingReservations, setExistingReservations] = useState<Reservation[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>(allTimeSlots);

  // ==================== EFECTOS ====================

  useEffect(() => {
    if (isOpen) {
      loadSpaces();
      loadOrganizaciones();
      loadTags();
    }
  }, [isOpen]);

  useEffect(() => {
    if (editingReservation) {
      console.log('📋 Effect: Cargando datos de reservación para editar:', editingReservation.id);
      loadReservationData(editingReservation);
    } else {
      console.log('📋 Effect: Reseteando formulario (no hay reservación para editar)');
      resetForm();
    }
  }, [editingReservation]);

  // Calcular hora de fin cuando cambia hora de inicio o duración
  useEffect(() => {
    if (formData.startTime && formData.duration) {
      const endTime = calculateEndTime(formData.startTime, parseFloat(formData.duration));
      setFormData(prev => ({ ...prev, endTime }));
    }
  }, [formData.startTime, formData.duration]);

  // Actualizar espacio seleccionado cuando cambia el ID del espacio
  useEffect(() => {
    if (formData.space) {
      const space = spaces.find(s => s.id === formData.space);
      setSelectedSpace(space || null);
      
      // Cargar tags del espacio
      if (space && space.tags && space.tags.length > 0) {
        const tags = allTags.filter(tag => space.tags.includes(tag.id));
        setSpaceTags(tags);
        console.log('🏷️ Tags del espacio:', tags);
      } else {
        setSpaceTags([]);
      }
    } else {
      setSelectedSpace(null);
      setSpaceTags([]);
    }
  }, [formData.space, spaces, allTags]);

  // Cargar reservas existentes cuando cambie espacio o fecha
  useEffect(() => {
    if (formData.space && formData.date) {
      loadExistingReservations(formData.space, formData.date);
    }
  }, [formData.space, formData.date]);

  // Recalcular horas disponibles cuando cambie duración, espacio, fecha o reservas
  useEffect(() => {
    if (formData.duration && formData.space && formData.date) {
      const available = calculateAvailableTimeSlots(
        parseFloat(formData.duration),
        existingReservations
      );
      setAvailableTimeSlots(available);
      
      // Si la hora actual ya no está disponible, limpiarla
      if (formData.startTime && !available.includes(formData.startTime)) {
        setFormData(prev => ({ ...prev, startTime: '', endTime: '' }));
      }
    } else {
      setAvailableTimeSlots(allTimeSlots);
    }
  }, [formData.duration, formData.space, formData.date, existingReservations]);

  // Actualizar organización seleccionada cuando cambien las organizaciones o la company
  useEffect(() => {
    if (formData.company && organizaciones.length > 0) {
      const org = organizaciones.find(o => o.nombre === formData.company);
      setSelectedOrganizacion(org || null);
    }
  }, [formData.company, organizaciones]);

  // ==================== FUNCIONES DE CARGA ====================

  const loadSpaces = async () => {
    try {
      setIsLoadingSpaces(true);
      const spacesData = await spacesAPI.getAll();
      setSpaces(spacesData.filter(space => space.isActive));
    } catch (error) {
      console.error('Error cargando espacios:', error);
      setSpaces([]);
    } finally {
      setIsLoadingSpaces(false);
    }
  };

  const loadTags = async () => {
    try {
      const tagsData = await spaceTagsAPI.getAll();
      setAllTags(tagsData);
      console.log('✅ Tags cargados:', tagsData);
    } catch (error) {
      console.error('Error cargando tags:', error);
      setAllTags([]);
    }
  };

  const loadOrganizaciones = async () => {
    try {
      setIsLoadingOrganizaciones(true);
      const response = await fetch('/api/organizaciones');
      const result = await response.json();
      // Filtrar solo organizaciones activas
      const organizacionesActivas = result.data?.filter((org: any) => org.estado === 'Activa') || [];
      setOrganizaciones(organizacionesActivas);
    } catch (error) {
      console.error('Error cargando organizaciones:', error);
      setOrganizaciones([]);
    } finally {
      setIsLoadingOrganizaciones(false);
    }
  };

  const loadReservationData = (reservation: Reservation) => {
    console.log('🔄 Cargando datos de reservación para edición:', reservation);
    console.log('📧 Email encontrado:', reservation.coordinatorEmail);
    console.log('📞 Teléfono encontrado:', reservation.coordinatorPhone);
    
    // Calcular duración
    const duration = calculateDuration(reservation.startTime, reservation.endTime);
    
    const newFormData = {
      personName: reservation.coordinatorName || '',
      company: reservation.company || '',
      numberOfPeople: reservation.numberOfPeople?.toString() || '',
      duration: duration.toString(),
      email: reservation.coordinatorEmail || '',
      phone: reservation.coordinatorPhone || '',
      reason: reservation.notes || '',
      space: reservation.space?.id || '',
      date: reservation.date || '',
      startTime: reservation.startTime || '',
      endTime: reservation.endTime || '',
      hasCatering: reservation.coffeeBreak || '',
      cateringCompany: reservation.cateringProvider?.name || ''
    };
    
    console.log('📝 Datos del formulario a establecer:', newFormData);
    setFormData(newFormData);
  };

  const resetForm = () => {
    console.log('🔄 Reseteando formulario...');
    setFormData({
      personName: '',
      company: '',
      numberOfPeople: '',
      duration: '',
      email: '',
      phone: '',
      reason: '',
      space: preselectedSpace || '',
      date: preselectedDate?.toISOString().split('T')[0] || '',
      startTime: preselectedTime || '',
      endTime: '',
      hasCatering: '',
      cateringCompany: ''
    });
    setErrors({});
    setCapacityError('');
  };

  // ==================== FUNCIONES DE UTILIDAD ====================

  const loadExistingReservations = async (spaceId: string, date: string) => {
    try {
      // Cargar todas las reservas
      const allReservations = await reservationsAPI.getAll();
      
      // Filtrar por espacio y fecha (excluyendo la reserva que estamos editando)
      const filtered = allReservations.filter(r => 
        r.space?.id === spaceId && 
        r.date === date &&
        r.status !== 'cancelled' &&
        r.startTime && // Asegurar que tenga startTime
        r.endTime && // Asegurar que tenga endTime
        (!editingReservation || r.id !== editingReservation.id)
      );
      
      setExistingReservations(filtered);
      console.log(`Reservas existentes para ${date}:`, filtered);
    } catch (error) {
      console.error('Error cargando reservas:', error);
      setExistingReservations([]);
    }
  };

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  const calculateEndTime = (startTime: string, durationHours: number): string => {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = startMinutes + (durationHours * 60);
    return minutesToTime(endMinutes);
  };

  const hasConflict = (
    proposedStart: string,
    proposedEnd: string,
    existingReservations: Reservation[]
  ): boolean => {
    const proposedStartMin = timeToMinutes(proposedStart);
    const proposedEndMin = timeToMinutes(proposedEnd);

    for (const reservation of existingReservations) {
      // Validar que la reserva tenga los campos necesarios
      if (!reservation.startTime || !reservation.endTime) continue;
      
      const existingStartMin = timeToMinutes(reservation.startTime);
      const existingEndMin = timeToMinutes(reservation.endTime);

      // Verificar si hay solapamiento
      // Hay conflicto si:
      // - La nueva reserva empieza antes de que termine una existente Y
      // - La nueva reserva termina después de que empiece una existente
      if (proposedStartMin < existingEndMin && proposedEndMin > existingStartMin) {
        return true;
      }
    }

    return false;
  };

  const calculateAvailableTimeSlots = (
    durationHours: number,
    existingReservations: Reservation[]
  ): string[] => {
    const available: string[] = [];
    
    // Si hay tags del espacio, determinar el rango de horas permitido
    let minAllowedTime = '08:00';
    let maxAllowedTime = '20:00'; // Por defecto hasta las 20:00
    
    if (spaceTags.length > 0) {
      // Encontrar el rango más amplio de todos los tags
      const earliestStart = spaceTags.reduce((min, tag) => {
        return tag.allowedHours.start < min ? tag.allowedHours.start : min;
      }, '23:59');
      
      const latestEnd = spaceTags.reduce((max, tag) => {
        return tag.allowedHours.end > max ? tag.allowedHours.end : max;
      }, '00:00');
      
      minAllowedTime = earliestStart;
      maxAllowedTime = latestEnd;
      
      console.log(`⏰ Rango de horarios permitido por tags: ${minAllowedTime} - ${maxAllowedTime}`);
    }

    for (const timeSlot of allTimeSlots) {
      const proposedEnd = calculateEndTime(timeSlot, durationHours);
      const proposedEndMin = timeToMinutes(proposedEnd);
      const timeSlotMin = timeToMinutes(timeSlot);
      const minAllowedMin = timeToMinutes(minAllowedTime);
      const maxAllowedMin = timeToMinutes(maxAllowedTime);

      // Verificar que el horario esté dentro del rango permitido
      if (timeSlotMin < minAllowedMin) {
        continue;
      }
      
      // Verificar que la reserva no pase del horario máximo permitido
      if (proposedEndMin > maxAllowedMin) {
        continue;
      }

      // Verificar que no haya conflicto con reservas existentes
      if (!hasConflict(timeSlot, proposedEnd, existingReservations)) {
        available.push(timeSlot);
      }
    }

    return available;
  };

  const calculateDuration = (startTime: string, endTime: string): number => {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    
    return (endTotalMinutes - startTotalMinutes) / 60;
  };

  const getTodayLocalDate = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isDateAllowedByTags = (dateString: string): boolean => {
    // Si no hay tags, todas las fechas están permitidas
    if (spaceTags.length === 0) {
      return true;
    }
    
    const date = new Date(dateString + 'T00:00:00'); // Evitar problemas de zona horaria
    const dayOfWeek = date.getDay(); // 0 = domingo, 1 = lunes, etc.
    
    // Mapear número de día a nombre del día en inglés (como está en los tags)
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];
    
    // Verificar si algún tag permite este día
    const isAllowed = spaceTags.some(tag => tag.allowedDays.includes(dayName));
    
    console.log(`📅 Verificando fecha ${dateString} (${dayName}): ${isAllowed ? 'PERMITIDA' : 'NO PERMITIDA'}`);
    return isAllowed;
  };

  const validateCapacity = (numberOfPeople: number, space: Space): boolean => {
    if (space && numberOfPeople > space.capacity) {
      setCapacityError(`El número de personas (${numberOfPeople}) excede la capacidad del espacio (${space.capacity})`);
      return false;
    }
    setCapacityError('');
    return true;
  };

  // ==================== HANDLERS ====================

  const handleInputChange = (field: keyof ReservationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Actualizar organización seleccionada cuando cambia el campo company
    if (field === 'company') {
      const org = organizaciones.find(o => o.nombre === value);
      setSelectedOrganizacion(org || null);
    }

    // Validar capacidad cuando cambia el número de personas
    if (field === 'numberOfPeople' && value && selectedSpace) {
      validateCapacity(parseInt(value), selectedSpace);
    }
  };

  const handleSpaceChange = (spaceId: string) => {
    setFormData(prev => ({ ...prev, space: spaceId }));
    
    if (formData.numberOfPeople) {
      const space = spaces.find(s => s.id === spaceId);
      if (space) {
        validateCapacity(parseInt(formData.numberOfPeople), space);
      }
    }
  };

  // ==================== VALIDACIÓN Y SUBMIT ====================

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.personName.trim()) {
      newErrors.personName = 'El nombre es requerido';
    }
    if (!formData.company.trim()) {
      newErrors.company = 'La empresa es requerida';
    }
    if (!formData.numberOfPeople) {
      newErrors.numberOfPeople = 'El número de personas es requerido';
    }
    if (!formData.duration) {
      newErrors.duration = 'La duración es requerida';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    }
    if (!formData.reason.trim()) {
      newErrors.reason = 'El motivo de la reunión es requerido';
    }
    if (!formData.space) {
      newErrors.space = 'Debes seleccionar un espacio';
    }
    if (!formData.date) {
      newErrors.date = 'La fecha es requerida';
    }
    if (!formData.startTime) {
      newErrors.startTime = 'La hora de inicio es requerida';
    }

    // Validación condicional de catering
    if (selectedSpace?.requiresCatering && !formData.hasCatering) {
      newErrors.hasCatering = 'Debes indicar si tendrás catering';
    }
    if (formData.hasCatering === 'si' && !formData.cateringCompany.trim()) {
      newErrors.cateringCompany = 'Debes ingresar el nombre de la empresa de catering';
    }

    // Validación condicional de invitados
    // if (selectedSpace?.requiresGuestList && externalVisitors.length === 0) {
    //   newErrors.visitors = 'Debes agregar al menos un invitado';
    // }

    if (capacityError) {
      newErrors.capacity = capacityError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('Por favor, completa todos los campos requeridos');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const reservationData = {
        title: formData.reason, // El título es el motivo de la reunión
        coordinatorName: formData.personName,
        coordinatorEmail: formData.email,
        coordinatorPhone: formData.phone,
        company: formData.company,
        numberOfPeople: parseInt(formData.numberOfPeople),
        space: selectedSpace!,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        meetingType: 'presencial' as const,
        coffeeBreak: formData.hasCatering as 'si' | 'no' | undefined,
        cateringProvider: formData.hasCatering === 'si' ? {
          name: formData.cateringCompany,
          contact: '',
          phone: ''
        } : undefined,
        notes: formData.reason,
        status: 'confirmed' as const
      };

      let result;
      if (editingReservation) {
        console.log('Actualizando reservación ID:', editingReservation.id);
        console.log('Datos a enviar:', reservationData);
        console.log('📧 Email en datos:', reservationData.coordinatorEmail);
        result = await reservationsAPI.update(editingReservation.id, reservationData as any);
        console.log('Reservación actualizada en el servidor:', result);
      } else {
        console.log('Creando nueva reservación:', reservationData);
        console.log('📧 Email en datos:', reservationData.coordinatorEmail);
        result = await reservationsAPI.create(reservationData as any);
        console.log('Reservación creada en el servidor:', result);
      }
      
      alert(editingReservation ? 'Reservación actualizada exitosamente' : 'Reservación creada exitosamente');
      
      // Llamar a onSuccess ANTES de cerrar para recargar los datos
      if (onSuccess) {
        onSuccess();
      }
      
      resetForm();
      onClose();
      
    } catch (error: any) {
      console.error('Error al guardar reservación:', error);
      // Mostrar mensaje de error específico si viene del servidor
      const errorMessage = error?.response?.data?.error || error?.message || 'Error al guardar la reservación';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==================== RENDER ====================

  if (!isOpen) return null;

  const isDurationSelected = !!formData.duration;
  const showCateringSection = selectedSpace?.requiresCatering;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingReservation ? 'Editar reservación' : 'Reservar Espacio'}
      size="xl"
      className="reservation-form-modal"
    >
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 p-4 sm:p-6 max-h-[75vh] overflow-y-auto">
        {/* Información Básica */}
        <div className="space-y-3 sm:space-y-5">
          {/* Nombre de la persona */}
          <div>
            <label className="flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm font-medium text-white mb-1 sm:mb-1.5">
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span>Nombre de la persona que reserva *</span>
            </label>
            <input
              type="text"
              placeholder="Tu nombre completo"
              value={formData.personName}
              onChange={(e) => handleInputChange('personName', e.target.value)}
              className={cn(
                "w-full px-3 py-2 sm:px-3.5 sm:py-2.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base",
                "bg-white/10 text-white border-white/30 placeholder-white/60",
                errors.personName ? "border-red-500" : ""
              )}
            />
            {errors.personName && (
              <p className="mt-1 text-xs sm:text-sm text-red-400">{errors.personName}</p>
            )}
          </div>

          {/* Empresa */}
          <div>
            <label className="flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm font-medium text-white mb-1 sm:mb-1.5">
              <Building className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span>Organización *</span>
            </label>
            <select
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              className={cn(
                "w-full px-3 py-2 sm:px-3.5 sm:py-2.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base",
                "bg-white/10 text-white border-white/30",
                errors.company ? "border-red-500" : ""
              )}
            >
              <option value="" className="bg-gray-900 text-white">Selecciona una organización</option>
              {isLoadingOrganizaciones ? (
                <option value="" disabled className="bg-gray-900 text-white">Cargando organizaciones...</option>
              ) : (
                organizaciones.map((org) => (
                  <option key={org.id} value={org.nombre} className="bg-gray-900 text-white">
                    {org.nombre} {org.tipo && `(${org.tipo})`}
                  </option>
                ))
              )}
            </select>
            {errors.company && (
              <p className="mt-1 text-xs sm:text-sm text-red-400">{errors.company}</p>
            )}
            {selectedOrganizacion && selectedOrganizacion.tieneLimiteHoras && (
              <div className="mt-2 p-2 sm:p-3 bg-blue-500/20 border border-blue-400/50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm text-blue-200">
                    <strong>Límite de horas:</strong> {selectedOrganizacion.limiteHoras}h
                    <br />
                    <strong>Horas usadas:</strong> {selectedOrganizacion.horasUsadas || 0}h
                    <br />
                    <strong>Horas disponibles:</strong> {(selectedOrganizacion.limiteHoras || 0) - (selectedOrganizacion.horasUsadas || 0)}h
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Seleccionar Espacio */}
          <div>
            <label className="flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm font-medium text-white mb-1 sm:mb-1.5">
              <Building className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Espacio *</span>
            </label>
            <select
              value={formData.space}
              onChange={(e) => handleSpaceChange(e.target.value)}
              className={cn(
                "w-full px-3 py-2 sm:px-3.5 sm:py-2.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base",
                "bg-white/10 text-white border-white/30",
                errors.space ? "border-red-500" : ""
              )}
            >
              <option value="" className="bg-gray-900 text-white">Selecciona un espacio</option>
              {spaces.map((space) => (
                <option key={space.id} value={space.id} className="bg-gray-900 text-white">
                  {space.name} - Cap: {space.capacity}
                </option>
              ))}
            </select>
            {errors.space && (
              <p className="mt-1 text-xs sm:text-sm text-red-400">{errors.space}</p>
            )}
          </div>

          {/* Cantidad de personas */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-white mb-1.5">
              <Users className="w-4 h-4" />
              <span>Cantidad de personas *</span>
            </label>
            <input
              type="number"
              placeholder="Número de personas"
              min="1"
              value={formData.numberOfPeople}
              onChange={(e) => handleInputChange('numberOfPeople', e.target.value)}
              className={cn(
                "w-full px-3.5 py-2.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base",
                "bg-white/10 text-white border-white/30 placeholder-white/60",
                errors.numberOfPeople || capacityError ? "border-red-500" : ""
              )}
            />
            {(errors.numberOfPeople || capacityError) && (
              <p className="mt-1 text-sm text-red-400">{errors.numberOfPeople || capacityError}</p>
            )}
            {selectedSpace && (
              <p className="text-xs text-white/70 mt-1">
                Capacidad máxima del espacio: {selectedSpace.capacity} personas
              </p>
            )}
          </div>

          {/* Duración de la reunión */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-white mb-1.5">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>Tiempo estimado que durará tu reunión *</span>
            </label>
            <select
              value={formData.duration}
              onChange={(e) => handleInputChange('duration', e.target.value)}
              className={cn(
                "w-full px-3.5 py-2.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base",
                "bg-white/10 text-white border-white/30",
                errors.duration ? "border-red-500" : ""
              )}
            >
              <option value="" className="bg-gray-900 text-white">Selecciona duración</option>
              {durationOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-gray-900 text-white">
                  {option.label}
                </option>
              ))}
            </select>
            {errors.duration && (
              <p className="mt-1 text-sm text-red-400">{errors.duration}</p>
            )}
          </div>

          {/* Fecha - Solo habilitado si hay duración */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-white mb-1.5">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>Fecha *</span>
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => {
                console.log('📅 Fecha seleccionada:', e.target.value);
                const selectedDate = e.target.value;
                
                // Validar si la fecha está permitida por los tags
                if (selectedDate && spaceTags.length > 0 && !isDateAllowedByTags(selectedDate)) {
                  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                  const date = new Date(selectedDate + 'T00:00:00');
                  const dayName = dayNames[date.getDay()];
                  const dayNamesES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
                  const dayNameES = dayNamesES[date.getDay()];
                  
                  setErrors(prev => ({ 
                    ...prev, 
                    date: `Este espacio no está disponible los ${dayNameES}. Por favor, selecciona otro día.` 
                  }));
                  return;
                }
                
                handleInputChange('date', e.target.value);
              }}
              min={getTodayLocalDate()}
              disabled={!isDurationSelected}
              className={cn(
                "w-full px-3.5 py-2.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base",
                !isDurationSelected ? "bg-gray-100 cursor-not-allowed text-gray-500" : "bg-white/10 text-white border-white/30",
                errors.date ? "border-red-500" : ""
              )}
            />
            {!isDurationSelected && (
              <p className="mt-1 text-sm text-amber-300">
                Primero selecciona la duración de la reunión
              </p>
            )}
            {isDurationSelected && spaceTags.length > 0 && (
              <div className="mt-1 text-xs text-blue-300">
                ℹ️ Este espacio tiene restricciones de horario. Disponible:{' '}
                {spaceTags.map(tag => {
                  const dayNamesMap: Record<string, string> = {
                    'monday': 'Lunes',
                    'tuesday': 'Martes',
                    'wednesday': 'Miércoles',
                    'thursday': 'Jueves',
                    'friday': 'Viernes',
                    'saturday': 'Sábado',
                    'sunday': 'Domingo'
                  };
                  const days = tag.allowedDays.map(d => dayNamesMap[d] || d).join(', ');
                  return `${days} (${tag.allowedHours.start}-${tag.allowedHours.end})`;
                }).join('; ')}
              </div>
            )}
            {errors.date && (
              <p className="mt-1 text-sm text-red-400">{errors.date}</p>
            )}
          </div>

          {/* Hora de inicio - Solo habilitado si hay duración */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-white mb-1.5">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>Hora de inicio *</span>
            </label>
            <select
              value={formData.startTime}
              onChange={(e) => handleInputChange('startTime', e.target.value)}
              disabled={!isDurationSelected}
              className={cn(
                "w-full px-3.5 py-2.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base",
                !isDurationSelected ? "bg-gray-100 cursor-not-allowed text-gray-500" : "bg-white/10 text-white border-white/30",
                errors.startTime ? "border-red-500" : ""
              )}
            >
              <option value="" className="bg-gray-900 text-white">Selecciona hora</option>
              {availableTimeSlots.length > 0 ? (
                availableTimeSlots.map((time) => (
                  <option key={time} value={time} className="bg-gray-900 text-white">
                    {time}
                  </option>
                ))
              ) : (
                <option value="" disabled className="bg-gray-900 text-white">No hay horarios disponibles</option>
              )}
            </select>
            {!isDurationSelected && (
              <p className="mt-1 text-sm text-amber-300">
                Primero selecciona la duración de la reunión
              </p>
            )}
            {isDurationSelected && availableTimeSlots.length === 0 && (
              <p className="mt-1 text-sm text-red-400">
                ⚠️ No hay horarios disponibles para esta duración en este día. Por favor, selecciona otra fecha o reduce la duración.
              </p>
            )}
            {isDurationSelected && availableTimeSlots.length > 0 && availableTimeSlots.length < allTimeSlots.length && (
              <p className="mt-1 text-sm text-blue-300">
                ℹ️ Mostrando {availableTimeSlots.length} horarios disponibles (algunos horarios están ocupados)
              </p>
            )}
            {errors.startTime && (
              <p className="mt-1 text-sm text-red-400">{errors.startTime}</p>
            )}
            {formData.endTime && (
              <p className="mt-1 text-sm text-white/80">
                Hora de fin: <strong>{formData.endTime}</strong>
              </p>
            )}
          </div>

          {/* Correo electrónico */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-white mb-1.5">
              <Mail className="w-4 h-4 flex-shrink-0" />
              <span>Correo electrónico *</span>
            </label>
            <input
              type="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={cn(
                "w-full px-3.5 py-2.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base",
                "bg-white/10 text-white border-white/30 placeholder-white/60",
                errors.email ? "border-red-500" : ""
              )}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-400">{errors.email}</p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-white mb-1.5">
              <Phone className="w-4 h-4 flex-shrink-0" />
              <span>Teléfono *</span>
            </label>
            <input
              type="tel"
              placeholder="Tu número de teléfono"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={cn(
                "w-full px-3.5 py-2.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base",
                "bg-white/10 text-white border-white/30 placeholder-white/60",
                errors.phone ? "border-red-500" : ""
              )}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-400">{errors.phone}</p>
            )}
          </div>

          {/* Motivo de la reunión */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-white mb-1.5">
              <FileText className="w-4 h-4 flex-shrink-0" />
              <span>Motivo de la reunión *</span>
            </label>
            <textarea
              placeholder="Describe el motivo de tu reunión"
              value={formData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              rows={3}
              className={cn(
                "w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none",
                "bg-white/10 text-white border-white/30 placeholder-white/60",
                errors.reason ? "border-red-500" : ""
              )}
            />
            {errors.reason && (
              <p className="mt-1 text-sm text-red-400">{errors.reason}</p>
            )}
          </div>
        </div>

        {/* Sección de Catering - Solo si el espacio lo requiere */}
        {showCateringSection && (
          <div className="border-t pt-4 sm:pt-6 mt-4 sm:mt-6">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-5 flex items-center space-x-2 text-white">
              <Coffee className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Catering</span>
            </h3>

            <div className="bg-amber-600/20 border border-amber-500/50 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-amber-200">
                  <strong>Importante:</strong> Este espacio no incluye servicio de catering. 
                  El servicio debe ser contratado por separado.
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  ¿Contratarás servicio de catering? *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleInputChange('hasCatering', 'si')}
                    className={cn(
                      "flex items-center justify-center space-x-2 p-3.5 border rounded-lg cursor-pointer transition-colors text-base",
                      formData.hasCatering === 'si' 
                        ? "border-green-500 bg-green-600 text-white" 
                        : "border-white/40 bg-white/10 hover:bg-white/20 text-white"
                    )}
                  >
                    <Coffee className="w-5 h-5" />
                    <span className="font-medium">Sí</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleInputChange('hasCatering', 'no')}
                    className={cn(
                      "flex items-center justify-center space-x-2 p-3.5 border rounded-lg cursor-pointer transition-colors text-base",
                      formData.hasCatering === 'no' 
                        ? "border-red-500 bg-red-600 text-white" 
                        : "border-white/40 bg-white/10 hover:bg-white/20 text-white"
                    )}
                  >
                    <X className="w-5 h-5" />
                    <span className="font-medium">No</span>
                  </button>
                </div>
                {errors.hasCatering && (
                  <p className="mt-1 text-sm text-red-400">{errors.hasCatering}</p>
                )}
              </div>

              {formData.hasCatering === 'si' && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Nombre de la empresa de catering *
                  </label>
                  <input
                    type="text"
                    placeholder="Nombre de la empresa de catering"
                    value={formData.cateringCompany}
                    onChange={(e) => handleInputChange('cateringCompany', e.target.value)}
                    className={cn(
                      "w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                      "bg-white/10 text-white border-white/30 placeholder-white/60",
                      errors.cateringCompany ? "border-red-500" : ""
                    )}
                  />
                  {errors.cateringCompany && (
                    <p className="mt-1 text-sm text-red-400">{errors.cateringCompany}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-4 pt-4 sm:pt-6 border-t border-white/20 mt-6 sm:mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-2.5 text-sm sm:text-base bg-white/10 border-white/40 text-white hover:bg-white/20 hover:border-white/60"
          >
            Cancelar
          </Button>
          
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 sm:px-6 sm:py-2.5 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Procesando...' : 
             editingReservation ? 'Actualizar' : 'Hacer Reserva'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

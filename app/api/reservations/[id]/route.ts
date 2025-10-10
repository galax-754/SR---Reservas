import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { CreateReservationData } from '@/services/reservationsAPI';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/reservations/[id] - Obtener reserva por ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Base de datos no configurada correctamente' },
        { status: 500 }
      );
    }

    const { data: reservation, error } = await supabaseAdmin
      .from('reservations')
      .select('*')
      .eq('id', params.id)
      .single();
    
    if (error || !reservation) {
      return NextResponse.json(
        { error: 'Reserva no encontrada' },
        { status: 404 }
      );
    }
    
    // Transformar al formato esperado por el frontend
    const startDate = new Date(reservation.start_time);
    const endDate = new Date(reservation.end_time);
    
    const transformedReservation = {
      id: reservation.id,
      title: reservation.title || 'Reserva',
      coordinatorName: 'Usuario',
      coordinatorEmail: '',
      coordinatorPhone: '',
      company: reservation.organization || 'Sin organización',
      numberOfPeople: reservation.attendees || 1,
      space: {
        id: reservation.space_id,
        name: 'Espacio',
        type: 'meeting-room',
        capacity: 10,
        location: '',
        amenities: [],
        setupTypes: [],
        isActive: true,
        requiresCatering: false,
        tags: [],
        backgroundImage: '',
        description: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      date: startDate.toISOString().split('T')[0],
      startTime: startDate.toTimeString().substring(0, 5),
      endTime: endDate.toTimeString().substring(0, 5),
      meetingType: 'presencial' as const,
      coffeeBreak: 'no' as const,
      notes: reservation.description || '',
      status: reservation.status || 'confirmed',
      createdAt: reservation.created_at,
      updatedAt: reservation.updated_at
    };
    
    return NextResponse.json({ data: transformedReservation });
  } catch (error) {
    console.error('Error obteniendo reserva:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/reservations/[id] - Actualizar reserva
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Base de datos no configurada correctamente' },
        { status: 500 }
      );
    }

    const reservationData: Partial<CreateReservationData & { status?: string }> = await request.json();
    console.log('📝 Datos recibidos para actualizar reserva ID:', params.id);
    console.log('📝 Datos:', JSON.stringify(reservationData, null, 2));
    
    // Obtener la reserva actual
    const { data: currentReservation, error: getError } = await supabaseAdmin
      .from('reservations')
      .select('*')
      .eq('id', params.id)
      .single();
    
    if (getError || !currentReservation) {
      return NextResponse.json(
        { error: 'Reserva no encontrada' },
        { status: 404 }
      );
    }
    console.log('📖 Reserva actual:', JSON.stringify(currentReservation, null, 2));
    
    // Preparar datos para actualización
    const updateData: any = {};
    
    if (reservationData.title) updateData.title = reservationData.title;
    if (reservationData.notes) updateData.description = reservationData.notes;
    if (reservationData.status) updateData.status = reservationData.status;
    if (reservationData.numberOfPeople) updateData.attendees = reservationData.numberOfPeople;
    if (reservationData.company) updateData.organization = reservationData.company;
    
    // Si hay cambios en fecha/hora, actualizar start_time y end_time
    if (reservationData.date || reservationData.startTime || reservationData.endTime) {
      const date = reservationData.date || currentReservation.start_time.split('T')[0];
      const startTime = reservationData.startTime || new Date(currentReservation.start_time).toTimeString().substring(0, 5);
      const endTime = reservationData.endTime || new Date(currentReservation.end_time).toTimeString().substring(0, 5);
      
      updateData.start_time = `${date}T${startTime}:00.000Z`;
      updateData.end_time = `${date}T${endTime}:00.000Z`;
    }
    
    // Actualizar la reserva en Supabase
    const { data: updatedReservation, error: updateError } = await supabaseAdmin
      .from('reservations')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error actualizando reserva:', updateError);
      return NextResponse.json(
        { error: 'Error actualizando reserva en la base de datos' },
        { status: 500 }
      );
    }
    
    console.log('✅ Reserva actualizada en la base de datos:', JSON.stringify(updatedReservation, null, 2));
    
    // Transformar la respuesta al formato esperado por el frontend
    const startDate = new Date(updatedReservation.start_time);
    const endDate = new Date(updatedReservation.end_time);
    
    const transformedReservation = {
      id: updatedReservation.id,
      title: updatedReservation.title || 'Reserva',
      coordinatorName: 'Usuario',
      coordinatorEmail: '',
      coordinatorPhone: '',
      company: updatedReservation.organization || 'Sin organización',
      numberOfPeople: updatedReservation.attendees || 1,
      space: {
        id: updatedReservation.space_id,
        name: 'Espacio',
        type: 'meeting-room',
        capacity: 10,
        location: '',
        amenities: [],
        setupTypes: [],
        isActive: true,
        requiresCatering: false,
        tags: [],
        backgroundImage: '',
        description: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      date: startDate.toISOString().split('T')[0],
      startTime: startDate.toTimeString().substring(0, 5),
      endTime: endDate.toTimeString().substring(0, 5),
      meetingType: 'presencial' as const,
      coffeeBreak: 'no' as const,
      notes: updatedReservation.description || '',
      status: updatedReservation.status || 'confirmed',
      createdAt: updatedReservation.created_at,
      updatedAt: updatedReservation.updated_at
    };
    
    return NextResponse.json({ data: transformedReservation });
  } catch (error) {
    console.error('Error actualizando reserva:', error);
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/reservations/[id] - Eliminar reserva
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Base de datos no configurada correctamente' },
        { status: 500 }
      );
    }

    // Obtener la reserva antes de eliminarla
    const { data: reservation, error: getError } = await supabaseAdmin
      .from('reservations')
      .select('*')
      .eq('id', params.id)
      .single();
    
    if (getError || !reservation) {
      return NextResponse.json(
        { error: 'Reserva no encontrada' },
        { status: 404 }
      );
    }
    
    // Eliminar la reserva de Supabase
    const { error: deleteError } = await supabaseAdmin
      .from('reservations')
      .delete()
      .eq('id', params.id);

    if (deleteError) {
      console.error('Error eliminando reserva:', deleteError);
      return NextResponse.json(
        { error: 'Error eliminando reserva de la base de datos' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ message: 'Reserva eliminada correctamente' });
  } catch (error) {
    console.error('Error eliminando reserva:', error);
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}






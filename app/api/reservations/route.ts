import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { CreateReservationData } from '@/services/reservationsAPI';

// GET /api/reservations - Obtener todas las reservas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const spaceId = searchParams.get('spaceId');
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    let query = supabaseAdmin
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Aplicar filtros
    if (spaceId) {
      query = query.eq('space_id', spaceId);
    }
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    if (startDate && endDate) {
      query = query
        .gte('start_time', `${startDate}T00:00:00.000Z`)
        .lte('end_time', `${endDate}T23:59:59.999Z`);
    }
    
    const { data: reservations, error } = await query;
    
    if (error) {
      console.error('Error obteniendo reservas:', error);
      return NextResponse.json(
        { error: 'Error obteniendo reservas de la base de datos' },
        { status: 500 }
      );
    }
    
    console.log('📋 Reservas obtenidas:', reservations?.length || 0);
    if (reservations && reservations.length > 0) {
      console.log('📧 Primera reserva user_id:', reservations[0].user_id);
    }
    
    return NextResponse.json({ data: reservations || [] });
  } catch (error) {
    console.error('Error obteniendo reservas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/reservations - Crear nueva reserva
export async function POST(request: NextRequest) {
  try {
    const reservationData: CreateReservationData = await request.json();
    console.log('📝 Datos recibidos para crear reserva:', JSON.stringify(reservationData, null, 2));
    
    // Validar que tenemos el email del coordinador
    if (!reservationData.coordinatorEmail) {
      return NextResponse.json(
        { error: 'Email del coordinador es requerido' },
        { status: 400 }
      );
    }
    
    // Buscar el usuario por email del coordinador para obtener su ID
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('correo', reservationData.coordinatorEmail.toLowerCase())
      .single();
    
    if (userError || !user) {
      console.error('Error buscando usuario:', userError);
      return NextResponse.json(
        { error: 'Usuario no encontrado con ese email' },
        { status: 404 }
      );
    }
    
    // Validar datos requeridos
    if (!reservationData.space?.id) {
      return NextResponse.json(
        { error: 'Espacio es requerido' },
        { status: 400 }
      );
    }
    
    if (!reservationData.date || !reservationData.startTime || !reservationData.endTime) {
      return NextResponse.json(
        { error: 'Fecha, hora de inicio y hora de fin son requeridos' },
        { status: 400 }
      );
    }
    
    // Validar límite de horas de la organización (opcional)
    if (reservationData.company) {
      try {
        const { data: organizacion } = await supabaseAdmin
          .from('organizations')
          .select('*')
          .eq('name', reservationData.company)
          .single();
        
        if (organizacion && organizacion.active) {
          // Calcular duración de la reserva en horas
          const startTime = reservationData.startTime.split(':');
          const endTime = reservationData.endTime.split(':');
          const startMinutes = parseInt(startTime[0]) * 60 + parseInt(startTime[1]);
          const endMinutes = parseInt(endTime[0]) * 60 + parseInt(endTime[1]);
          const durationHours = (endMinutes - startMinutes) / 60;
          
          // Nota: Por ahora no tenemos el campo de límite de horas en la tabla organizations
          // Si necesitas esta funcionalidad, podemos agregar estos campos después
        }
      } catch (error) {
        console.error('Error validando organización:', error);
        // Continuar sin validación de límite de horas
      }
    }
    
    // Crear fechas ISO para start_time y end_time
    const startDateTime = `${reservationData.date}T${reservationData.startTime}:00.000Z`;
    const endDateTime = `${reservationData.date}T${reservationData.endTime}:00.000Z`;
    
    // Crear la reserva en Supabase
    const { data: newReservation, error: createError } = await supabaseAdmin
      .from('reservations')
      .insert({
        space_id: reservationData.space.id,
        user_id: user.id,
        title: reservationData.title,
        description: reservationData.notes || '',
        start_time: startDateTime,
        end_time: endDateTime,
        status: 'confirmed',
        attendees: reservationData.numberOfPeople || 1,
        organization: reservationData.company || 'Unknown'
      })
      .select()
      .single();
    
    if (createError) {
      console.error('Error creando reserva:', createError);
      return NextResponse.json(
        { error: 'Error creando reserva en la base de datos' },
        { status: 500 }
      );
    }
    
    console.log('✅ Reserva creada:', JSON.stringify(newReservation, null, 2));
    return NextResponse.json({ data: newReservation }, { status: 201 });
  } catch (error) {
    console.error('Error creando reserva:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}






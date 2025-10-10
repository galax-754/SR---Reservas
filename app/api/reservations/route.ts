import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// Definir el tipo localmente para evitar problemas de importación
interface CreateReservationData {
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

// GET /api/reservations - Obtener todas las reservas
export async function GET(request: NextRequest) {
  try {
    // Verificar que supabaseAdmin esté disponible
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Base de datos no configurada correctamente' },
        { status: 500 }
      );
    }

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
    // Verificar que supabaseAdmin esté disponible
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Base de datos no configurada correctamente' },
        { status: 500 }
      );
    }

    const body = await request.json();
    console.log('📝 Datos recibidos para crear reserva:', JSON.stringify(body, null, 2));
    
    // Validar que tenemos el email del coordinador
    if (!body.coordinatorEmail) {
      return NextResponse.json(
        { error: 'Email del coordinador es requerido' },
        { status: 400 }
      );
    }
    
    // Buscar el usuario por email del coordinador para obtener su ID
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('correo', body.coordinatorEmail.toLowerCase())
      .single();
    
    if (userError || !user) {
      console.error('Error buscando usuario:', userError);
      return NextResponse.json(
        { error: 'Usuario no encontrado con ese email' },
        { status: 404 }
      );
    }
    
    // Validar datos requeridos
    if (!body.space?.id) {
      return NextResponse.json(
        { error: 'Espacio es requerido' },
        { status: 400 }
      );
    }
    
    if (!body.date || !body.startTime || !body.endTime) {
      return NextResponse.json(
        { error: 'Fecha, hora de inicio y hora de fin son requeridos' },
        { status: 400 }
      );
    }
    
    // Crear fechas ISO para start_time y end_time
    const startDateTime = `${body.date}T${body.startTime}:00.000Z`;
    const endDateTime = `${body.date}T${body.endTime}:00.000Z`;
    
    // Crear la reserva en Supabase
    const { data: newReservation, error: createError } = await supabaseAdmin
      .from('reservations')
      .insert({
        space_id: body.space.id,
        user_id: user.id,
        title: body.title || 'Reserva',
        description: body.notes || '',
        start_time: startDateTime,
        end_time: endDateTime,
        status: 'confirmed',
        attendees: body.numberOfPeople || 1,
        organization: body.company || 'Unknown'
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






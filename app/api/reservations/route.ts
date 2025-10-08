import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/services/database';
import { CreateReservationData } from '@/services/reservationsAPI';

// GET /api/reservations - Obtener todas las reservas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const spaceId = searchParams.get('spaceId');
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    let reservations;
    
    if (spaceId) {
      reservations = await database.findBy('reservations', { spaceId });
    } else if (userId) {
      reservations = await database.findBy('reservations', { userId });
    } else if (startDate && endDate) {
      // Filtrar por rango de fechas
      const allReservations = await database.getAll('reservations');
      reservations = allReservations.filter((reservation: any) => {
        const reservationDate = new Date(reservation.date);
        const filterStart = new Date(startDate);
        const filterEnd = new Date(endDate);
        
        return (reservationDate >= filterStart && reservationDate <= filterEnd);
      });
    } else {
      reservations = await database.getAll('reservations');
    }
    
    console.log('📋 Reservas obtenidas:', reservations.length);
    if (reservations.length > 0) {
      console.log('📧 Primera reserva email:', reservations[0].coordinatorEmail);
    }
    
    return NextResponse.json({ data: reservations });
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
    
    // Validar límite de horas de la organización
    if (reservationData.company) {
      const organizaciones = await database.getAll('organizaciones');
      const organizacion = organizaciones.find((org: any) => org.nombre === reservationData.company);
      
      if (organizacion && organizacion.tieneLimiteHoras) {
        // Calcular duración de la reserva en horas
        const startTime = reservationData.startTime.split(':');
        const endTime = reservationData.endTime.split(':');
        const startMinutes = parseInt(startTime[0]) * 60 + parseInt(startTime[1]);
        const endMinutes = parseInt(endTime[0]) * 60 + parseInt(endTime[1]);
        const durationHours = (endMinutes - startMinutes) / 60;
        
        const horasUsadas = organizacion.horasUsadas || 0;
        const limiteHoras = organizacion.limiteHoras || 0;
        const horasDisponibles = limiteHoras - horasUsadas;
        
        // Verificar si excede el límite
        if (durationHours > horasDisponibles) {
          return NextResponse.json(
            { 
              error: `La organización "${organizacion.nombre}" ha excedido su límite de horas. Límite: ${limiteHoras}h, Usadas: ${horasUsadas}h, Disponibles: ${horasDisponibles}h, Solicitadas: ${durationHours}h` 
            },
            { status: 400 }
          );
        }
        
        // Crear la reserva
        const newReservation = await database.create('reservations', {
          ...reservationData,
          status: 'confirmed'
        });
        console.log('✅ Reserva creada con límite de horas:', JSON.stringify(newReservation, null, 2));
        
        // Actualizar las horas usadas de la organización
        const nuevasHorasUsadas = horasUsadas + durationHours;
        await database.update('organizaciones', organizacion.id, {
          horasUsadas: nuevasHorasUsadas,
          updatedAt: new Date().toISOString()
        });
        
        return NextResponse.json({ data: newReservation }, { status: 201 });
      }
    }
    
    // Si no hay límite de horas, crear la reserva normalmente
    const newReservation = await database.create('reservations', {
      ...reservationData,
      status: 'confirmed'
    });
    console.log('✅ Reserva creada sin límite de horas:', JSON.stringify(newReservation, null, 2));
    return NextResponse.json({ data: newReservation }, { status: 201 });
  } catch (error) {
    console.error('Error creando reserva:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}






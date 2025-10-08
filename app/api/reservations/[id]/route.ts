import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/services/database';
import { CreateReservationData } from '@/services/reservationsAPI';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/reservations/[id] - Obtener reserva por ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const reservation = await database.getById('reservations', params.id);
    
    if (!reservation) {
      return NextResponse.json(
        { error: 'Reserva no encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ data: reservation });
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
    const reservationData: Partial<CreateReservationData & { status?: string }> = await request.json();
    console.log('📝 Datos recibidos para actualizar reserva ID:', params.id);
    console.log('📝 Datos:', JSON.stringify(reservationData, null, 2));
    
    // Obtener la reserva actual
    const currentReservation = await database.getById('reservations', params.id);
    if (!currentReservation) {
      return NextResponse.json(
        { error: 'Reserva no encontrada' },
        { status: 404 }
      );
    }
    console.log('📖 Reserva actual:', JSON.stringify(currentReservation, null, 2));
    
    // Si hay cambios en la duración o se cancela, actualizar horas de la organización
    if (currentReservation.company) {
      const organizaciones = await database.getAll('organizaciones');
      const organizacion = organizaciones.find((org: any) => org.nombre === currentReservation.company);
      
      if (organizacion && organizacion.tieneLimiteHoras) {
        // Calcular duración actual
        const currentStartTime = currentReservation.startTime.split(':');
        const currentEndTime = currentReservation.endTime.split(':');
        const currentStartMinutes = parseInt(currentStartTime[0]) * 60 + parseInt(currentStartTime[1]);
        const currentEndMinutes = parseInt(currentEndTime[0]) * 60 + parseInt(currentEndTime[1]);
        const currentDurationHours = (currentEndMinutes - currentStartMinutes) / 60;
        
        let horasUsadas = organizacion.horasUsadas || 0;
        
        // Si se está cancelando, devolver las horas
        if (reservationData.status === 'cancelled' && currentReservation.status !== 'cancelled') {
          horasUsadas = Math.max(0, horasUsadas - currentDurationHours);
          await database.update('organizaciones', organizacion.id, {
            horasUsadas,
            updatedAt: new Date().toISOString()
          });
        }
        // Si hay cambios en la duración
        else if (reservationData.startTime || reservationData.endTime) {
          const newStartTime = reservationData.startTime || currentReservation.startTime;
          const newEndTime = reservationData.endTime || currentReservation.endTime;
          
          const newStartMinutes = parseInt(newStartTime.split(':')[0]) * 60 + parseInt(newStartTime.split(':')[1]);
          const newEndMinutes = parseInt(newEndTime.split(':')[0]) * 60 + parseInt(newEndTime.split(':')[1]);
          const newDurationHours = (newEndMinutes - newStartMinutes) / 60;
          
          // Calcular diferencia
          const diferencia = newDurationHours - currentDurationHours;
          const nuevasHorasUsadas = horasUsadas + diferencia;
          const limiteHoras = organizacion.limiteHoras || 0;
          
          // Verificar que no exceda el límite
          if (nuevasHorasUsadas > limiteHoras) {
            return NextResponse.json(
              { 
                error: `La actualización excedería el límite de horas de la organización "${organizacion.nombre}". Límite: ${limiteHoras}h, Horas que tendrías usadas: ${nuevasHorasUsadas}h` 
              },
              { status: 400 }
            );
          }
          
          await database.update('organizaciones', organizacion.id, {
            horasUsadas: nuevasHorasUsadas,
            updatedAt: new Date().toISOString()
          });
        }
      }
    }
    
    const updatedReservation = await database.update('reservations', params.id, reservationData);
    console.log('✅ Reserva actualizada en la base de datos:', JSON.stringify(updatedReservation, null, 2));
    return NextResponse.json({ data: updatedReservation });
  } catch (error) {
    console.error('Error actualizando reserva:', error);
    
    if (error instanceof Error && error.message.includes('no encontrado')) {
      return NextResponse.json(
        { error: 'Reserva no encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/reservations/[id] - Eliminar reserva
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Obtener la reserva antes de eliminarla
    const reservation = await database.getById('reservations', params.id);
    if (!reservation) {
      return NextResponse.json(
        { error: 'Reserva no encontrada' },
        { status: 404 }
      );
    }
    
    // Si la reserva no está cancelada, devolver las horas a la organización
    if (reservation.company && reservation.status !== 'cancelled') {
      const organizaciones = await database.getAll('organizaciones');
      const organizacion = organizaciones.find((org: any) => org.nombre === reservation.company);
      
      if (organizacion && organizacion.tieneLimiteHoras) {
        // Calcular duración de la reserva
        const startTime = reservation.startTime.split(':');
        const endTime = reservation.endTime.split(':');
        const startMinutes = parseInt(startTime[0]) * 60 + parseInt(startTime[1]);
        const endMinutes = parseInt(endTime[0]) * 60 + parseInt(endTime[1]);
        const durationHours = (endMinutes - startMinutes) / 60;
        
        const horasUsadas = organizacion.horasUsadas || 0;
        const nuevasHorasUsadas = Math.max(0, horasUsadas - durationHours);
        
        // Actualizar las horas usadas
        await database.update('organizaciones', organizacion.id, {
          horasUsadas: nuevasHorasUsadas,
          updatedAt: new Date().toISOString()
        });
      }
    }
    
    await database.delete('reservations', params.id);
    return NextResponse.json({ message: 'Reserva eliminada correctamente' });
  } catch (error) {
    console.error('Error eliminando reserva:', error);
    
    if (error instanceof Error && error.message.includes('no encontrado')) {
      return NextResponse.json(
        { error: 'Reserva no encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}






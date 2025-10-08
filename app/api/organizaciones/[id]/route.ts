import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/services/database';
import { UpdateOrganizacionData } from '@/types/user-management';

// GET /api/organizaciones/[id] - Obtener una organización por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizacion = await database.getById('organizaciones', params.id);
    
    if (!organizacion) {
      return NextResponse.json(
        { error: 'Organización no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: organizacion });
  } catch (error) {
    console.error('Error obteniendo organización:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/organizaciones/[id] - Actualizar una organización
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizacionData: UpdateOrganizacionData = await request.json();
    const updatedOrganizacion = await database.update('organizaciones', params.id, organizacionData);
    
    if (!updatedOrganizacion) {
      return NextResponse.json(
        { error: 'Organización no encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ data: updatedOrganizacion });
  } catch (error) {
    console.error('Error actualizando organización:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PATCH /api/organizaciones/[id] - Desactivar una organización
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizacion = await database.getById('organizaciones', params.id);
    
    if (!organizacion) {
      return NextResponse.json(
        { error: 'Organización no encontrada' },
        { status: 404 }
      );
    }
    
    const updatedOrganizacion = await database.update('organizaciones', params.id, {
      estado: 'Inactiva'
    });
    
    return NextResponse.json({ data: updatedOrganizacion });
  } catch (error) {
    console.error('Error desactivando organización:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/organizaciones/[id] - Eliminar una organización permanentemente
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizacion = await database.getById('organizaciones', params.id);
    
    if (!organizacion) {
      return NextResponse.json(
        { error: 'Organización no encontrada' },
        { status: 404 }
      );
    }
    
    // Verificar que la organización esté inactiva antes de eliminar
    if (organizacion.estado !== 'Inactiva') {
      return NextResponse.json(
        { error: 'Solo se pueden eliminar organizaciones inactivas. Desactívala primero.' },
        { status: 400 }
      );
    }
    
    await database.delete('organizaciones', params.id);
    return NextResponse.json({ message: 'Organización eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando organización:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}




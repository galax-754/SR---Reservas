import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/services/database';
import { CreateSpaceData } from '@/types/space';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/spaces/[id] - Obtener espacio por ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const space = await database.getById('spaces', params.id);
    
    if (!space) {
      return NextResponse.json(
        { error: 'Espacio no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ data: space });
  } catch (error) {
    console.error('Error obteniendo espacio:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/spaces/[id] - Actualizar espacio
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const spaceData: Partial<CreateSpaceData> = await request.json();
    const updatedSpace = await database.update('spaces', params.id, spaceData);
    return NextResponse.json({ data: updatedSpace });
  } catch (error) {
    console.error('Error actualizando espacio:', error);
    
    if (error instanceof Error && error.message.includes('no encontrado')) {
      return NextResponse.json(
        { error: 'Espacio no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/spaces/[id] - Eliminar espacio
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await database.delete('spaces', params.id);
    return NextResponse.json({ message: 'Espacio eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando espacio:', error);
    
    if (error instanceof Error && error.message.includes('no encontrado')) {
      return NextResponse.json(
        { error: 'Espacio no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}






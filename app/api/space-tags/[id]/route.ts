import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/services/database';
import { CreateTagData } from '@/types/space';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/space-tags/[id] - Obtener etiqueta por ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const tag = await database.getById('spaceTags', params.id);
    
    if (!tag) {
      return NextResponse.json(
        { error: 'Etiqueta no encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ data: tag });
  } catch (error) {
    console.error('Error obteniendo etiqueta:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/space-tags/[id] - Actualizar etiqueta
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const tagData: Partial<CreateTagData> = await request.json();
    const updatedTag = await database.update('spaceTags', params.id, tagData);
    return NextResponse.json({ data: updatedTag });
  } catch (error) {
    console.error('Error actualizando etiqueta:', error);
    
    if (error instanceof Error && error.message.includes('no encontrado')) {
      return NextResponse.json(
        { error: 'Etiqueta no encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/space-tags/[id] - Eliminar etiqueta
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await database.delete('spaceTags', params.id);
    return NextResponse.json({ message: 'Etiqueta eliminada correctamente' });
  } catch (error) {
    console.error('Error eliminando etiqueta:', error);
    
    if (error instanceof Error && error.message.includes('no encontrado')) {
      return NextResponse.json(
        { error: 'Etiqueta no encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}






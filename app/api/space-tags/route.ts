import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/services/database';
import { CreateTagData } from '@/types/space';

// GET /api/space-tags - Obtener todas las etiquetas
export async function GET() {
  try {
    const tags = await database.getAll('spaceTags');
    return NextResponse.json({ data: tags });
  } catch (error) {
    console.error('Error obteniendo etiquetas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/space-tags - Crear nueva etiqueta
export async function POST(request: NextRequest) {
  try {
    const tagData: CreateTagData = await request.json();
    const newTag = await database.create('spaceTags', tagData);
    return NextResponse.json({ data: newTag }, { status: 201 });
  } catch (error) {
    console.error('Error creando etiqueta:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}






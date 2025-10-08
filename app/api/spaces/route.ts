import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/services/database';
import { CreateSpaceData } from '@/types/space';

// GET /api/spaces - Obtener todos los espacios
export async function GET() {
  try {
    const spaces = await database.getAll('spaces');
    return NextResponse.json({ data: spaces });
  } catch (error) {
    console.error('Error obteniendo espacios:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/spaces - Crear nuevo espacio
export async function POST(request: NextRequest) {
  try {
    const spaceData: CreateSpaceData = await request.json();
    const newSpace = await database.create('spaces', spaceData);
    return NextResponse.json({ data: newSpace }, { status: 201 });
  } catch (error) {
    console.error('Error creando espacio:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}






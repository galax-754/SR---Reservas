import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/services/database';
import { CreateOrganizacionData } from '@/types/user-management';

// GET /api/organizaciones - Obtener todas las organizaciones
export async function GET() {
  try {
    const organizaciones = await database.getAll('organizaciones');
    return NextResponse.json({ data: organizaciones });
  } catch (error) {
    console.error('Error obteniendo organizaciones:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/organizaciones - Crear nueva organización
export async function POST(request: NextRequest) {
  try {
    const organizacionData: CreateOrganizacionData = await request.json();
    const newOrganizacion = await database.create('organizaciones', organizacionData);
    return NextResponse.json({ data: newOrganizacion }, { status: 201 });
  } catch (error) {
    console.error('Error creando organización:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}








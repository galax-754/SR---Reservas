import { NextResponse } from 'next/server';
import { database } from '@/services/database';

// GET /api/roles - Obtener todos los roles
export async function GET() {
  try {
    const roles = await database.getAll('roles');
    return NextResponse.json({ data: roles });
  } catch (error) {
    console.error('Error obteniendo roles:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}








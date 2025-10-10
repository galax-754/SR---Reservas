import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { CreateOrganizacionData } from '@/types/user-management';

// GET /api/organizaciones - Obtener todas las organizaciones
export async function GET() {
  try {
    // Verificar que supabaseAdmin esté disponible
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Base de datos no configurada correctamente' },
        { status: 500 }
      );
    }

    const { data: organizaciones, error } = await supabaseAdmin
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error obteniendo organizaciones:', error);
      return NextResponse.json(
        { error: 'Error obteniendo organizaciones de la base de datos' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ data: organizaciones || [] });
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
    // Verificar que supabaseAdmin esté disponible
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Base de datos no configurada correctamente' },
        { status: 500 }
      );
    }

    const organizacionData: CreateOrganizacionData = await request.json();
    
    // Crear la organización en Supabase
    const { data: newOrganizacion, error } = await supabaseAdmin
      .from('organizations')
      .insert({
        name: organizacionData.nombre,
        description: organizacionData.descripcion || '',
        active: organizacionData.estado !== 'Inactiva'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creando organización:', error);
      return NextResponse.json(
        { error: 'Error creando organización en la base de datos' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ data: newOrganizacion }, { status: 201 });
  } catch (error) {
    console.error('Error creando organización:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}









import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { CreateTagData } from '@/types/space';

// GET /api/space-tags - Obtener todas las etiquetas
export async function GET() {
  try {
    // Verificar que supabaseAdmin esté disponible
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Base de datos no configurada correctamente' },
        { status: 500 }
      );
    }

    const { data: tags, error } = await supabaseAdmin
      .from('space_tags')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error obteniendo etiquetas:', error);
      return NextResponse.json(
        { error: 'Error obteniendo etiquetas de la base de datos' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ data: tags || [] });
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
    // Verificar que supabaseAdmin esté disponible
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Base de datos no configurada correctamente' },
        { status: 500 }
      );
    }

    const tagData: CreateTagData = await request.json();
    
    // Crear la etiqueta en Supabase
    const { data: newTag, error } = await supabaseAdmin
      .from('space_tags')
      .insert({
        name: tagData.name,
        color: tagData.color || '#3B82F6'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creando etiqueta:', error);
      return NextResponse.json(
        { error: 'Error creando etiqueta en la base de datos' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ data: newTag }, { status: 201 });
  } catch (error) {
    console.error('Error creando etiqueta:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}






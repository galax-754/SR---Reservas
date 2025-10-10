import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { CreateSpaceData } from '@/types/space';

// GET /api/spaces - Obtener todos los espacios
export async function GET() {
  try {
    // Verificar que supabaseAdmin esté disponible
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Base de datos no configurada correctamente' },
        { status: 500 }
      );
    }

    const { data: spaces, error } = await supabaseAdmin
      .from('spaces')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error obteniendo espacios:', error);
      return NextResponse.json(
        { error: 'Error obteniendo espacios de la base de datos' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ data: spaces || [] });
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
    // Verificar que supabaseAdmin esté disponible
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Base de datos no configurada correctamente' },
        { status: 500 }
      );
    }

    const spaceData: CreateSpaceData = await request.json();
    
    // Crear el espacio en Supabase
    const { data: newSpace, error } = await supabaseAdmin
      .from('spaces')
      .insert({
        id: String(Date.now()), // Generar ID único
        name: spaceData.name,
        capacity: spaceData.capacity,
        description: spaceData.description || '',
        equipment: spaceData.amenities || [],
        tags: spaceData.tags || [],
        image_url: spaceData.backgroundImage || '',
        active: spaceData.isActive !== false
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creando espacio:', error);
      return NextResponse.json(
        { error: 'Error creando espacio en la base de datos' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ data: newSpace }, { status: 201 });
  } catch (error) {
    console.error('Error creando espacio:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}






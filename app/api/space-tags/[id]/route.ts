import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { CreateTagData } from '@/types/space';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/space-tags/[id] - Obtener etiqueta por ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Base de datos no configurada correctamente' },
        { status: 500 }
      );
    }

    const { data: tag, error } = await supabaseAdmin
      .from('space_tags')
      .select('*')
      .eq('id', params.id)
      .single();
    
    if (error || !tag) {
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
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Base de datos no configurada correctamente' },
        { status: 500 }
      );
    }

    const tagData: Partial<CreateTagData> = await request.json();
    
    // Preparar datos para actualización
    const updateData: any = {};
    if (tagData.name) updateData.name = tagData.name;
    if (tagData.color) updateData.color = tagData.color;
    if (tagData.description !== undefined) updateData.description = tagData.description;
    
    const { data: updatedTag, error: updateError } = await supabaseAdmin
      .from('space_tags')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error actualizando etiqueta:', updateError);
      return NextResponse.json(
        { error: 'Error actualizando etiqueta en la base de datos' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ data: updatedTag });
  } catch (error) {
    console.error('Error actualizando etiqueta:', error);
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/space-tags/[id] - Eliminar etiqueta
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Base de datos no configurada correctamente' },
        { status: 500 }
      );
    }

    // Verificar que la etiqueta existe
    const { data: tag, error: getError } = await supabaseAdmin
      .from('space_tags')
      .select('*')
      .eq('id', params.id)
      .single();
    
    if (getError || !tag) {
      return NextResponse.json(
        { error: 'Etiqueta no encontrada' },
        { status: 404 }
      );
    }
    
    // Eliminar la etiqueta
    const { error: deleteError } = await supabaseAdmin
      .from('space_tags')
      .delete()
      .eq('id', params.id);

    if (deleteError) {
      console.error('Error eliminando etiqueta:', deleteError);
      return NextResponse.json(
        { error: 'Error eliminando etiqueta de la base de datos' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ message: 'Etiqueta eliminada correctamente' });
  } catch (error) {
    console.error('Error eliminando etiqueta:', error);
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

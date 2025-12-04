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
    
    // Transformar al formato esperado por el frontend
    const transformedTag = {
      id: tag.id,
      name: tag.name,
      color: tag.color || '#3B82F6',
      allowedDays: tag.allowed_days || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      allowedHours: {
        start: tag.start_time || '08:00',
        end: tag.end_time || '18:00'
      },
      description: tag.description || '',
      createdAt: tag.created_at,
      updatedAt: tag.updated_at
    };
    
    return NextResponse.json({ data: transformedTag });
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
    if (tagData.allowedDays) updateData.allowed_days = tagData.allowedDays;
    if (tagData.allowedHours?.start) updateData.start_time = tagData.allowedHours.start;
    if (tagData.allowedHours?.end) updateData.end_time = tagData.allowedHours.end;
    
    const { data: updatedTag, error: updateError } = await supabaseAdmin
      .from('space_tags')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error actualizando etiqueta:', updateError);
      console.error('Detalles del error de Supabase:', JSON.stringify(updateError, null, 2));
      return NextResponse.json(
        { 
          error: 'Error actualizando etiqueta en la base de datos',
          details: updateError.message || String(updateError),
          code: (updateError as any).code || undefined
        },
        { status: 500 }
      );
    }
    
    // Transformar la respuesta al formato esperado por el frontend
    const transformedTag = {
      id: updatedTag.id,
      name: updatedTag.name,
      color: updatedTag.color || '#3B82F6',
      allowedDays: updatedTag.allowed_days || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      allowedHours: {
        start: updatedTag.start_time || '08:00',
        end: updatedTag.end_time || '18:00'
      },
      description: updatedTag.description || '',
      createdAt: updatedTag.created_at,
      updatedAt: updatedTag.updated_at
    };
    
    return NextResponse.json({ data: transformedTag });
  } catch (error) {
    console.error('Error actualizando etiqueta:', error);
    console.error('Detalles completos del error:', JSON.stringify(error, null, 2));
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
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

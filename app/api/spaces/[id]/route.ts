import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { CreateSpaceData } from '@/types/space';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/spaces/[id] - Obtener espacio por ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Base de datos no configurada correctamente' },
        { status: 500 }
      );
    }

    const { data: space, error } = await supabaseAdmin
      .from('spaces')
      .select('*')
      .eq('id', params.id)
      .single();
    
    if (error || !space) {
      return NextResponse.json(
        { error: 'Espacio no encontrado' },
        { status: 404 }
      );
    }
    
    // Transformar al formato esperado por el frontend
    const transformedSpace = {
      id: space.id,
      name: space.name,
      type: 'meeting-room', // Valor por defecto
      capacity: space.capacity,
      location: '', // Valor por defecto
      amenities: space.equipment || [],
      setupTypes: [], // Valor por defecto
      isActive: space.active,
      requiresCatering: false, // Valor por defecto
      tags: space.tags || [],
      backgroundImage: space.image_url || '',
      description: space.description || '',
      createdAt: space.created_at,
      updatedAt: space.updated_at
    };
    
    return NextResponse.json({ data: transformedSpace });
  } catch (error) {
    console.error('Error obteniendo espacio:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/spaces/[id] - Actualizar espacio
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Base de datos no configurada correctamente' },
        { status: 500 }
      );
    }

    const spaceData: Partial<CreateSpaceData> = await request.json();
    
    // Preparar datos para actualización
    const updateData: any = {};
    
    if (spaceData.name) updateData.name = spaceData.name;
    if (spaceData.capacity) updateData.capacity = spaceData.capacity;
    if (spaceData.description) updateData.description = spaceData.description;
    if (spaceData.amenities) updateData.equipment = spaceData.amenities;
    if (spaceData.tags) updateData.tags = spaceData.tags;
    if (spaceData.backgroundImage) updateData.image_url = spaceData.backgroundImage;
    if (spaceData.isActive !== undefined) updateData.active = spaceData.isActive;
    
    // Actualizar el espacio en Supabase
    const { data: updatedSpace, error: updateError } = await supabaseAdmin
      .from('spaces')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error actualizando espacio:', updateError);
      return NextResponse.json(
        { error: 'Error actualizando espacio en la base de datos' },
        { status: 500 }
      );
    }
    
    // Transformar la respuesta al formato esperado por el frontend
    const transformedSpace = {
      id: updatedSpace.id,
      name: updatedSpace.name,
      type: 'meeting-room',
      capacity: updatedSpace.capacity,
      location: '',
      amenities: updatedSpace.equipment || [],
      setupTypes: [],
      isActive: updatedSpace.active,
      requiresCatering: false,
      tags: updatedSpace.tags || [],
      backgroundImage: updatedSpace.image_url || '',
      description: updatedSpace.description || '',
      createdAt: updatedSpace.created_at,
      updatedAt: updatedSpace.updated_at
    };
    
    return NextResponse.json({ data: transformedSpace });
  } catch (error) {
    console.error('Error actualizando espacio:', error);
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/spaces/[id] - Eliminar espacio
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Base de datos no configurada correctamente' },
        { status: 500 }
      );
    }

    // Verificar que el espacio existe antes de eliminarlo
    const { data: space, error: getError } = await supabaseAdmin
      .from('spaces')
      .select('*')
      .eq('id', params.id)
      .single();
    
    if (getError || !space) {
      return NextResponse.json(
        { error: 'Espacio no encontrado' },
        { status: 404 }
      );
    }
    
    // Eliminar el espacio de Supabase
    const { error: deleteError } = await supabaseAdmin
      .from('spaces')
      .delete()
      .eq('id', params.id);

    if (deleteError) {
      console.error('Error eliminando espacio:', deleteError);
      return NextResponse.json(
        { error: 'Error eliminando espacio de la base de datos' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ message: 'Espacio eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando espacio:', error);
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}






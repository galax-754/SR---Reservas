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
    
    // Transformar datos de Supabase al formato esperado por el frontend
    const spacesTransformados = (spaces || []).map((space: any) => ({
      id: space.id,
      name: space.name,
      type: space.type || 'meeting-room',
      capacity: space.capacity,
      location: space.location || '',
      amenities: space.equipment || [],
      setupTypes: space.setup_types || [],
      isActive: space.active,
      requiresCatering: space.requires_catering || false,
      requiresGuestList: space.requires_guest_list || false,
      availableHours: space.available_hours || null,
      tags: space.tags || [],
      backgroundImage: space.image_url || '',
      description: space.description || '',
      createdAt: space.created_at,
      updatedAt: space.updated_at
    }));
    
    return NextResponse.json({ data: spacesTransformados });
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
        id: crypto.randomUUID(), // Generar ID único
        name: spaceData.name,
        type: spaceData.type || 'meeting-room',
        capacity: spaceData.capacity,
        location: spaceData.location || '',
        description: spaceData.description || '',
        equipment: spaceData.amenities || [],
        setup_types: spaceData.setupTypes || [],
        requires_catering: spaceData.requiresCatering || false,
        requires_guest_list: spaceData.requiresGuestList || false,
        available_hours: spaceData.availableHours || null,
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
    
    // Transformar la respuesta al formato esperado por el frontend
    const transformedSpace = {
      id: newSpace.id,
      name: newSpace.name,
      type: newSpace.type || 'meeting-room',
      capacity: newSpace.capacity,
      location: newSpace.location || '',
      amenities: newSpace.equipment || [],
      setupTypes: newSpace.setup_types || [],
      isActive: newSpace.active,
      requiresCatering: newSpace.requires_catering || false,
      requiresGuestList: newSpace.requires_guest_list || false,
      availableHours: newSpace.available_hours || null,
      tags: newSpace.tags || [],
      backgroundImage: newSpace.image_url || '',
      description: newSpace.description || '',
      createdAt: newSpace.created_at,
      updatedAt: newSpace.updated_at
    };
    
    return NextResponse.json({ data: transformedSpace }, { status: 201 });
  } catch (error) {
    console.error('Error creando espacio:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}






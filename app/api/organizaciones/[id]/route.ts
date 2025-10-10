import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { UpdateOrganizacionData } from '@/types/user-management';

// GET /api/organizaciones/[id] - Obtener una organización por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Base de datos no configurada correctamente' },
        { status: 500 }
      );
    }

    const { data: organizacion, error } = await supabaseAdmin
      .from('organizations')
      .select('*')
      .eq('id', params.id)
      .single();
    
    if (error || !organizacion) {
      return NextResponse.json(
        { error: 'Organización no encontrada' },
        { status: 404 }
      );
    }

    // Transformar al formato esperado por el frontend
    const organizacionTransformada = {
      id: organizacion.id,
      nombre: organizacion.name,
      tipo: 'Interna',
      estado: organizacion.active ? 'Activa' : 'Inactiva',
      descripcion: organizacion.description || '',
      contacto: '',
      telefono: '',
      correo: '',
      tieneLimiteHoras: false,
      limiteHorasMensuales: 0,
      horasUsadas: 0,
      createdAt: organizacion.created_at,
      updatedAt: organizacion.updated_at
    };

    return NextResponse.json({ data: organizacionTransformada });
  } catch (error) {
    console.error('Error obteniendo organización:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/organizaciones/[id] - Actualizar una organización
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Base de datos no configurada correctamente' },
        { status: 500 }
      );
    }

    const organizacionData: UpdateOrganizacionData = await request.json();
    
    const { data: updatedOrganizacion, error } = await supabaseAdmin
      .from('organizations')
      .update({
        name: organizacionData.nombre,
        description: organizacionData.descripcion,
        active: organizacionData.estado !== 'Inactiva'
      })
      .eq('id', params.id)
      .select()
      .single();
    
    if (error || !updatedOrganizacion) {
      return NextResponse.json(
        { error: 'Organización no encontrada' },
        { status: 404 }
      );
    }
    
    // Transformar al formato esperado
    const organizacionTransformada = {
      id: updatedOrganizacion.id,
      nombre: updatedOrganizacion.name,
      tipo: 'Interna',
      estado: updatedOrganizacion.active ? 'Activa' : 'Inactiva',
      descripcion: updatedOrganizacion.description || '',
      contacto: '',
      telefono: '',
      correo: '',
      tieneLimiteHoras: false,
      limiteHorasMensuales: 0,
      horasUsadas: 0,
      createdAt: updatedOrganizacion.created_at,
      updatedAt: updatedOrganizacion.updated_at
    };
    
    return NextResponse.json({ data: organizacionTransformada });
  } catch (error) {
    console.error('Error actualizando organización:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PATCH /api/organizaciones/[id] - Desactivar una organización
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Base de datos no configurada correctamente' },
        { status: 500 }
      );
    }

    const { data: organizacion, error: getError } = await supabaseAdmin
      .from('organizations')
      .select('*')
      .eq('id', params.id)
      .single();
    
    if (getError || !organizacion) {
      return NextResponse.json(
        { error: 'Organización no encontrada' },
        { status: 404 }
      );
    }
    
    const { data: updatedOrganizacion, error: updateError } = await supabaseAdmin
      .from('organizations')
      .update({ active: false })
      .eq('id', params.id)
      .select()
      .single();
    
    if (updateError) {
      return NextResponse.json(
        { error: 'Error desactivando organización' },
        { status: 500 }
      );
    }

    const organizacionTransformada = {
      id: updatedOrganizacion.id,
      nombre: updatedOrganizacion.name,
      tipo: 'Interna',
      estado: 'Inactiva',
      descripcion: updatedOrganizacion.description || '',
      contacto: '',
      telefono: '',
      correo: '',
      tieneLimiteHoras: false,
      limiteHorasMensuales: 0,
      horasUsadas: 0,
      createdAt: updatedOrganizacion.created_at,
      updatedAt: updatedOrganizacion.updated_at
    };
    
    return NextResponse.json({ data: organizacionTransformada });
  } catch (error) {
    console.error('Error desactivando organización:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/organizaciones/[id] - Eliminar una organización permanentemente
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Base de datos no configurada correctamente' },
        { status: 500 }
      );
    }

    const { data: organizacion, error: getError } = await supabaseAdmin
      .from('organizations')
      .select('*')
      .eq('id', params.id)
      .single();
    
    if (getError || !organizacion) {
      return NextResponse.json(
        { error: 'Organización no encontrada' },
        { status: 404 }
      );
    }
    
    // Verificar que la organización esté inactiva antes de eliminar
    if (organizacion.active) {
      return NextResponse.json(
        { error: 'Solo se pueden eliminar organizaciones inactivas. Desactívala primero.' },
        { status: 400 }
      );
    }
    
    const { error: deleteError } = await supabaseAdmin
      .from('organizations')
      .delete()
      .eq('id', params.id);

    if (deleteError) {
      return NextResponse.json(
        { error: 'Error eliminando organización' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ message: 'Organización eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando organización:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}




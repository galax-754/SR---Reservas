import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { UpdateUsuarioData } from '@/types/user-management';

// GET /api/usuarios/[id] - Obtener un usuario por ID
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

    const { data: usuario, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', params.id)
      .single();
    
    if (error || !usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Excluir password de la respuesta
    const { password: _, ...usuarioSinPassword } = usuario;
    return NextResponse.json({ data: usuarioSinPassword });
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/usuarios/[id] - Actualizar un usuario
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

    const usuarioData: UpdateUsuarioData = await request.json();
    
    // Validación de seguridad: No permitir asignación de Super Administrador
    if (usuarioData.rol === 'Super Administrador') {
      return NextResponse.json(
        { error: 'No tienes permisos para asignar este rol' },
        { status: 403 }
      );
    }
    
    // Validar formato de email si se está actualizando
    if (usuarioData.correo) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(usuarioData.correo)) {
        return NextResponse.json(
          { error: 'Formato de correo electrónico inválido' },
          { status: 400 }
        );
      }
      
      // Verificar si el correo ya existe en otro usuario
      const { data: usuariosExistentes } = await supabaseAdmin
        .from('users')
        .select('id, correo')
        .neq('id', params.id)
        .ilike('correo', usuarioData.correo);
      
      if (usuariosExistentes && usuariosExistentes.length > 0) {
        return NextResponse.json(
          { error: 'Ya existe otro usuario con este correo electrónico' },
          { status: 409 }
        );
      }
    }
    
    // Preparar datos para actualización
    const updateData: any = {};
    if (usuarioData.nombre) updateData.nombre = usuarioData.nombre;
    if (usuarioData.correo) updateData.correo = usuarioData.correo.toLowerCase();
    if (usuarioData.organizacion) updateData.organizacion = usuarioData.organizacion;
    if (usuarioData.rol) updateData.rol = usuarioData.rol;
    if (usuarioData.estado) updateData.estado = usuarioData.estado;
    if (usuarioData.assignedSpaceId !== undefined) updateData.assigned_space_id = usuarioData.assignedSpaceId;
    
    const { data: updatedUsuario, error: updateError } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error actualizando usuario:', updateError);
      return NextResponse.json(
        { error: 'Error actualizando usuario en la base de datos' },
        { status: 500 }
      );
    }
    
    // Excluir password de la respuesta
    const { password: _, ...usuarioSinPassword } = updatedUsuario;
    return NextResponse.json({ data: usuarioSinPassword });
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/usuarios/[id] - Eliminar un usuario
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

    // Verificar que el usuario existe
    const { data: usuario, error: getError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', params.id)
      .single();
    
    if (getError || !usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }
    
    // Eliminar el usuario
    const { error: deleteError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', params.id);

    if (deleteError) {
      console.error('Error eliminando usuario:', deleteError);
      return NextResponse.json(
        { error: 'Error eliminando usuario de la base de datos' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PATCH /api/usuarios/[id] - Desactivar un usuario
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

    const { data: updatedUsuario, error: updateError } = await supabaseAdmin
      .from('users')
      .update({ estado: 'Inactivo' })
      .eq('id', params.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error desactivando usuario:', updateError);
      return NextResponse.json(
        { error: 'Error desactivando usuario en la base de datos' },
        { status: 500 }
      );
    }
    
    // Excluir password de la respuesta
    const { password: _, ...usuarioSinPassword } = updatedUsuario;
    return NextResponse.json({ data: usuarioSinPassword });
  } catch (error) {
    console.error('Error desactivando usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}


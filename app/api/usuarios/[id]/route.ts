import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/services/database';
import { UpdateUsuarioData } from '@/types/user-management';

// GET /api/usuarios/[id] - Obtener un usuario por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const usuario = await database.getById('usuarios', params.id);
    
    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: usuario });
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
      const usuariosExistentes = await database.getAll('usuarios');
      const correoExiste = usuariosExistentes.some(
        (u: any) => u.correo.toLowerCase() === usuarioData.correo.toLowerCase() && u.id !== params.id
      );
      
      if (correoExiste) {
        return NextResponse.json(
          { error: 'Ya existe otro usuario con este correo electrónico' },
          { status: 409 }
        );
      }
    }
    
    const updatedUsuario = await database.update('usuarios', params.id, usuarioData);
    return NextResponse.json({ data: updatedUsuario });
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
    await database.delete('usuarios', params.id);
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
    const updatedUsuario = await database.update('usuarios', params.id, { estado: 'Inactivo' });
    return NextResponse.json({ data: updatedUsuario });
  } catch (error) {
    console.error('Error desactivando usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}


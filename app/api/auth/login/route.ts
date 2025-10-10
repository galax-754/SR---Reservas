import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/services/database';
import { authService } from '@/services/auth';
import type { Usuario } from '@/types/user-management';

// POST /api/auth/login - Autenticar usuario
export async function POST(request: NextRequest) {
  try {
    const { correo, password } = await request.json();

    if (!correo || !password) {
      return NextResponse.json(
        { error: 'Correo y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Buscar usuario por correo
    const usuarios = await database.getAll<Usuario>('usuarios');
    const usuario = usuarios.find(u => u.correo.toLowerCase() === correo.toLowerCase());

    if (!usuario) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Verificar que el usuario esté activo
    if (usuario.estado !== 'Activo') {
      return NextResponse.json(
        { error: 'Tu cuenta no está activa. Contacta al administrador.' },
        { status: 403 }
      );
    }

    // Verificar contraseña
    const isValidPassword = await authService.verifyPassword(password, usuario.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // No enviar el password en la respuesta
    const { password: _, ...userWithoutPassword } = usuario;

    return NextResponse.json({
      message: 'Login exitoso',
      user: userWithoutPassword,
      requirePasswordChange: usuario.temporaryPassword
    });

  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}







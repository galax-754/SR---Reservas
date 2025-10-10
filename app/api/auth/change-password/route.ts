import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/services/database';
import { authService } from '@/services/auth';
import { emailService } from '@/services/email';
import type { Usuario } from '@/types/user-management';

// POST /api/auth/change-password - Cambiar contraseña
export async function POST(request: NextRequest) {
  try {
    const { userId, oldPassword, newPassword } = await request.json();

    if (!userId || !oldPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Validar fortaleza de la nueva contraseña
    const validation = authService.validatePasswordStrength(newPassword);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.message },
        { status: 400 }
      );
    }

    // Obtener usuario
    const usuario = await database.getById<Usuario>('usuarios', userId);

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar contraseña actual
    const isValidOldPassword = await authService.verifyPassword(oldPassword, usuario.password);

    if (!isValidOldPassword) {
      return NextResponse.json(
        { error: 'La contraseña actual es incorrecta' },
        { status: 401 }
      );
    }

    // Hashear nueva contraseña
    const hashedPassword = await authService.hashPassword(newPassword);

    // Actualizar usuario
    const updatedUser = await database.update<Usuario>('usuarios', userId, {
      password: hashedPassword,
      temporaryPassword: false,
      lastPasswordChange: new Date().toISOString()
    });

    // Enviar email de confirmación (sin bloquear la respuesta)
    emailService.sendPasswordChangeConfirmation(usuario.correo, usuario.nombre)
      .catch(err => console.error('Error enviando email de confirmación:', err));

    // No enviar el password en la respuesta
    const { password: _, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({
      message: 'Contraseña actualizada exitosamente',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}







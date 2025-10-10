import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { authService } from '@/services/auth';
import { emailService } from '@/services/email';

// POST /api/auth/change-password - Cambiar contraseña
export async function POST(request: NextRequest) {
  try {
    // Verificar que supabaseAdmin esté disponible
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Base de datos no configurada correctamente' },
        { status: 500 }
      );
    }

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

    // Obtener usuario de Supabase
    const { data: usuario, error: getUserError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (getUserError || !usuario) {
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

    // Actualizar usuario en Supabase
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        password: hashedPassword,
        temporary_password: false,
        last_password_change: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error actualizando contraseña:', updateError);
      return NextResponse.json(
        { error: 'Error actualizando contraseña' },
        { status: 500 }
      );
    }

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







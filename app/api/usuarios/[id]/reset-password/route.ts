import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { authService } from '@/services/auth';
import { emailService } from '@/services/email';

/**
 * POST /api/usuarios/[id]/reset-password
 * Resetea la contraseña de un usuario y envía email con contraseña temporal
 */
export async function POST(
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

    const userId = params.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'ID de usuario requerido' },
        { status: 400 }
      );
    }

    // Buscar el usuario
    const { data: usuario, error: getError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (getError || !usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Generar contraseña temporal
    const temporaryPassword = authService.generateTemporaryPassword();
    
    // Encriptar la contraseña temporal
    const hashedPassword = await authService.hashPassword(temporaryPassword);

    // Actualizar usuario
    const { data: updatedUsuario, error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        password: hashedPassword,
        temporary_password: true,
        estado: 'Pendiente', // Usuario vuelve a estar pendiente hasta que cambie la contraseña
        last_password_change: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error actualizando contraseña:', updateError);
      return NextResponse.json(
        { error: 'Error reseteando contraseña en la base de datos' },
        { status: 500 }
      );
    }

    // Enviar email con contraseña temporal
    try {
      await emailService.sendPasswordResetEmail(
        usuario.correo,
        usuario.nombre,
        temporaryPassword,
        usuario.rol
      );
      
      console.log(`✅ Email de reseteo de contraseña enviado a ${usuario.correo}`);
    } catch (emailError) {
      console.error('❌ Error enviando email de reseteo:', emailError);
      // No fallar la operación si el email falla
    }

    // Remover la contraseña de la respuesta
    const { password, ...usuarioResponse } = updatedUsuario;

    return NextResponse.json({
      success: true,
      message: 'Contraseña reseteada exitosamente. Email enviado con la nueva contraseña temporal.',
      data: usuarioResponse
    });

  } catch (error) {
    console.error('Error reseteando contraseña:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

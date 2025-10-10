import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { authService } from '@/services/auth';

// POST /api/auth/login - Autenticar usuario
export async function POST(request: NextRequest) {
  try {
    // Verificar que supabaseAdmin esté disponible
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Base de datos no configurada correctamente' },
        { status: 500 }
      );
    }

    const { correo, password } = await request.json();

    if (!correo || !password) {
      return NextResponse.json(
        { error: 'Correo y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Buscar usuario por correo en Supabase
    const { data: usuario, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('correo', correo.toLowerCase())
      .single();

    if (error || !usuario) {
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

    // No enviar el password en la respuesta y transformar campos
    const { password, assigned_space_id, ...userWithoutPassword } = usuario;
    const userTransformado = {
      ...userWithoutPassword,
      assignedSpaceId: assigned_space_id || undefined
    };

    return NextResponse.json({
      message: 'Login exitoso',
      user: userTransformado,
      requirePasswordChange: usuario.temporary_password
    });

  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}







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

    // Verificar contraseña primero
    const isValidPassword = await authService.verifyPassword(password, usuario.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Si el usuario tiene contraseña temporal, permitir acceso y activarlo automáticamente
    // Esto permite que usuarios pendientes inicien sesión con su contraseña temporal
    if (usuario.temporary_password) {
      // Si el usuario está pendiente o inactivo pero tiene contraseña temporal válida,
      // activarlo automáticamente al iniciar sesión
      if (usuario.estado !== 'Activo') {
        const { error: updateError } = await supabaseAdmin
          .from('users')
          .update({ estado: 'Activo' })
          .eq('id', usuario.id);

        if (updateError) {
          console.error('Error activando usuario:', updateError);
          // Continuar con el login aunque falle la actualización
        } else {
          // Actualizar el objeto usuario con el nuevo estado
          usuario.estado = 'Activo';
          console.log(`✅ Usuario ${usuario.correo} activado automáticamente al iniciar sesión`);
        }
      }
    } else {
      // Si no tiene contraseña temporal, verificar que el usuario esté activo
      if (usuario.estado !== 'Activo') {
        return NextResponse.json(
          { error: 'Tu cuenta no está activa. Contacta al administrador.' },
          { status: 403 }
        );
      }
    }

    // No enviar el password en la respuesta y transformar campos
    const userWithoutPassword = {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      organizacion: usuario.organizacion,
      rol: usuario.rol,
      estado: usuario.estado,
      temporary_password: usuario.temporary_password,
      last_password_change: usuario.last_password_change,
      created_at: usuario.created_at,
      updated_at: usuario.updated_at,
      assignedSpaceId: usuario.assigned_space_id || undefined
    };

    return NextResponse.json({
      message: 'Login exitoso',
      user: userWithoutPassword,
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







import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { authService } from '@/services/auth';
import { emailService } from '@/services/email';
import { CreateUsuarioData } from '@/types/user-management';

// GET /api/usuarios - Obtener todos los usuarios
export async function GET() {
  try {
    // Verificar que supabaseAdmin esté disponible
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Base de datos no configurada correctamente' },
        { status: 500 }
      );
    }

    const { data: usuarios, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error obteniendo usuarios:', error);
      return NextResponse.json(
        { error: 'Error obteniendo usuarios de la base de datos' },
        { status: 500 }
      );
    }
    
    // Remover contraseñas de la respuesta y transformar campos
    const usuariosSinPassword = usuarios?.map((u: any) => {
      const { password, assigned_space_id, ...userWithoutPassword } = u;
      return {
        ...userWithoutPassword,
        assignedSpaceId: assigned_space_id || undefined
      };
    }) || [];
    
    return NextResponse.json({ data: usuariosSinPassword });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/usuarios - Crear nuevo usuario
export async function POST(request: NextRequest) {
  try {
    // Verificar que supabaseAdmin esté disponible
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Base de datos no configurada correctamente' },
        { status: 500 }
      );
    }

    const usuarioData: CreateUsuarioData = await request.json();
    
    // Validación de seguridad: No permitir creación de Super Administradores
    if (usuarioData.rol === 'Super Administrador') {
      return NextResponse.json(
        { error: 'No tienes permisos para asignar este rol' },
        { status: 403 }
      );
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(usuarioData.correo)) {
      return NextResponse.json(
        { error: 'Formato de correo electrónico inválido' },
        { status: 400 }
      );
    }
    
    // Verificar si el correo ya existe
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('correo', usuarioData.correo.toLowerCase())
      .single();
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Ya existe un usuario con este correo electrónico' },
        { status: 409 }
      );
    }
    
    // Validar que si es tablet, debe tener un espacio asignado
    if (usuarioData.rol.toLowerCase() === 'tablet' && !usuarioData.assignedSpaceId) {
      return NextResponse.json(
        { error: 'Los usuarios tipo Tablet deben tener un espacio asignado' },
        { status: 400 }
      );
    }
    
    // Generar contraseña temporal
    const temporaryPassword = authService.generateTemporaryPassword();
    
    // Hashear contraseña
    const hashedPassword = await authService.hashPassword(temporaryPassword);
    
    // Crear usuario con contraseña hasheada
    const { data: newUsuario, error: createError } = await supabaseAdmin
      .from('users')
      .insert({
        id: String(Date.now()), // Generar ID único
        nombre: usuarioData.nombre,
        correo: usuarioData.correo.toLowerCase(),
        organizacion: usuarioData.organizacion,
        rol: usuarioData.rol,
        password: hashedPassword,
        temporary_password: true,
        estado: 'Pendiente', // Usuario pendiente hasta que cambie su contraseña temporal
        assigned_space_id: usuarioData.assignedSpaceId || null,
        last_password_change: new Date().toISOString()
      })
      .select()
      .single();
    
    if (createError) {
      console.error('Error creando usuario:', createError);
      return NextResponse.json(
        { error: 'Error creando usuario en la base de datos' },
        { status: 500 }
      );
    }
    
    // Enviar email de bienvenida
    try {
      await emailService.sendWelcomeEmail(
        newUsuario.correo,
        newUsuario.nombre,
        temporaryPassword,
        newUsuario.rol
      );
      console.log(`✅ Email de bienvenida enviado exitosamente a ${newUsuario.correo}`);
    } catch (emailError) {
      console.error('❌ Error enviando email de bienvenida:', emailError);
      console.error('❌ Detalles del error:', JSON.stringify(emailError, null, 2));
      // No lanzamos error para que el usuario se cree de todos modos
    }
    
    // Remover password de la respuesta y transformar campos
    const { password, assigned_space_id, ...usuarioSinPassword } = newUsuario;
    const usuarioTransformado = {
      ...usuarioSinPassword,
      assignedSpaceId: assigned_space_id || undefined
    };
    
    return NextResponse.json({ 
      data: usuarioTransformado,
      message: 'Usuario creado exitosamente. Se ha enviado un correo con las credenciales de acceso.'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creando usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}


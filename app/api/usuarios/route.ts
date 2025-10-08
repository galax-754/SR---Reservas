import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/services/database';
import { authService } from '@/services/auth';
import { emailService } from '@/services/email';
import { CreateUsuarioData } from '@/types/user-management';

// GET /api/usuarios - Obtener todos los usuarios
export async function GET() {
  try {
    const usuarios = await database.getAll('usuarios');
    
    // Remover contraseñas de la respuesta
    const usuariosSinPassword = usuarios.map((u: any) => {
      const { password, ...userWithoutPassword } = u;
      return userWithoutPassword;
    });
    
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
    const usuariosExistentes = await database.getAll('usuarios');
    const correoExiste = usuariosExistentes.some(
      (u: any) => u.correo.toLowerCase() === usuarioData.correo.toLowerCase()
    );
    
    if (correoExiste) {
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
    const newUsuario = await database.create('usuarios', {
      ...usuarioData,
      password: hashedPassword,
      temporaryPassword: true,
      estado: 'Activo', // Activar inmediatamente al crear
      lastPasswordChange: new Date().toISOString()
    });
    
    // Enviar email de bienvenida (asíncrono, no bloquea)
    emailService.sendWelcomeEmail(
      newUsuario.correo,
      newUsuario.nombre,
      temporaryPassword,
      newUsuario.rol
    ).catch(err => {
      console.error('Error enviando email de bienvenida:', err);
      // No lanzamos error para que el usuario se cree de todos modos
    });
    
    // Remover password de la respuesta
    const { password, ...usuarioSinPassword } = newUsuario;
    
    return NextResponse.json({ 
      data: usuarioSinPassword,
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


import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcrypt';
import { emailService } from '@/services/email';

const USUARIOS_FILE = path.join(process.cwd(), 'bd', 'usuarios.json');

/**
 * POST /api/usuarios/[id]/reset-password
 * Resetea la contraseña de un usuario y envía email con contraseña temporal
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'ID de usuario requerido' },
        { status: 400 }
      );
    }

    // Leer usuarios actuales
    const usuariosData = await fs.readFile(USUARIOS_FILE, 'utf-8');
    const usuarios = JSON.parse(usuariosData);

    // Buscar el usuario
    const usuarioIndex = usuarios.findIndex((u: any) => u.id === userId);
    
    if (usuarioIndex === -1) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const usuario = usuarios[usuarioIndex];

    // Generar contraseña temporal (8 caracteres alfanuméricos)
    const generateTemporaryPassword = (): string => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    const temporaryPassword = generateTemporaryPassword();
    
    // Encriptar la contraseña temporal
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    // Actualizar usuario
    const updatedUsuario = {
      ...usuario,
      password: hashedPassword,
      temporaryPassword: true,
      lastPasswordChange: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    usuarios[usuarioIndex] = updatedUsuario;

    // Guardar usuarios actualizados
    await fs.writeFile(USUARIOS_FILE, JSON.stringify(usuarios, null, 2));

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

    // Remover la contraseña temporal de la respuesta
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

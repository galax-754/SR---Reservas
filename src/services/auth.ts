import bcrypt from 'bcrypt';
import crypto from 'crypto';

/**
 * Servicio de autenticación con bcrypt
 * Maneja hash de contraseñas, validación y generación de contraseñas temporales
 */

const SALT_ROUNDS = 10;

export class AuthService {
  /**
   * Genera una contraseña temporal aleatoria y segura
   * @returns string - Contraseña temporal (8 caracteres alfanuméricos)
   */
  generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    const length = 8;
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return password;
  }

  /**
   * Hashea una contraseña usando bcrypt
   * @param password - Contraseña en texto plano
   * @returns Promise<string> - Hash de la contraseña
   */
  async hashPassword(password: string): Promise<string> {
    try {
      const hash = await bcrypt.hash(password, SALT_ROUNDS);
      return hash;
    } catch (error) {
      console.error('Error hasheando contraseña:', error);
      throw new Error('Error al procesar la contraseña');
    }
  }

  /**
   * Verifica si una contraseña coincide con su hash
   * @param password - Contraseña en texto plano
   * @param hash - Hash almacenado
   * @returns Promise<boolean> - true si coincide, false si no
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      const isValid = await bcrypt.compare(password, hash);
      return isValid;
    } catch (error) {
      console.error('Error verificando contraseña:', error);
      return false;
    }
  }

  /**
   * Valida la fortaleza de una contraseña
   * @param password - Contraseña a validar
   * @returns { valid: boolean, message?: string }
   */
  validatePasswordStrength(password: string): { valid: boolean, message?: string } {
    if (password.length < 8) {
      return {
        valid: false,
        message: 'La contraseña debe tener al menos 8 caracteres'
      };
    }

    if (!/[A-Z]/.test(password)) {
      return {
        valid: false,
        message: 'La contraseña debe contener al menos una mayúscula'
      };
    }

    if (!/[a-z]/.test(password)) {
      return {
        valid: false,
        message: 'La contraseña debe contener al menos una minúscula'
      };
    }

    if (!/[0-9]/.test(password)) {
      return {
        valid: false,
        message: 'La contraseña debe contener al menos un número'
      };
    }

    return { valid: true };
  }
}

export const authService = new AuthService();







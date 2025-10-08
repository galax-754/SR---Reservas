import { Resend } from 'resend';

/**
 * Servicio de envío de emails con Resend
 * Maneja todos los emails del sistema: bienvenida, contraseñas temporales, etc.
 * 
 * MODO DESARROLLO: Si no hay API key configurada, solo logea los emails en consola
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

// Solo crear instancia de Resend si hay API key configurada
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export class EmailService {
  /**
   * Envía email de bienvenida con contraseña temporal
   * @param to - Email del destinatario
   * @param name - Nombre del usuario
   * @param temporaryPassword - Contraseña temporal generada
   * @param role - Rol del usuario
   */
  async sendWelcomeEmail(
    to: string,
    name: string,
    temporaryPassword: string,
    role: string
  ): Promise<void> {
    try {
      const roleNames: Record<string, string> = {
        'administrador': 'Administrador',
        'usuario': 'Usuario',
        'tablet': 'Tablet'
      };

      const roleName = roleNames[role.toLowerCase()] || role;

      // Si no hay Resend configurado, solo logear en consola
      if (!resend) {
        console.log('\n📧 ═══════════════════════════════════════════════════════');
        console.log('📨 EMAIL DE BIENVENIDA (Modo Desarrollo - No enviado)');
        console.log('═══════════════════════════════════════════════════════');
        console.log(`👤 Para: ${to}`);
        console.log(`📝 Nombre: ${name}`);
        console.log(`🎭 Rol: ${roleName}`);
        console.log(`🔐 Contraseña temporal: ${temporaryPassword}`);
        console.log(`🔗 URL: ${APP_URL}/login`);
        console.log('═══════════════════════════════════════════════════════\n');
        console.log('⚠️  Para enviar emails reales, configura RESEND_API_KEY en .env.local');
        console.log('   Ver instrucciones en: ENV_SETUP.md\n');
        return;
      }

      await resend.emails.send({
        from: FROM_EMAIL,
        to: to,
        subject: '¡Bienvenido al Sistema de Reservas! - Credenciales de acceso',
        html: `
          <!DOCTYPE html>
          <html lang="es">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bienvenido</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="padding: 40px 0;">
                  <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                          ¡Bienvenido!
                        </h1>
                      </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                      <td style="padding: 40px;">
                        <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                          Hola <strong>${name}</strong>,
                        </p>
                        
                        <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.6;">
                          Tu cuenta ha sido creada exitosamente en el Sistema de Reservas con el rol de <strong>${roleName}</strong>.
                        </p>

                        <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.6;">
                          A continuación, encontrarás tus credenciales de acceso:
                        </p>

                        <!-- Credentials Box -->
                        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8f9fa; border-radius: 6px; margin: 30px 0;">
                          <tr>
                            <td style="padding: 30px;">
                              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                  <td style="padding: 8px 0;">
                                    <span style="color: #666666; font-size: 14px; display: block; margin-bottom: 4px;">Correo electrónico:</span>
                                    <span style="color: #333333; font-size: 16px; font-weight: 600;">${to}</span>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="padding: 8px 0;">
                                    <span style="color: #666666; font-size: 14px; display: block; margin-bottom: 4px;">Contraseña temporal:</span>
                                    <span style="color: #333333; font-size: 18px; font-weight: 700; font-family: 'Courier New', monospace; background-color: #ffffff; padding: 8px 12px; border-radius: 4px; display: inline-block;">${temporaryPassword}</span>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>

                        <!-- Security Notice -->
                        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px; margin: 30px 0;">
                          <tr>
                            <td style="padding: 16px 20px;">
                              <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                                <strong>⚠️ Importante:</strong> Por seguridad, deberás cambiar esta contraseña la primera vez que inicies sesión.
                              </p>
                            </td>
                          </tr>
                        </table>

                        <!-- CTA Button -->
                        <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                          <tr>
                            <td align="center">
                              <a href="${APP_URL}/login" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                Iniciar Sesión Ahora
                              </a>
                            </td>
                          </tr>
                        </table>

                        <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                          Si tienes alguna pregunta o necesitas ayuda, no dudes en contactar al administrador del sistema.
                        </p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="padding: 30px 40px; text-align: center; background-color: #f8f9fa; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;">
                        <p style="margin: 0; color: #999999; font-size: 12px; line-height: 1.6;">
                          Este es un correo automático del Sistema de Reservas.<br/>
                          Por favor, no respondas a este mensaje.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      });

      console.log(`✅ Email de bienvenida enviado a ${to}`);
    } catch (error) {
      console.error('❌ Error enviando email de bienvenida:', error);
      throw new Error('No se pudo enviar el email de bienvenida');
    }
  }

  /**
   * Envía email de reseteo de contraseña con contraseña temporal
   * @param to - Email del destinatario
   * @param name - Nombre del usuario
   * @param temporaryPassword - Contraseña temporal generada
   * @param role - Rol del usuario
   */
  async sendPasswordResetEmail(
    to: string,
    name: string,
    temporaryPassword: string,
    role: string
  ): Promise<void> {
    try {
      const roleNames: Record<string, string> = {
        'administrador': 'Administrador',
        'usuario': 'Usuario',
        'tablet': 'Tablet'
      };

      const roleName = roleNames[role.toLowerCase()] || role;

      // Si no hay Resend configurado, solo logear en consola
      if (!resend) {
        console.log('\n🔄 ═══════════════════════════════════════════════════════');
        console.log('📨 EMAIL DE RESETEO DE CONTRASEÑA (Modo Desarrollo - No enviado)');
        console.log('═══════════════════════════════════════════════════════');
        console.log(`👤 Para: ${to}`);
        console.log(`📝 Nombre: ${name}`);
        console.log(`🎭 Rol: ${roleName}`);
        console.log(`🔐 Nueva contraseña temporal: ${temporaryPassword}`);
        console.log(`🔗 URL: ${APP_URL}/login`);
        console.log('═══════════════════════════════════════════════════════\n');
        console.log('⚠️  Para enviar emails reales, configura RESEND_API_KEY en .env.local');
        return;
      }

      await resend.emails.send({
        from: FROM_EMAIL,
        to: to,
        subject: 'Contraseña reseteada - Nueva contraseña temporal',
        html: `
          <!DOCTYPE html>
          <html lang="es">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Contraseña Reseteada</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="padding: 40px 0;">
                  <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 8px 8px 0 0;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                          Contraseña Reseteada
                        </h1>
                      </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                      <td style="padding: 40px;">
                        <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                          Hola <strong>${name}</strong>,
                        </p>
                        
                        <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.6;">
                          Tu contraseña ha sido reseteada por un administrador del sistema. Se ha generado una nueva contraseña temporal para tu cuenta con rol de <strong>${roleName}</strong>.
                        </p>

                        <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.6;">
                          A continuación, encontrarás tus nuevas credenciales de acceso:
                        </p>

                        <!-- Credentials Box -->
                        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fef3c7; border-radius: 6px; margin: 30px 0;">
                          <tr>
                            <td style="padding: 30px;">
                              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                  <td style="padding: 8px 0;">
                                    <span style="color: #92400e; font-size: 14px; display: block; margin-bottom: 4px;">Correo electrónico:</span>
                                    <span style="color: #333333; font-size: 16px; font-weight: 600;">${to}</span>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="padding: 8px 0;">
                                    <span style="color: #92400e; font-size: 14px; display: block; margin-bottom: 4px;">Nueva contraseña temporal:</span>
                                    <span style="color: #333333; font-size: 18px; font-weight: 700; font-family: 'Courier New', monospace; background-color: #ffffff; padding: 8px 12px; border-radius: 4px; display: inline-block;">${temporaryPassword}</span>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>

                        <!-- Security Notice -->
                        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px; margin: 30px 0;">
                          <tr>
                            <td style="padding: 16px 20px;">
                              <p style="margin: 0; color: #dc2626; font-size: 14px; line-height: 1.6;">
                                <strong>🔒 Importante:</strong> Por seguridad, deberás cambiar esta contraseña la primera vez que inicies sesión. Si no solicitaste este reseteo, contacta inmediatamente al administrador.
                              </p>
                            </td>
                          </tr>
                        </table>

                        <!-- CTA Button -->
                        <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                          <tr>
                            <td align="center">
                              <a href="${APP_URL}/login" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                Iniciar Sesión Ahora
                              </a>
                            </td>
                          </tr>
                        </table>

                        <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                          Si tienes alguna pregunta o no solicitaste este reseteo, contacta inmediatamente al administrador del sistema.
                        </p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="padding: 30px 40px; text-align: center; background-color: #f8f9fa; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;">
                        <p style="margin: 0; color: #999999; font-size: 12px; line-height: 1.6;">
                          Este es un correo automático del Sistema de Reservas.<br/>
                          Por favor, no respondas a este mensaje.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      });

      console.log(`✅ Email de reseteo de contraseña enviado a ${to}`);
    } catch (error) {
      console.error('❌ Error enviando email de reseteo:', error);
      throw new Error('No se pudo enviar el email de reseteo');
    }
  }

  /**
   * Envía email de confirmación de cambio de contraseña
   * @param to - Email del destinatario
   * @param name - Nombre del usuario
   */
  async sendPasswordChangeConfirmation(to: string, name: string): Promise<void> {
    try {
      // Si no hay Resend configurado, solo logear en consola
      if (!resend) {
        console.log('\n✅ ═══════════════════════════════════════════════════════');
        console.log('📨 EMAIL DE CONFIRMACIÓN (Modo Desarrollo - No enviado)');
        console.log('═══════════════════════════════════════════════════════');
        console.log(`👤 Para: ${to}`);
        console.log(`📝 Nombre: ${name}`);
        console.log(`✔️  Contraseña actualizada exitosamente`);
        console.log('═══════════════════════════════════════════════════════\n');
        return;
      }

      await resend.emails.send({
        from: FROM_EMAIL,
        to: to,
        subject: 'Contraseña actualizada exitosamente',
        html: `
          <!DOCTYPE html>
          <html lang="es">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Contraseña Actualizada</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="padding: 40px 0;">
                  <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <tr>
                      <td style="padding: 40px; text-align: center;">
                        <div style="width: 60px; height: 60px; background-color: #10b981; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                          <span style="color: #ffffff; font-size: 32px;">✓</span>
                        </div>
                        
                        <h1 style="margin: 0 0 20px; color: #333333; font-size: 24px; font-weight: 600;">
                          Contraseña Actualizada
                        </h1>
                        
                        <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.6;">
                          Hola <strong>${name}</strong>,
                        </p>
                        
                        <p style="margin: 0 0 30px; color: #666666; font-size: 16px; line-height: 1.6;">
                          Tu contraseña ha sido actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
                        </p>

                        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f0fdf4; border-left: 4px solid #10b981; border-radius: 4px; margin: 20px 0;">
                          <tr>
                            <td style="padding: 16px 20px;">
                              <p style="margin: 0; color: #166534; font-size: 14px; line-height: 1.6;">
                                <strong>🔒 Seguridad:</strong> Si no realizaste este cambio, contacta inmediatamente al administrador del sistema.
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <tr>
                      <td style="padding: 30px 40px; text-align: center; background-color: #f8f9fa; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;">
                        <p style="margin: 0; color: #999999; font-size: 12px; line-height: 1.6;">
                          Sistema de Reservas<br/>
                          Este es un correo automático, por favor no respondas.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      });

      console.log(`✅ Email de confirmación de cambio de contraseña enviado a ${to}`);
    } catch (error) {
      console.error('❌ Error enviando email de confirmación:', error);
      // No lanzamos error aquí para que no falle el cambio de contraseña
    }
  }
}

export const emailService = new EmailService();


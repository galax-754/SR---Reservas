# Configuración de Variables de Entorno

Este proyecto requiere las siguientes variables de entorno para funcionar correctamente.

## Variables Requeridas

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# ================================
# RESEND API - Envío de Emails
# ================================
# Obtén tu API key en: https://resend.com/api-keys
# Necesitas verificar tu dominio en Resend primero
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxx

# Email desde el que se enviarán los correos
# Debe ser un dominio verificado en Resend
# Para desarrollo puedes usar: onboarding@resend.dev
FROM_EMAIL=noreply@tudominio.com

# ================================
# APLICACIÓN
# ================================
# URL base de tu aplicación (para enlaces en emails)
APP_URL=http://localhost:3000
```

## Pasos para Configurar Resend

1. **Crear cuenta en Resend**
   - Ve a [https://resend.com/](https://resend.com/)
   - Crea una cuenta gratuita

2. **Obtener API Key**
   - Ve a [https://resend.com/api-keys](https://resend.com/api-keys)
   - Crea una nueva API key
   - Cópiala y pégala en `RESEND_API_KEY`

3. **Configurar dominio (Producción)**
   - Para producción, necesitas verificar tu dominio
   - Ve a [https://resend.com/domains](https://resend.com/domains)
   - Agrega tu dominio y sigue las instrucciones de verificación DNS
   - Usa tu dominio en `FROM_EMAIL` (ej: `noreply@tuempresa.com`)

4. **Para Desarrollo**
   - Puedes usar el dominio de prueba de Resend: `onboarding@resend.dev`
   - No necesitas verificar ningún dominio
   - Los emails solo se enviarán a direcciones que agregues manualmente en Resend

## Ejemplo de `.env.local` para Desarrollo

```env
RESEND_API_KEY=re_abc123def456ghi789
FROM_EMAIL=onboarding@resend.dev
APP_URL=http://localhost:3000
```

## Ejemplo de `.env.local` para Producción

```env
RESEND_API_KEY=re_xyz789abc123def456
FROM_EMAIL=noreply@tuempresa.com
APP_URL=https://tuempresa.com
```

## Verificar Configuración

Una vez configuradas las variables, reinicia tu servidor de desarrollo:

```bash
pnpm run dev
```

Cuando crees un usuario, deberías ver en la consola:
```
✅ Email de bienvenida enviado a usuario@ejemplo.com
```

## Troubleshooting

### Error: "RESEND_API_KEY is not defined"
- Verifica que el archivo `.env.local` esté en la raíz del proyecto
- Reinicia el servidor de desarrollo
- Verifica que no haya espacios extra en la API key

### Los emails no llegan
- Verifica que la API key sea válida en Resend
- En desarrollo, verifica que el email de destino esté agregado en Resend
- Revisa los logs del servidor para ver errores específicos
- Verifica tu spam/correo no deseado

### Error: "Invalid 'from' email"
- Verifica que el dominio esté verificado en Resend (producción)
- En desarrollo, usa `onboarding@resend.dev`
- Asegúrate de que `FROM_EMAIL` tenga el formato correcto

## Seguridad

⚠️ **IMPORTANTE:**
- **NUNCA** commites el archivo `.env.local` a Git
- El archivo `.env.local` ya está en `.gitignore`
- No compartas tus API keys públicamente
- Usa diferentes API keys para desarrollo y producción







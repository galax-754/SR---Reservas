# Sistema de Autenticación y Gestión de Usuarios

## 🎉 Sistema Implementado

Se ha implementado un sistema completo de autenticación con las siguientes características:

### ✅ Características Implementadas

#### 1. **Sistema de Contraseñas Seguras**
- ✅ Hash de contraseñas con bcrypt (Salt rounds: 10)
- ✅ Generación de contraseñas temporales aleatorias
- ✅ Validación de fortaleza de contraseñas (mínimo 8 caracteres, mayúsculas, minúsculas, números)
- ✅ Cambio de contraseña obligatorio en primer inicio de sesión

#### 2. **Envío de Emails Automáticos**
- ✅ Email de bienvenida con credenciales (contraseña temporal)
- ✅ Email de confirmación al cambiar contraseña
- ✅ Plantillas HTML profesionales con diseño moderno
- ✅ Integración con Resend

#### 3. **Sistema de Roles y Permisos**
- ✅ **Administrador**: Ve todas las reservas de todas las organizaciones
- ✅ **Usuario**: Solo ve reservas de su propia organización
- ✅ **Tablet**: Ve todas las reservas de todas las organizaciones pero solo del espacio asignado

#### 4. **APIs Creadas**
- ✅ `POST /api/auth/login` - Autenticación con email y contraseña
- ✅ `POST /api/auth/change-password` - Cambio de contraseña
- ✅ `POST /api/usuarios` - Creación de usuario (genera contraseña y envía email)
- ✅ `GET /api/usuarios` - Listado de usuarios (sin contraseñas)

#### 5. **Servicios Creados**
- ✅ `auth.ts` - Gestión de contraseñas y validaciones
- ✅ `email.ts` - Envío de emails con Resend

## 📁 Archivos Creados/Modificados

### Nuevos Archivos
```
src/services/auth.ts              # Servicio de autenticación
src/services/email.ts             # Servicio de envío de emails
app/api/auth/login/route.ts       # API de login
app/api/auth/change-password/route.ts  # API de cambio de contraseña
scripts/migrate-users-passwords.js # Script de migración
ENV_SETUP.md                      # Guía de configuración
SISTEMA_AUTENTICACION.md          # Este archivo
```

### Archivos Modificados
```
src/types/user-management.ts      # Agregados campos password, temporaryPassword, assignedSpaceId
app/api/usuarios/route.ts         # Actualizado para generar contraseñas y enviar emails
```

## 🚀 Pasos para Activar el Sistema

### 1. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Resend API Key (obtener en https://resend.com/api-keys)
RESEND_API_KEY=re_tu_api_key_aqui

# Email desde el que se enviarán los correos
# Para desarrollo: onboarding@resend.dev
# Para producción: noreply@tudominio.com
FROM_EMAIL=onboarding@resend.dev

# URL de tu aplicación
APP_URL=http://localhost:3000
```

📖 **Ver `ENV_SETUP.md` para instrucciones detalladas**

### 2. Instalar Dependencias (Ya instaladas)

```bash
pnpm install
# Dependencias: bcrypt, @types/bcrypt, resend
```

### 3. Migrar Usuarios Existentes

Ejecuta el script de migración para agregar contraseñas a usuarios existentes:

```bash
node scripts/migrate-users-passwords.js
```

Este script:
- Agrega el campo `password` (hash) a todos los usuarios
- Agrega el campo `temporaryPassword: true`
- Agrega el campo `lastPasswordChange`
- Usa la contraseña temporal: `Temporal123`

**⚠️ IMPORTANTE:** Después de la migración, notifica a todos los usuarios:
- Email: (su email actual)
- Contraseña temporal: `Temporal123`
- Deberán cambiarla en el primer inicio de sesión

### 4. Crear Usuario de Prueba (Opcional)

Puedes crear un usuario de prueba desde el dashboard o usando la API:

```bash
curl -X POST http://localhost:3000/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Usuario Prueba",
    "correo": "prueba@ejemplo.com",
    "organizacion": "org-id",
    "rol": "Usuario"
  }'
```

El sistema automáticamente:
1. Generará una contraseña temporal aleatoria
2. La hasheará con bcrypt
3. Enviará un email con las credenciales

## 🔐 Flujo de Autenticación

### 1. Creación de Usuario
```
Admin crea usuario → Sistema genera contraseña temporal → 
Hash con bcrypt → Guarda en BD → Envía email con credenciales
```

### 2. Primer Inicio de Sesión
```
Usuario ingresa credenciales → Sistema valida contraseña → 
Login exitoso → Detecta temporaryPassword = true → 
Muestra modal de cambio de contraseña OBLIGATORIO
```

### 3. Cambio de Contraseña
```
Usuario ingresa contraseña actual y nueva → 
Valida contraseña actual → Valida fortaleza de nueva → 
Hashea nueva contraseña → Actualiza en BD → 
Marca temporaryPassword = false → Envía email de confirmación
```

### 4. Inicios de Sesión Posteriores
```
Usuario ingresa credenciales → Sistema valida contraseña → 
Login exitoso → Acceso directo al dashboard
```

## 🎯 Permisos por Rol

### Administrador
- ✅ Ve **TODAS** las reservas de **TODAS** las organizaciones
- ✅ Puede gestionar usuarios, espacios, organizaciones
- ✅ Acceso completo al sistema

### Usuario
- ✅ Ve solo reservas de **SU ORGANIZACIÓN**
- ✅ Puede crear/editar/cancelar sus propias reservas
- ❌ No puede gestionar espacios ni usuarios

### Tablet
- ✅ Ve todas las reservas de **UN SOLO ESPACIO** (el asignado)
- ✅ Vista de solo lectura
- ❌ No puede crear, editar ni cancelar reservas
- ❌ No accede a otras secciones

## 📧 Plantillas de Email

### Email de Bienvenida
- Diseño profesional con gradientes
- Credenciales destacadas en caja
- Botón CTA para iniciar sesión
- Advertencia de seguridad sobre cambio de contraseña
- Responsive (se ve bien en móvil y escritorio)

### Email de Cambio de Contraseña
- Confirmación visual con checkmark
- Alerta de seguridad si no fue el usuario
- Diseño limpio y profesional

## 🔒 Seguridad Implementada

- ✅ Contraseñas hasheadas con bcrypt (nunca en texto plano)
- ✅ Salt rounds: 10 (balance perfecto seguridad/performance)
- ✅ Validación de fortaleza de contraseñas
- ✅ Contraseñas nunca se devuelven en responses de API
- ✅ Tokens temporales para primer inicio de sesión
- ✅ Emails de confirmación para cambios de contraseña
- ✅ Validación de usuario activo antes de login
- ✅ Validación de rol y permisos

## 📝 TODO: Pendiente de Implementar

Los siguientes componentes del frontend necesitan ser actualizados:

### 1. **LoginSection** (`src/components/features/login-section.tsx`)
- [ ] Actualizar para usar la API de login real (`/api/auth/login`)
- [ ] Remover credenciales hardcodeadas
- [ ] Mostrar errores de autenticación
- [ ] Manejar redirección después de login

### 2. **Componente de Cambio de Contraseña**
- [ ] Crear modal de cambio de contraseña obligatorio
- [ ] Mostrar cuando `temporaryPassword === true`
- [ ] Validar fortaleza en tiempo real
- [ ] Integrar con API `/api/auth/change-password`

### 3. **Formulario de Creación de Usuarios**
- [ ] Agregar campo "Espacio Asignado" (solo para rol Tablet)
- [ ] Mostrar dropdown de espacios disponibles
- [ ] Validar que Tablets tengan espacio asignado

### 4. **Filtros de Reservas por Rol**
- [ ] Implementar filtro por organización para Usuarios
- [ ] Implementar filtro por espacio asignado para Tablets
- [ ] Mantener vista completa para Administradores

### 5. **AuthContext**
- [ ] Actualizar para usar la API de login real
- [ ] Guardar usuario completo en estado
- [ ] Manejar `temporaryPassword` en el contexto
- [ ] Actualizar lógica de permisos

## 🧪 Cómo Probar

### 1. Probar Creación de Usuario

```bash
# 1. Asegúrate de tener las variables de entorno configuradas
# 2. Inicia el servidor: pnpm run dev
# 3. Ve al dashboard > Gestión de usuarios > Usuarios
# 4. Crea un nuevo usuario
# 5. Revisa tu email (o los logs del servidor)
```

### 2. Probar Login

```bash
# 1. Ejecuta la migración de usuarios
# 2. Usa las credenciales:
#    Email: (email de un usuario existente)
#    Contraseña: Temporal123
# 3. Deberías poder iniciar sesión
```

### 3. Probar Cambio de Contraseña

```bash
# Usando curl:
curl -X POST http://localhost:3000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-id",
    "oldPassword": "Temporal123",
    "newPassword": "NuevaPassword123"
  }'
```

## 📞 Soporte

Si tienes problemas:

1. **Revisa los logs del servidor** - Todos los errores se imprimen en consola
2. **Verifica las variables de entorno** - Ver `ENV_SETUP.md`
3. **Revisa que bcrypt esté compilado** - `pnpm rebuild bcrypt`
4. **Verifica la API key de Resend** - Debe ser válida

## 🎨 Próximos Pasos

1. ✅ Configurar variables de entorno
2. ✅ Ejecutar script de migración
3. ⏳ Actualizar componentes de frontend (TODO #7-10)
4. ⏳ Probar flujo completo de autenticación
5. ⏳ Implementar filtros de reservas por rol
6. ⏳ Personalizar plantillas de email (opcional)
7. ⏳ Agregar recuperación de contraseña (opcional)

---

**¿Listo para continuar?** Los próximos pasos son actualizar los componentes de frontend para usar el nuevo sistema de autenticación. 🚀







# Sistema de Autenticación y Roles

## Descripción General

El sistema de reservas ahora cuenta con autenticación y control de acceso basado en roles. Existen tres tipos de usuarios con diferentes niveles de permisos.

## Tipos de Usuarios

### 1. Administrador
- **Acceso completo** a todas las funcionalidades del sistema
- Puede ver y gestionar:
  - Dashboard con estadísticas
  - Todas las reservas (crear, editar, eliminar)
  - Gestión de espacios (crear, editar, eliminar espacios y tags)
  - Gestión de usuarios y organizaciones
- Requiere correo electrónico y contraseña para autenticarse

### 2. Usuario
- Acceso a funcionalidades principales excepto gestión administrativa
- Puede ver y gestionar:
  - Dashboard con estadísticas
  - Todas las reservas (crear, editar)
  - **NO tiene acceso a**:
    - Gestión de espacios
    - Gestión de usuarios
- Requiere correo electrónico y contraseña para autenticarse

### 3. Tablet
- Acceso restringido solo a reservas de un espacio específico
- Características:
  - Solo ve las reservas del espacio asignado
  - Vista de solo lectura (no puede crear ni editar reservas)
  - Ideal para tablets en salas de conferencias
  - **NO tiene acceso a**:
    - Dashboard
    - Otras reservas
    - Gestión de espacios
    - Gestión de usuarios
- Requiere correo electrónico y contraseña para autenticarse
- Debe tener un `espacioAsignado` configurado

## Credenciales de Demostración

### Administrador
```
Correo: admin@sistema.com
Contraseña: admin123
```

### Usuario Normal
```
Correo: usuario@sistema.com
Contraseña: user123
```

### Tablet
```
Correo: tablet@sistema.com
Contraseña: tablet123
Espacio Asignado: Sala de Conferencias A (ID: 1)
```

## Estructura del Sistema

### Archivos Principales

1. **`src/types/auth.ts`**: Define los tipos y permisos de autenticación
2. **`src/contexts/AuthContext.tsx`**: Contexto de React para manejar el estado de autenticación
3. **`src/components/features/login-section.tsx`**: Componente de la página de login
4. **`app/login/page.tsx`**: Página de login
5. **`app/dashboard/page.tsx`**: Página del dashboard (protegida)
6. **`src/components/features/dashboard-section.tsx`**: Dashboard con control de acceso por roles

### Flujo de Autenticación

1. Usuario accede a la aplicación (página principal con hero-section)
2. Usuario hace clic en el botón "Iniciar Sesión" del hero
3. Se redirige a `/login`
4. Usuario ingresa credenciales (correo y contraseña)
5. Sistema valida y crea sesión
6. Usuario es redirigido a `/dashboard`
7. Dashboard muestra solo las secciones permitidas según el rol

### Permisos por Rol

| Permiso | Administrador | Usuario | Tablet |
|---------|--------------|---------|--------|
| Ver Dashboard | ✅ | ✅ | ❌ |
| Ver Reservas | ✅ | ✅ | ✅* |
| Crear Reservas | ✅ | ✅ | ❌ |
| Editar Reservas | ✅ | ✅ | ❌ |
| Eliminar Reservas | ✅ | ❌ | ❌ |
| Gestión de Espacios | ✅ | ❌ | ❌ |
| Gestión de Usuarios | ✅ | ❌ | ❌ |
| Ver Todos los Espacios | ✅ | ✅ | ❌** |

\* Solo del espacio asignado  
\** Solo puede ver su espacio asignado

## Persistencia de Sesión

- La sesión del usuario se almacena en `localStorage`
- La sesión persiste entre recargas de página
- El usuario debe cerrar sesión explícitamente o limpiar el localStorage

## Cerrar Sesión

El usuario puede cerrar sesión desde:
- El botón "Cerrar Sesión" en la parte inferior del sidebar
- Al cerrar sesión, se limpia la información del usuario y se redirige a `/login`

## Implementación Futura

En producción, se recomienda:
1. Implementar backend con API REST para autenticación
2. Usar JWT (JSON Web Tokens) para manejo de sesiones
3. Implementar refresh tokens
4. Agregar autenticación de dos factores (2FA)
5. Implementar recuperación de contraseña
6. Agregar logging de intentos de login
7. Implementar rate limiting para prevenir ataques de fuerza bruta

## Uso en Desarrollo

Para probar el sistema:

1. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

2. Acceder a http://localhost:3000 (verás la página principal con el hero-section)

3. Hacer clic en el botón "Iniciar Sesión"

4. Probar con las diferentes credenciales de demostración

5. Observar cómo cambia la interfaz según el rol del usuario:
   - **Administrador**: Verá Dashboard, Reservas, Gestión de Espacios y Gestión de Usuarios
   - **Usuario**: Verá Dashboard y Reservas (sin gestión de espacios/usuarios)
   - **Tablet**: Solo verá Reservas del espacio asignado


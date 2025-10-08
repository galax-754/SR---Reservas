# 🚀 Guía para Ejecutar el Servidor de Desarrollo

Esta guía te ayudará a configurar y ejecutar el servidor de desarrollo del Sistema de Reservas y Capacitaciones.

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 18 o superior)
- **pnpm** (gestor de paquetes)
  ```bash
  npm install -g pnpm
  ```

## 🔧 Instalación

### 1. Clonar o Descargar el Proyecto

Si aún no tienes el proyecto:
```bash
git clone <url-del-repositorio>
cd Sistema_Reservas_Capacit
```

### 2. Instalar Dependencias

```bash
pnpm install
```

Esto instalará todas las dependencias necesarias definidas en `package.json`.

## ⚙️ Configuración

### 1. Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# ================================
# RESEND API - Envío de Emails
# ================================
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxx
FROM_EMAIL=onboarding@resend.dev
APP_URL=http://localhost:3000
```

#### Para Desarrollo:
- Usa `FROM_EMAIL=onboarding@resend.dev` (no requiere verificación de dominio)
- Obtén tu API key en: https://resend.com/api-keys
- Ver `ENV_SETUP.md` para más detalles

### 2. Inicializar Base de Datos

Si es la primera vez que ejecutas el proyecto:

```bash
pnpm run db:init
```

Este comando:
- ✅ Crea la carpeta `bd` si no existe
- ✅ Inicializa los archivos JSON con datos de ejemplo
- ✅ Configura la estructura de la base de datos local

## 🎯 Ejecutar el Servidor

### Modo Desarrollo

```bash
pnpm run dev
```

El servidor se iniciará en: **http://localhost:3000**

### Características del Modo Desarrollo:

- 🔄 **Hot Reload** - Los cambios se reflejan automáticamente
- 🐛 **Source Maps** - Facilita la depuración
- ⚡ **Fast Refresh** - Actualización rápida de componentes
- 📝 **Logs detallados** - Información completa en consola

## 🌐 Acceder a la Aplicación

Una vez iniciado el servidor, abre tu navegador en:

```
http://localhost:3000
```

### Rutas Disponibles:

- **`/`** - Página principal
- **`/login`** - Inicio de sesión
- **`/dashboard`** - Panel de control (requiere autenticación)

## 👤 Usuarios de Prueba

El sistema incluye usuarios de ejemplo (después de ejecutar `db:init`):

```javascript
// Usuario Administrador
Email: admin@example.com
Contraseña: admin123

// Usuario Regular
Email: user@example.com
Contraseña: user123
```

## 🛠️ Comandos Adicionales

### Gestión de Base de Datos

```bash
# Crear un backup de la base de datos
pnpm run db:backup

# Resetear la base de datos (¡CUIDADO! Borra todos los datos)
pnpm run db:reset
```

### Desarrollo

```bash
# Ejecutar linter
pnpm run lint

# Compilar el proyecto (sin iniciar servidor)
pnpm run build
```

## 📊 Estructura del Proyecto

```
Sistema_Reservas_Capacit/
├── app/                    # Páginas y API routes (Next.js App Router)
│   ├── api/               # Endpoints de la API
│   ├── dashboard/         # Página del dashboard
│   └── login/             # Página de login
├── src/
│   ├── components/        # Componentes React
│   ├── contexts/          # Contextos de React
│   ├── hooks/             # Hooks personalizados
│   ├── services/          # Servicios (API, auth, database)
│   └── types/             # Definiciones de TypeScript
├── bd/                    # Base de datos JSON local
├── public/                # Archivos estáticos
└── scripts/               # Scripts de utilidad
```

## 🔍 Depuración

### Ver Logs del Servidor

Los logs se mostrarán en la terminal donde ejecutaste `pnpm run dev`:

```
✓ Ready in 2.3s
○ Local:        http://localhost:3000
○ Network:      http://192.168.1.x:3000
```

### Errores Comunes

#### Error: "Port 3000 is already in use"

**Solución:**
```bash
# Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# O usa otro puerto
pnpm run dev -- -p 3001
```

#### Error: "RESEND_API_KEY is not defined"

**Solución:**
- Verifica que existe el archivo `.env.local`
- Reinicia el servidor de desarrollo
- Revisa que no haya espacios extra en las variables

#### Error: "Cannot find module"

**Solución:**
```bash
# Reinstalar dependencias
rm -rf node_modules
pnpm install
```

## 🔐 Autenticación y Seguridad

- Las contraseñas se hashean con **bcrypt**
- Las sesiones se manejan en el cliente (sin persistencia en desarrollo)
- Ver `AUTENTICACION.md` y `SEGURIDAD_USUARIOS.md` para más detalles

## 📧 Configuración de Emails

El sistema envía emails para:
- ✉️ Bienvenida de nuevos usuarios
- 🔑 Recuperación de contraseñas
- 📅 Confirmación de reservas

En desarrollo, los emails solo se envían a direcciones agregadas en tu cuenta de Resend.

## 🔄 Actualizar el Proyecto

```bash
# Obtener últimos cambios (si usas Git)
git pull

# Actualizar dependencias
pnpm install

# Actualizar base de datos (si hay cambios)
pnpm run db:init
```

## 📝 Hacer Backups

Antes de hacer cambios importantes:

```bash
pnpm run db:backup
```

Los backups se guardan en `bd/backups/backup-YYYY-MM-DD/`

## 🆘 Soporte

Para más información, consulta:
- `ENV_SETUP.md` - Configuración de variables de entorno
- `bd/README.md` - Documentación de la base de datos
- `AUTENTICACION.md` - Sistema de autenticación
- `SEGURIDAD_USUARIOS.md` - Seguridad y gestión de usuarios

## 🎉 ¡Listo!

Ahora puedes comenzar a desarrollar. El servidor recargará automáticamente los cambios que hagas.

**¡Feliz desarrollo! 🚀**



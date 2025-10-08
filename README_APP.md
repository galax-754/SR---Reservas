# 🚀 Guía para Ejecutar la Aplicación en Producción

Esta guía te ayudará a compilar y ejecutar la aplicación del Sistema de Reservas y Capacitaciones en un entorno de producción.

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 18 o superior)
- **pnpm** (gestor de paquetes)
  ```bash
  npm install -g pnpm
  ```

## 🔧 Preparación

### 1. Instalar Dependencias

```bash
pnpm install
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con tus variables de producción:

```env
# ================================
# RESEND API - Envío de Emails
# ================================
RESEND_API_KEY=re_tu_api_key_de_produccion
FROM_EMAIL=noreply@tudominio.com
APP_URL=https://tudominio.com
```

⚠️ **IMPORTANTE:**
- Usa un dominio verificado en Resend para `FROM_EMAIL`
- `APP_URL` debe ser tu URL de producción
- Ver `ENV_SETUP.md` para configuración detallada de Resend

### 3. Inicializar Base de Datos

```bash
pnpm run db:init
```

Este comando crea la estructura inicial de la base de datos JSON.

## 🏗️ Compilar la Aplicación

### Generar Build de Producción

```bash
pnpm run build
```

Este proceso:
- ✅ Compila TypeScript a JavaScript
- ✅ Optimiza el código para producción
- ✅ Genera páginas estáticas cuando es posible
- ✅ Minimiza archivos CSS y JavaScript
- ✅ Optimiza imágenes

**Tiempo aproximado:** 1-3 minutos (dependiendo de tu hardware)

### Verificar la Compilación

Si el build es exitoso, verás:
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    X kB           Y kB
├ ○ /dashboard                           X kB           Y kB
└ ○ /login                               X kB           Y kB
```

## 🚀 Ejecutar la Aplicación

### Iniciar el Servidor de Producción

```bash
pnpm run start
```

La aplicación estará disponible en: **http://localhost:3000**

### Ejecutar en Puerto Personalizado

```bash
pnpm run start -- -p 8080
```

## 🌐 Configuración de Servidor

### Usar PM2 (Recomendado para Producción)

PM2 es un gestor de procesos que mantiene tu aplicación ejecutándose:

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar la aplicación con PM2
pm2 start npm --name "reservas-app" -- start

# Ver estado
pm2 status

# Ver logs
pm2 logs reservas-app

# Reiniciar
pm2 restart reservas-app

# Detener
pm2 stop reservas-app

# Configurar inicio automático
pm2 startup
pm2 save
```

### Usar como Servicio de Sistema (Windows)

1. Instalar `node-windows`:
```bash
npm install -g node-windows
```

2. Crear un script de servicio (ej: `service-install.js`):
```javascript
const Service = require('node-windows').Service;

const svc = new Service({
  name: 'Sistema Reservas',
  description: 'Sistema de Reservas y Capacitaciones',
  script: require('path').join(__dirname, 'node_modules', 'next', 'dist', 'bin', 'next'),
  scriptOptions: 'start',
  env: {
    name: "NODE_ENV",
    value: "production"
  }
});

svc.on('install', () => {
  svc.start();
});

svc.install();
```

3. Ejecutar:
```bash
node service-install.js
```

## 🔒 Seguridad en Producción

### Configuración Recomendada

1. **Variables de Entorno**
   - No uses valores por defecto
   - Usa dominios verificados para emails
   - Protege tus API keys

2. **HTTPS**
   - Usa siempre HTTPS en producción
   - Obtén certificados SSL (Let's Encrypt es gratuito)

3. **Firewall**
   ```bash
   # Solo permitir tráfico HTTP/HTTPS
   # Windows Firewall o tu firewall de preferencia
   ```

4. **Backups Automáticos**
   ```bash
   # Crear backup diario con PM2
   pm2 start "pnpm run db:backup" --cron "0 0 * * *" --name "backup-daily" --no-autorestart
   ```

## 📊 Monitoreo

### Logs de la Aplicación

```bash
# Con PM2
pm2 logs reservas-app

# Sin PM2 (stdout)
pnpm run start > app.log 2>&1
```

### Métricas de Rendimiento

```bash
# Instalar módulo de monitoreo de PM2
pm2 install pm2-logrotate

# Ver métricas en tiempo real
pm2 monit
```

## 🔄 Actualización de la Aplicación

### Proceso de Actualización

```bash
# 1. Hacer backup de la base de datos
pnpm run db:backup

# 2. Obtener nuevos cambios (si usas Git)
git pull

# 3. Instalar nuevas dependencias
pnpm install

# 4. Compilar nuevamente
pnpm run build

# 5. Reiniciar la aplicación
pm2 restart reservas-app
# o sin PM2:
# Ctrl+C y luego: pnpm run start
```

## 🗄️ Base de Datos

### Ubicación de Datos

Los datos se almacenan en: `bd/`
- `usuarios.json` - Usuarios del sistema
- `espacios.json` - Espacios disponibles
- `reservations.json` - Reservas realizadas
- `spaceTags.json` - Etiquetas de espacios
- `roles.json` - Roles de usuario
- `organizaciones.json` - Organizaciones

### Backups

```bash
# Crear backup manual
pnpm run db:backup

# Los backups se guardan en:
bd/backups/backup-YYYY-MM-DD/
```

### Restaurar desde Backup

```bash
# Copiar archivos del backup a la carpeta bd/
cp bd/backups/backup-2025-10-07/*.json bd/
```

## 🌍 Despliegue en Servicios Cloud

### Vercel (Recomendado para Next.js)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Configuración en Vercel:
1. Conecta tu repositorio Git
2. Configura las variables de entorno en el dashboard
3. Vercel desplegará automáticamente en cada push

### Otros Servicios

- **Netlify** - Similar a Vercel
- **AWS** - EC2, Elastic Beanstalk, o Amplify
- **Google Cloud** - App Engine o Cloud Run
- **Azure** - App Service
- **DigitalOcean** - Droplets o App Platform

## 🧪 Pruebas Antes de Producción

### Verificar Build Localmente

```bash
# 1. Compilar
pnpm run build

# 2. Ejecutar en modo producción
pnpm run start

# 3. Probar todas las funcionalidades:
# - Login
# - Dashboard
# - Crear reservas
# - Gestión de espacios
# - Gestión de usuarios
```

## 📧 Configuración de Emails en Producción

1. **Verificar Dominio en Resend**
   - Ve a https://resend.com/domains
   - Agrega tu dominio
   - Configura registros DNS (SPF, DKIM, DMARC)
   - Espera la verificación

2. **Actualizar Variables**
   ```env
   FROM_EMAIL=noreply@tudominio.com
   ```

3. **Probar Envío**
   - Crea un usuario de prueba
   - Verifica que lleguen los emails

## 🔧 Troubleshooting

### La aplicación no inicia

```bash
# Verificar puerto en uso
netstat -ano | findstr :3000

# Limpiar y recompilar
rm -rf .next
pnpm run build
pnpm run start
```

### Errores de Compilación

```bash
# Limpiar caché
rm -rf .next node_modules
pnpm install
pnpm run build
```

### Problemas de Rendimiento

- Verifica los logs para errores
- Aumenta memoria de Node.js:
  ```bash
  NODE_OPTIONS="--max-old-space-size=4096" pnpm run start
  ```

## 📈 Optimización

### Variables de Entorno de Node.js

```bash
# Configurar Node.js para producción
export NODE_ENV=production

# Aumentar memoria disponible
export NODE_OPTIONS="--max-old-space-size=4096"
```

### Compresión

Considera usar un proxy reverso como Nginx para:
- Compresión gzip
- Caché de archivos estáticos
- Balanceo de carga

## 🆘 Soporte

### Documentación Adicional

- `README_SERVIDOR.md` - Guía de desarrollo
- `ENV_SETUP.md` - Variables de entorno
- `bd/README.md` - Base de datos
- `AUTENTICACION.md` - Sistema de autenticación
- `SEGURIDAD_USUARIOS.md` - Seguridad

### Logs y Debugging

```bash
# Ver logs con PM2
pm2 logs reservas-app --lines 100

# Logs del sistema
tail -f app.log
```

## ✅ Checklist de Producción

Antes de lanzar a producción:

- [ ] Variables de entorno configuradas correctamente
- [ ] Dominio de email verificado en Resend
- [ ] Build exitoso sin errores
- [ ] Base de datos inicializada
- [ ] Backup automático configurado
- [ ] HTTPS habilitado
- [ ] Pruebas de funcionalidad completadas
- [ ] Monitoreo configurado (PM2/otro)
- [ ] Logs funcionando correctamente
- [ ] Plan de recuperación ante desastres

## 🎉 ¡Listo para Producción!

Tu aplicación está lista para servir a usuarios reales.

**Recuerda:**
- Hacer backups regulares
- Monitorear logs y rendimiento
- Mantener dependencias actualizadas
- Probar antes de actualizar en producción

**¡Éxito con tu aplicación! 🚀**



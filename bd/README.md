# Base de Datos - Sistema de Reservas

## ⚠️ IMPORTANTE: Migración completada a Supabase

**Los archivos JSON han sido eliminados** ya que toda la aplicación ahora usa **Supabase** como base de datos.

## ✅ Estado actual

- **Base de datos:** Supabase (PostgreSQL)
- **Archivos JSON:** Eliminados (ya no necesarios)
- **APIs:** Todas migradas a Supabase
- **Datos:** Migrados y funcionando correctamente

## 🔄 Si necesitas restaurar datos

Si necesitas acceder a los datos originales, puedes:

1. **Ver en Supabase:** Accede a tu proyecto en [supabase.com](https://supabase.com)
2. **Usar el script de migración:** `node scripts/migrate-to-supabase.js` (para re-migrar)
3. **Revisar el historial de Git:** Los archivos JSON están en commits anteriores

## 📊 Tablas en Supabase

- `organizations` - Organizaciones
- `roles` - Roles y permisos
- `space_tags` - Etiquetas de espacios
- `spaces` - Espacios disponibles
- `users` - Usuarios del sistema
- `reservations` - Reservaciones

## 🚀 Scripts disponibles

### Migrar datos a Supabase
```bash
node scripts/migrate-to-supabase.js
```
- Migra todos los datos de archivos JSON a Supabase
- Limpia las tablas existentes antes de migrar
- Útil para restaurar datos desde respaldos

### Probar conexión con Supabase
```bash
# Visita: http://localhost:3000/api/test-supabase
```
- Verifica que la conexión con Supabase funcione
- Muestra estadísticas de las tablas

## 🔧 Configuración

Asegúrate de tener configuradas las variables de entorno:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
SUPABASE_SERVICE_ROLE_KEY=tu_clave_de_servicio
```

## 📈 Ventajas de Supabase

- ✅ **Escalabilidad:** Base de datos PostgreSQL profesional
- ✅ **Seguridad:** Autenticación y autorización integradas
- ✅ **Real-time:** Actualizaciones en tiempo real
- ✅ **Backup automático:** Respaldo automático de datos
- ✅ **API REST:** API automática generada
- ✅ **Dashboard:** Interfaz web para administrar datos

**¡La aplicación ahora es completamente independiente de archivos JSON!** 🎉
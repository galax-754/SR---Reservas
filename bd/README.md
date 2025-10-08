# Base de Datos Local - Sistema de Reservas

Este directorio contiene los archivos JSON que funcionan como base de datos local para el sistema de reservas de espacios.

## Estructura de Archivos

### 📁 Archivos de Datos

- **`spaces.json`** - Contiene todos los espacios disponibles para reserva
- **`spaceTags.json`** - Contiene las etiquetas de horarios y restricciones de espacios
- **`reservations.json`** - Contiene todas las reservas realizadas

### 📁 Directorio de Backups

- **`backups/`** - Contiene respaldos automáticos de la base de datos organizados por fecha

## Comandos Disponibles

### 🚀 Inicializar Base de Datos
```bash
npm run db:init
```
- Crea la carpeta `bd` si no existe
- Inicializa los archivos JSON con datos de ejemplo
- Útil para configurar el proyecto por primera vez

### 💾 Crear Backup
```bash
npm run db:backup
```
- Crea un respaldo completo de todos los archivos JSON
- Los backups se guardan en `bd/backups/backup-YYYY-MM-DD/`
- Útil antes de hacer cambios importantes

### 🔄 Resetear Base de Datos
```bash
npm run db:reset
```
- ⚠️ **PELIGROSO**: Elimina todos los datos existentes
- Crea automáticamente un backup antes del reset
- Requiere confirmación manual

## Estructura de Datos

### Espacios (`spaces.json`)
```json
{
  "id": "string",
  "name": "string",
  "type": "string",
  "capacity": "number",
  "location": "string",
  "amenities": ["string"],
  "setupTypes": ["string"],
  "isActive": "boolean",
  "requiresCatering": "boolean",
  "tags": ["string"],
  "backgroundImage": "string",
  "description": "string",
  "createdAt": "string (ISO)",
  "updatedAt": "string (ISO)"
}
```

### Tags de Espacios (`spaceTags.json`)
```json
{
  "id": "string",
  "name": "string",
  "color": "string (hex)",
  "allowedDays": ["string"],
  "allowedHours": {
    "start": "string (HH:MM)",
    "end": "string (HH:MM)"
  },
  "description": "string",
  "createdAt": "string (ISO)",
  "updatedAt": "string (ISO)"
}
```

### Reservas (`reservations.json`)
```json
{
  "id": "string",
  "spaceId": "string",
  "userId": "string",
  "userName": "string",
  "userEmail": "string",
  "title": "string",
  "description": "string",
  "startDate": "string (ISO)",
  "endDate": "string (ISO)",
  "status": "pending | confirmed | cancelled",
  "attendees": "number",
  "requirements": ["string"],
  "createdAt": "string (ISO)",
  "updatedAt": "string (ISO)"
}
```

## Servicios API

El sistema incluye servicios API que manejan automáticamente los archivos JSON:

- **`SpacesAPI`** - Gestión de espacios
- **`SpaceTagsAPI`** - Gestión de etiquetas
- **`ReservationsAPI`** - Gestión de reservas
- **`DatabaseService`** - Servicio base para operaciones CRUD

## Migración Futura

Este sistema está diseñado para facilitar la migración a una base de datos real:

1. Los servicios API mantienen la misma interfaz
2. Solo necesitarás cambiar la implementación del `DatabaseService`
3. Los datos JSON pueden importarse directamente a la nueva BD

## Consideraciones de Seguridad

- Los archivos JSON están en el servidor local
- No exponer la carpeta `bd` en producción
- Usar backups regulares
- Considerar encriptación para datos sensibles

## Mantenimiento

- Hacer backups antes de cambios importantes
- Monitorear el tamaño de los archivos JSON
- Limpiar backups antiguos periódicamente
- Validar integridad de datos regularmente






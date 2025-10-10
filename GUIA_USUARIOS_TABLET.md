# 📱 Guía para Crear Usuarios Tipo Tablet

## ¿Qué es un Usuario Tablet?

Un usuario tipo **Tablet** es un usuario especial que:
- ✅ Solo puede ver reservaciones de **un espacio específico**
- ✅ Está diseñado para tablets físicas ubicadas en espacios específicos
- ✅ Tiene acceso limitado y enfocado en su espacio asignado
- ✅ Perfecto para recepción o puntos de control

## 🚀 Cómo Crear un Usuario Tablet

### Método 1: Desde el Dashboard (Recomendado)

1. **Accede al Dashboard**
   - Inicia sesión como Super Administrador
   - Ve a la sección "Usuarios"

2. **Crear Nuevo Usuario**
   - Haz clic en "Agregar Usuario"
   - Completa los campos básicos:
     - **Nombre completo**: Ej. "Tablet Sala A"
     - **Correo electrónico**: Ej. "tablet.sala-a@empresa.com"
     - **Organización**: Selecciona la organización

3. **Seleccionar Rol Tablet**
   - En "Tipo de Rol", selecciona **"Tablet"**
   - Aparecerá automáticamente el campo "Espacio Asignado"

4. **Asignar Espacio**
   - Selecciona el espacio específico para este usuario
   - Solo aparecen espacios activos
   - El usuario solo podrá ver reservaciones de este espacio

5. **Crear Usuario**
   - Haz clic en "Crear Usuario"
   - Se enviará un email con las credenciales de acceso

### Método 2: Usando Script (Para Desarrollo)

```bash
node create-tablet-user.js
```

## 📋 Ejemplo de Datos para Usuario Tablet

```json
{
  "nombre": "Tablet Sala de Conferencias A",
  "correo": "tablet.conferencias-a@empresa.com",
  "organizacion": "Sofroma",
  "rol": "Tablet",
  "assignedSpaceId": "espacio-id-aqui"
}
```

## 🔧 Configuración de la Base de Datos

El campo `assigned_space_id` en la tabla `users` almacena:
- **Para usuarios normales**: `NULL`
- **Para usuarios Tablet**: ID del espacio asignado

## 📱 Comportamiento del Usuario Tablet

### ✅ Lo que SÍ puede hacer:
- Ver reservaciones de su espacio asignado
- Acceder al dashboard con vista limitada
- Ver solo las métricas de su espacio

### ❌ Lo que NO puede hacer:
- Ver reservaciones de otros espacios
- Crear espacios
- Gestionar usuarios
- Acceder a configuraciones avanzadas

## 🎯 Casos de Uso Típicos

1. **Tablet en Recepción**
   - Espacio: "Lobby Principal"
   - Usuario: "Tablet Recepción"

2. **Tablet en Sala Específica**
   - Espacio: "Sala de Conferencias A"
   - Usuario: "Tablet Sala A"

3. **Tablet en Área de Capacitación**
   - Espacio: "Sala de Capacitación"
   - Usuario: "Tablet Capacitación"

## 🔍 Verificar Usuario Tablet

Para verificar que un usuario es tipo Tablet:

```javascript
// En el código
if (user?.rol === 'Tablet' && user?.assignedSpaceId) {
  // Filtrar solo reservaciones de su espacio
  const userReservations = reservations.filter(r => 
    r.space.id === user.assignedSpaceId
  );
}
```

## 🛠️ Troubleshooting

### Error: "Los usuarios tipo Tablet deben tener un espacio asignado"
- **Causa**: No se seleccionó un espacio al crear el usuario
- **Solución**: Editar el usuario y asignar un espacio

### Error: "Espacio no encontrado"
- **Causa**: El espacio fue eliminado o desactivado
- **Solución**: Asignar un nuevo espacio activo

### Usuario Tablet ve todas las reservaciones
- **Causa**: Error en la lógica de filtrado
- **Solución**: Verificar que `user.assignedSpaceId` esté correctamente asignado

## 📞 Soporte

Si tienes problemas creando usuarios Tablet, verifica:
1. ✅ Que el espacio esté activo
2. ✅ Que la organización exista
3. ✅ Que el email no esté en uso
4. ✅ Que tengas permisos de Super Administrador

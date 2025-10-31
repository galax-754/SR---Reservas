-- Script para actualizar el estado de usuarios con contraseña temporal
-- Este script debe ejecutarse después de implementar la nueva lógica de estados

-- Actualizar usuarios que tienen contraseña temporal para que su estado sea 'Pendiente'
UPDATE public.users 
SET estado = 'Pendiente' 
WHERE temporary_password = true AND estado = 'Activo';

-- Verificar que la actualización se aplicó correctamente
SELECT 
    id,
    nombre,
    correo,
    rol,
    estado,
    temporary_password,
    last_password_change,
    created_at
FROM public.users 
WHERE temporary_password = true
ORDER BY created_at DESC;

-- Verificar usuarios que están realmente activos (sin contraseña temporal)
SELECT 
    id,
    nombre,
    correo,
    rol,
    estado,
    temporary_password,
    last_password_change,
    created_at
FROM public.users 
WHERE temporary_password = false AND estado = 'Activo'
ORDER BY created_at DESC;


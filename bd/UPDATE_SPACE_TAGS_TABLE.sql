-- Script SQL para actualizar la tabla 'space_tags' en Supabase
-- Ejecuta este script en el SQL Editor de tu proyecto de Supabase

-- Agregar columnas faltantes a la tabla space_tags
ALTER TABLE space_tags 
ADD COLUMN IF NOT EXISTS allowed_days TEXT[] DEFAULT ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
ADD COLUMN IF NOT EXISTS start_time VARCHAR(5) DEFAULT '08:00',
ADD COLUMN IF NOT EXISTS end_time VARCHAR(5) DEFAULT '18:00',
ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';

-- Actualizar tags existentes con valores por defecto si son NULL
UPDATE space_tags 
SET 
  allowed_days = COALESCE(allowed_days, ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday']),
  start_time = COALESCE(start_time, '08:00'),
  end_time = COALESCE(end_time, '18:00'),
  description = COALESCE(description, '');

-- Verificar las columnas agregadas
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'space_tags' 
ORDER BY ordinal_position;



-- Script SQL para actualizar la tabla 'spaces' en Supabase
-- Ejecuta este script en el SQL Editor de tu proyecto de Supabase

-- Agregar columnas faltantes a la tabla spaces
ALTER TABLE spaces 
ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'meeting-room',
ADD COLUMN IF NOT EXISTS location VARCHAR(255) DEFAULT '',
ADD COLUMN IF NOT EXISTS setup_types JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS requires_catering BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS requires_guest_list BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS available_hours JSONB DEFAULT '{"start": "08:00", "end": "18:00"}'::jsonb;

-- Actualizar espacios existentes con valores por defecto si son NULL
UPDATE spaces 
SET 
  type = COALESCE(type, 'meeting-room'),
  location = COALESCE(location, ''),
  setup_types = COALESCE(setup_types, '[]'::jsonb),
  requires_catering = COALESCE(requires_catering, false),
  requires_guest_list = COALESCE(requires_guest_list, false),
  available_hours = COALESCE(available_hours, '{"start": "08:00", "end": "18:00"}'::jsonb);

-- Verificar las columnas agregadas
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'spaces' 
ORDER BY ordinal_position;






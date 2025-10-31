-- Script para agregar columnas de coordinador a la tabla reservations
-- Este script debe ejecutarse para permitir guardar el nombre, email y teléfono del coordinador

-- Agregar columnas si no existen
DO $$ 
BEGIN
    -- Agregar columna coordinator_name
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reservations' AND column_name = 'coordinator_name'
    ) THEN
        ALTER TABLE public.reservations 
        ADD COLUMN coordinator_name TEXT;
        RAISE NOTICE 'Columna coordinator_name agregada';
    END IF;

    -- Agregar columna coordinator_email
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reservations' AND column_name = 'coordinator_email'
    ) THEN
        ALTER TABLE public.reservations 
        ADD COLUMN coordinator_email TEXT;
        RAISE NOTICE 'Columna coordinator_email agregada';
    END IF;

    -- Agregar columna coordinator_phone
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reservations' AND column_name = 'coordinator_phone'
    ) THEN
        ALTER TABLE public.reservations 
        ADD COLUMN coordinator_phone TEXT;
        RAISE NOTICE 'Columna coordinator_phone agregada';
    END IF;
END $$;

-- Verificar que las columnas se agregaron correctamente
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'reservations' 
  AND column_name IN ('coordinator_name', 'coordinator_email', 'coordinator_phone')
ORDER BY column_name;


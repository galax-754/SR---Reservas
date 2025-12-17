-- Script SQL para configurar políticas de Storage en producción
-- Las imágenes se suben desde el backend usando service role key

-- 1. ELIMINAR políticas anteriores si existen
DROP POLICY IF EXISTS "Imágenes públicas para lectura" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden subir imágenes" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar imágenes" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar imágenes" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;

-- 2. CREAR política para lectura pública (cualquiera puede ver las imágenes)
CREATE POLICY "Lectura pública de imágenes"
ON storage.objects FOR SELECT
USING ( bucket_id = 'space-img' );

-- 3. CREAR políticas para operaciones de admin (INSERT, UPDATE, DELETE)
-- Estas operaciones solo se realizan desde el backend con service role key
-- Por lo tanto, bypassean las políticas RLS automáticamente

-- Verificar las políticas creadas
SELECT 
  schemaname,
  tablename, 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%space-img%' OR policyname LIKE '%Lectura%';



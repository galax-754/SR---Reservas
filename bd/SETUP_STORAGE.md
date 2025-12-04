# Configuración de Supabase Storage para Imágenes de Espacios

Para poder subir imágenes de los espacios directamente desde la aplicación, necesitas configurar un bucket de almacenamiento en Supabase.

## Pasos para configurar el Storage:

### 1. Crear el Bucket

1. Abre tu proyecto en [Supabase](https://supabase.com)
2. Ve a **Storage** en el menú lateral
3. Haz clic en **"New bucket"** o **"Crear bucket"**
4. Configura el bucket con los siguientes datos:
   - **Name (Nombre):** `space-images`
   - **Public bucket:** ✅ **Marca esta casilla** (para que las imágenes sean accesibles públicamente)
   - Haz clic en **"Create bucket"**

### 2. Configurar Políticas de Acceso (RLS Policies)

Para que los usuarios puedan subir y ver imágenes, necesitas crear políticas de acceso:

#### Opción A: Permitir acceso público (Más simple - Recomendado para desarrollo)

Ejecuta estos comandos en el **SQL Editor** de Supabase:

```sql
-- Permitir que cualquiera pueda leer imágenes
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'space-images' );

-- Permitir que usuarios autenticados puedan subir imágenes
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'space-images' 
  AND auth.role() = 'authenticated'
);

-- Permitir que usuarios autenticados puedan actualizar sus imágenes
CREATE POLICY "Authenticated users can update images"
ON storage.objects FOR UPDATE
USING ( 
  bucket_id = 'space-images'
  AND auth.role() = 'authenticated'
);

-- Permitir que usuarios autenticados puedan eliminar imágenes
CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
USING ( 
  bucket_id = 'space-images'
  AND auth.role() = 'authenticated'
);
```

#### Opción B: Deshabilitar RLS (Más permisivo - NO recomendado para producción)

Si prefieres deshabilitar RLS temporalmente para pruebas:

1. Ve a **Storage** → **Policies**
2. Selecciona el bucket `space-images`
3. Desactiva **"Enable RLS"** (Row Level Security)

⚠️ **ADVERTENCIA:** Esta opción permite que cualquiera suba, vea y elimine archivos. Úsala solo en desarrollo.

### 3. Verificar la Configuración

Para verificar que todo funciona:

1. Ve a tu aplicación
2. Intenta crear o editar un espacio
3. Selecciona una imagen de tu computadora
4. Guarda el espacio
5. Deberías ver la imagen en la tarjeta del espacio

### 4. Límites de Tamaño (Opcional)

Por defecto, Supabase permite archivos de hasta 50MB. Si quieres cambiar esto:

```sql
-- Ejemplo: Limitar el tamaño de archivos a 5MB
CREATE POLICY "Limit file size"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'space-images'
  AND (storage.foldername(name))[1] = 'spaces'
  AND octet_length(decode(encode(content, 'base64'), 'base64')) < 5242880 -- 5MB en bytes
);
```

## Estructura de Carpetas

Las imágenes se guardan con la siguiente estructura:
```
space-images/
└── spaces/
    ├── 1638360000000-abc123.jpg
    ├── 1638360001000-def456.png
    └── ...
```

Cada archivo tiene:
- Timestamp (milisegundos)
- ID aleatorio
- Extensión original del archivo

## Solución de Problemas

### Error: "Bucket not found"
- Verifica que el bucket se llame exactamente `space-images`
- Verifica que el bucket esté en tu proyecto correcto

### Error: "Permission denied"
- Verifica que las políticas RLS estén configuradas correctamente
- O deshabilita RLS temporalmente para pruebas

### Las imágenes no se muestran
- Verifica que el bucket sea **público**
- Abre la URL de la imagen directamente en el navegador para verificar que sea accesible

### Error al subir archivos grandes
- Verifica el tamaño del archivo (debe ser menor a 5MB por defecto)
- Ajusta los límites si es necesario

## Referencias

- [Documentación de Supabase Storage](https://supabase.com/docs/guides/storage)
- [Row Level Security en Storage](https://supabase.com/docs/guides/storage/security/access-control)


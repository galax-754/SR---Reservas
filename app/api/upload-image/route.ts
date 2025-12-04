import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Base de datos no configurada correctamente' },
        { status: 500 }
      );
    }

    // Obtener el archivo del FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'spaces';

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    // Validar tipo de archivo (normalizar a minúsculas para aceptar cualquier formato)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const fileType = file.type.toLowerCase();
    
    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no permitido. Solo se aceptan imágenes (JPG, JPEG, PNG, GIF, WEBP)' },
        { status: 400 }
      );
    }

    // Validar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024; // 5MB en bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'El archivo es demasiado grande. Tamaño máximo: 5MB' },
        { status: 400 }
      );
    }

    // Generar nombre único para el archivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Convertir File a ArrayBuffer y luego a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Subir el archivo a Supabase Storage usando el cliente admin
    const { data, error } = await supabaseAdmin.storage
      .from('space-img')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error subiendo imagen a Supabase:', error);
      return NextResponse.json(
        { 
          error: 'Error al subir la imagen',
          details: error.message
        },
        { status: 500 }
      );
    }

    // Obtener la URL pública de la imagen
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('space-img')
      .getPublicUrl(data.path);

    return NextResponse.json({ 
      success: true,
      url: publicUrl,
      path: data.path
    });

  } catch (error) {
    console.error('Error en upload-image:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar imagen
export async function DELETE(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Base de datos no configurada correctamente' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'No se proporcionó la URL de la imagen' },
        { status: 400 }
      );
    }

    // Extraer el path de la URL
    const urlParts = imageUrl.split('space-img/');
    if (urlParts.length < 2) {
      return NextResponse.json(
        { error: 'URL de imagen inválida' },
        { status: 400 }
      );
    }

    const filePath = urlParts[1];

    const { error } = await supabaseAdmin.storage
      .from('space-img')
      .remove([filePath]);

    if (error) {
      console.error('Error eliminando imagen:', error);
      return NextResponse.json(
        { 
          error: 'Error al eliminar la imagen',
          details: error.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Imagen eliminada correctamente'
    });

  } catch (error) {
    console.error('Error en DELETE upload-image:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}


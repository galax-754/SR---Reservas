import { NextResponse } from 'next/server';

import { supabaseAdmin } from '@/lib/supabase/server';

// GET /api/roles - Obtener todos los roles
export async function GET() {
  try {
    // Verificar que supabaseAdmin esté disponible
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Base de datos no configurada correctamente' },
        { status: 500 }
      );
    }

    const { data: roles, error } = await supabaseAdmin
      .from('roles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error obteniendo roles:', error);
      return NextResponse.json(
        { error: 'Error obteniendo roles de la base de datos' },
        { status: 500 }
      );
    }
    
    // Transformar datos de Supabase al formato esperado por el frontend
    const rolesTransformados = (roles || []).map((rol: any) => ({
      id: rol.id,
      nombre: rol.name,
      descripcion: rol.description || '',
      nivel: 1, // Valor por defecto
      permisos: rol.permissions || [],
      createdAt: rol.created_at,
      updatedAt: rol.updated_at || rol.created_at
    }));
    
    return NextResponse.json({ data: rolesTransformados });
  } catch (error) {
    console.error('Error obteniendo roles:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}









import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Verificar que las variables de entorno estén configuradas
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'Variables de entorno de Supabase no configuradas',
        missing: {
          url: !supabaseUrl,
          serviceKey: !supabaseServiceKey
        }
      }, { status: 500 })
    }

    // Importar dinámicamente para evitar problemas de build
    const { supabaseAdmin } = await import('@/lib/supabase/server')

    // Probar conexión básica
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('count')
      
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        code: error.code
      }, { status: 500 })
    }

    // Obtener estadísticas de las tablas de forma segura
    const [usersResult, spacesResult, reservationsResult, organizationsResult] = await Promise.allSettled([
      supabaseAdmin.from('users').select('count', { count: 'exact' }),
      supabaseAdmin.from('spaces').select('count', { count: 'exact' }),
      supabaseAdmin.from('reservations').select('count', { count: 'exact' }),
      supabaseAdmin.from('organizations').select('count', { count: 'exact' })
    ])
    
    const stats = {
      users: usersResult.status === 'fulfilled' ? (usersResult.value.count || 0) : 'error',
      spaces: spacesResult.status === 'fulfilled' ? (spacesResult.value.count || 0) : 'error',
      reservations: reservationsResult.status === 'fulfilled' ? (reservationsResult.value.count || 0) : 'error',
      organizations: organizationsResult.status === 'fulfilled' ? (organizationsResult.value.count || 0) : 'error'
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Conexión exitosa con Supabase',
      stats,
      environment: {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey,
        urlPrefix: supabaseUrl?.substring(0, 20) + '...'
      }
    })
  } catch (error: any) {
    console.error('Error testing Supabase:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}

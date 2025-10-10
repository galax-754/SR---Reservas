import { supabaseAdmin } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Probar conexión básica
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('count')
      
    if (error) throw error

    // Obtener estadísticas de las tablas
    const [usersCount, spacesCount, reservationsCount, organizationsCount] = await Promise.all([
      supabaseAdmin.from('users').select('count', { count: 'exact' }),
      supabaseAdmin.from('spaces').select('count', { count: 'exact' }),
      supabaseAdmin.from('reservations').select('count', { count: 'exact' }),
      supabaseAdmin.from('organizations').select('count', { count: 'exact' })
    ])
    
    return NextResponse.json({ 
      success: true, 
      message: 'Conexión exitosa con Supabase',
      stats: {
        users: usersCount.count || 0,
        spaces: spacesCount.count || 0,
        reservations: reservationsCount.count || 0,
        organizations: organizationsCount.count || 0
      }
    })
  } catch (error: any) {
    console.error('Error testing Supabase:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      details: error
    }, { status: 500 })
  }
}

import { createClient } from '@supabase/supabase-js'

// Función para crear el cliente de administrador de forma segura
function createSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    // En lugar de lanzar error, retornamos null y manejamos el error en las APIs
    console.error('Missing Supabase environment variables')
    return null
  }

  try {
    return createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  } catch (error) {
    console.error('Error creating Supabase admin client:', error)
    return null
  }
}

// Función para crear el cliente público de forma segura
function createSupabaseServer() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables for public client')
    return null
  }

  try {
    return createClient(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    console.error('Error creating Supabase server client:', error)
    return null
  }
}

// Exportar clientes creados de forma segura
export const supabaseAdmin = createSupabaseAdmin()
export const supabaseServer = createSupabaseServer()

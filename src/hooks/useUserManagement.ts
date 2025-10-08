import { useState, useEffect } from 'react'
import { userManagementAPI } from '@/services/userManagementAPI'
import type { Usuario, Organizacion, Rol, CreateUsuarioData, UpdateUsuarioData, CreateOrganizacionData, UpdateOrganizacionData } from '@/types/user-management'

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [organizaciones, setOrganizaciones] = useState<Organizacion[]>([])
  const [roles, setRoles] = useState<Rol[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar datos iniciales
  const cargarDatos = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const [usuariosData, organizacionesData, rolesData] = await Promise.all([
        userManagementAPI.getUsuarios(),
        userManagementAPI.getOrganizaciones(),
        userManagementAPI.getRoles()
      ])
      
      setUsuarios(usuariosData)
      setOrganizaciones(organizacionesData)
      setRoles(rolesData)
    } catch (err) {
      console.error('Error cargando datos:', err)
      setError('Error al cargar los datos')
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatos()
  }, [])

  // ===== FUNCIONES DE USUARIOS =====

  const cargarUsuarios = async () => {
    try {
      const data = await userManagementAPI.getUsuarios()
      setUsuarios(data)
    } catch (err) {
      console.error('Error cargando usuarios:', err)
    }
  }

  const crearUsuario = async (data: CreateUsuarioData) => {
    try {
      const nuevoUsuario = await userManagementAPI.createUsuario(data)
      setUsuarios(prev => [...prev, nuevoUsuario])
      return nuevoUsuario
    } catch (err) {
      console.error('Error creando usuario:', err)
      throw err
    }
  }

  const actualizarUsuario = async (id: string, data: UpdateUsuarioData) => {
    try {
      const usuarioActualizado = await userManagementAPI.updateUsuario(id, data)
      setUsuarios(prev => 
        prev.map(u => u.id === id ? usuarioActualizado : u)
      )
      return usuarioActualizado
    } catch (err) {
      console.error('Error actualizando usuario:', err)
      throw err
    }
  }

  const desactivarUsuario = async (id: string) => {
    try {
      const usuarioDesactivado = await userManagementAPI.desactivarUsuario(id)
      setUsuarios(prev => 
        prev.map(u => u.id === id ? usuarioDesactivado : u)
      )
      return usuarioDesactivado
    } catch (err) {
      console.error('Error desactivando usuario:', err)
      throw err
    }
  }

  const eliminarUsuario = async (id: string) => {
    try {
      await userManagementAPI.deleteUsuario(id)
      setUsuarios(prev => prev.filter(u => u.id !== id))
    } catch (err) {
      console.error('Error eliminando usuario:', err)
      throw err
    }
  }

  const resetearPasswordUsuario = async (id: string) => {
    try {
      const usuarioActualizado = await userManagementAPI.resetPasswordUsuario(id)
      setUsuarios(prev => 
        prev.map(u => u.id === id ? usuarioActualizado : u)
      )
      return usuarioActualizado
    } catch (err) {
      console.error('Error reseteando contraseña:', err)
      throw err
    }
  }

  // ===== FUNCIONES DE ORGANIZACIONES =====

  const cargarOrganizaciones = async () => {
    try {
      const data = await userManagementAPI.getOrganizaciones()
      setOrganizaciones(data)
    } catch (err) {
      console.error('Error cargando organizaciones:', err)
    }
  }

  const crearOrganizacion = async (data: CreateOrganizacionData) => {
    try {
      const nuevaOrganizacion = await userManagementAPI.createOrganizacion(data)
      setOrganizaciones(prev => [...prev, nuevaOrganizacion])
      return nuevaOrganizacion
    } catch (err) {
      console.error('Error creando organización:', err)
      throw err
    }
  }

  const actualizarOrganizacion = async (id: string, data: UpdateOrganizacionData) => {
    try {
      const organizacionActualizada = await userManagementAPI.updateOrganizacion(id, data)
      setOrganizaciones(prev => 
        prev.map(o => o.id === id ? organizacionActualizada : o)
      )
      return organizacionActualizada
    } catch (err) {
      console.error('Error actualizando organización:', err)
      throw err
    }
  }

  const desactivarOrganizacion = async (id: string) => {
    try {
      const organizacionDesactivada = await userManagementAPI.desactivarOrganizacion(id)
      setOrganizaciones(prev => 
        prev.map(o => o.id === id ? organizacionDesactivada : o)
      )
      return organizacionDesactivada
    } catch (err) {
      console.error('Error desactivando organización:', err)
      throw err
    }
  }

  const eliminarOrganizacion = async (id: string) => {
    try {
      await userManagementAPI.deleteOrganizacion(id)
      setOrganizaciones(prev => prev.filter(o => o.id !== id))
    } catch (err) {
      console.error('Error eliminando organización:', err)
      throw err
    }
  }

  return {
    // Estados
    usuarios,
    organizaciones,
    roles,
    isLoading,
    error,
    
    // Funciones de usuarios
    cargarDatos,
    cargarUsuarios,
    crearUsuario,
    actualizarUsuario,
    desactivarUsuario,
    eliminarUsuario,
    resetearPasswordUsuario,
    
    // Funciones de organizaciones
    cargarOrganizaciones,
    crearOrganizacion,
    actualizarOrganizacion,
    desactivarOrganizacion,
    eliminarOrganizacion,
    
    // Setters (para casos especiales)
    setUsuarios,
    setOrganizaciones,
    setRoles
  }
}




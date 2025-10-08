import type { Usuario, Organizacion, Rol, CreateUsuarioData, UpdateUsuarioData, CreateOrganizacionData, UpdateOrganizacionData } from '@/types/user-management'

class UserManagementAPI {
  private baseUrl = '/api'

  // ===== USUARIOS =====
  
  /**
   * Obtiene todos los usuarios
   */
  async getUsuarios(): Promise<Usuario[]> {
    try {
      const response = await fetch(`${this.baseUrl}/usuarios`)
      const result = await response.json()
      return result.data || []
    } catch (error) {
      console.error('Error obteniendo usuarios:', error)
      return []
    }
  }

  /**
   * Obtiene un usuario por ID
   */
  async getUsuarioById(id: string): Promise<Usuario | null> {
    try {
      const response = await fetch(`${this.baseUrl}/usuarios/${id}`)
      if (!response.ok) return null
      const result = await response.json()
      return result.data
    } catch (error) {
      console.error('Error obteniendo usuario:', error)
      return null
    }
  }

  /**
   * Crea un nuevo usuario
   */
  async createUsuario(data: CreateUsuarioData): Promise<Usuario> {
    try {
      const response = await fetch(`${this.baseUrl}/usuarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al crear el usuario')
      }
      
      return result.data
    } catch (error) {
      console.error('Error creando usuario:', error)
      throw error
    }
  }

  /**
   * Actualiza un usuario existente
   */
  async updateUsuario(id: string, data: UpdateUsuarioData): Promise<Usuario> {
    try {
      const response = await fetch(`${this.baseUrl}/usuarios/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al actualizar el usuario')
      }
      
      return result.data
    } catch (error) {
      console.error('Error actualizando usuario:', error)
      throw error
    }
  }

  /**
   * Desactiva un usuario (cambia su estado a Inactivo)
   */
  async desactivarUsuario(id: string): Promise<Usuario> {
    try {
      const response = await fetch(`${this.baseUrl}/usuarios/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const result = await response.json()
      return result.data
    } catch (error) {
      console.error('Error desactivando usuario:', error)
      throw error
    }
  }

  /**
   * Elimina un usuario permanentemente
   */
  async deleteUsuario(id: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/usuarios/${id}`, {
        method: 'DELETE',
      })
    } catch (error) {
      console.error('Error eliminando usuario:', error)
      throw error
    }
  }

  /**
   * Resetea la contraseña de un usuario y envía email con contraseña temporal
   */
  async resetPasswordUsuario(id: string): Promise<Usuario> {
    try {
      const response = await fetch(`${this.baseUrl}/usuarios/${id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al resetear la contraseña')
      }
      
      return result.data
    } catch (error) {
      console.error('Error reseteando contraseña:', error)
      throw error
    }
  }

  // ===== ORGANIZACIONES =====

  /**
   * Obtiene todas las organizaciones
   */
  async getOrganizaciones(): Promise<Organizacion[]> {
    try {
      const response = await fetch(`${this.baseUrl}/organizaciones`)
      const result = await response.json()
      return result.data || []
    } catch (error) {
      console.error('Error obteniendo organizaciones:', error)
      return []
    }
  }

  /**
   * Obtiene una organización por ID
   */
  async getOrganizacionById(id: string): Promise<Organizacion | null> {
    try {
      const response = await fetch(`${this.baseUrl}/organizaciones/${id}`)
      if (!response.ok) return null
      const result = await response.json()
      return result.data
    } catch (error) {
      console.error('Error obteniendo organización:', error)
      return null
    }
  }

  /**
   * Crea una nueva organización
   */
  async createOrganizacion(data: CreateOrganizacionData): Promise<Organizacion> {
    try {
      const response = await fetch(`${this.baseUrl}/organizaciones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      return result.data
    } catch (error) {
      console.error('Error creando organización:', error)
      throw error
    }
  }

  /**
   * Actualiza una organización existente
   */
  async updateOrganizacion(id: string, data: UpdateOrganizacionData): Promise<Organizacion> {
    try {
      const response = await fetch(`${this.baseUrl}/organizaciones/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al actualizar la organización')
      }
      
      return result.data
    } catch (error) {
      console.error('Error actualizando organización:', error)
      throw error
    }
  }

  /**
   * Desactiva una organización (cambia su estado a Inactiva)
   */
  async desactivarOrganizacion(id: string): Promise<Organizacion> {
    try {
      const response = await fetch(`${this.baseUrl}/organizaciones/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al desactivar la organización')
      }
      
      return result.data
    } catch (error) {
      console.error('Error desactivando organización:', error)
      throw error
    }
  }

  /**
   * Elimina una organización permanentemente
   */
  async deleteOrganizacion(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/organizaciones/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Error al eliminar la organización')
      }
    } catch (error) {
      console.error('Error eliminando organización:', error)
      throw error
    }
  }

  // ===== ROLES =====

  /**
   * Obtiene todos los roles
   */
  async getRoles(): Promise<Rol[]> {
    try {
      const response = await fetch(`${this.baseUrl}/roles`)
      const result = await response.json()
      return result.data || []
    } catch (error) {
      console.error('Error obteniendo roles:', error)
      return []
    }
  }

  /**
   * Obtiene un rol por ID
   */
  async getRolById(id: string): Promise<Rol | null> {
    try {
      const response = await fetch(`${this.baseUrl}/roles/${id}`)
      if (!response.ok) return null
      const result = await response.json()
      return result.data
    } catch (error) {
      console.error('Error obteniendo rol:', error)
      return null
    }
  }
}

export const userManagementAPI = new UserManagementAPI()
export default userManagementAPI


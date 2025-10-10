"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { AuthUser, LoginCredentials, getRolePermissions, RolePermissions } from '@/types/auth'

interface AuthContextType {
  user: AuthUser | null
  permissions: RolePermissions | null
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [permissions, setPermissions] = useState<RolePermissions | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Cargar usuario del localStorage al iniciar
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem('authUser')
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser) as AuthUser
          setUser(parsedUser)
          setPermissions(getRolePermissions(parsedUser.rol, parsedUser.assignedSpaceId))
        }
      } catch (error) {
        console.error('Error loading user from localStorage:', error)
        localStorage.removeItem('authUser')
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    try {
      // Intentar autenticación con la API real
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          correo: credentials.correo,
          password: credentials.contrasena || credentials.password, // Soportar ambos nombres
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error de autenticación')
      }

      const data = await response.json()
      
      // Mapear el rol del backend al tipo del frontend
      const roleLowerCase = data.user.rol.toLowerCase()
      let mappedRole: 'Administrador' | 'Usuario' | 'Tablet' = 'Usuario'
      
      if (roleLowerCase.includes('administrador') || roleLowerCase.includes('admin')) {
        mappedRole = 'Administrador'
      } else if (roleLowerCase.includes('tablet')) {
        mappedRole = 'Tablet'
      } else {
        mappedRole = 'Usuario'
      }

      const authUser: AuthUser = {
        id: data.user.id,
        nombre: data.user.nombre,
        correo: data.user.correo,
        rol: mappedRole,
        assignedSpaceId: data.user.assignedSpaceId,
        organizacion: data.user.organizacion,
        temporaryPassword: data.requirePasswordChange || data.user.temporaryPassword,
        estado: data.user.estado,
        createdAt: data.user.createdAt,
        updatedAt: data.user.updatedAt,
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 AuthContext - Usuario cargado:', {
          nombre: authUser.nombre,
          rol: authUser.rol,
          assignedSpaceId: authUser.assignedSpaceId
        })
      }

      setUser(authUser)
      setPermissions(getRolePermissions(mappedRole, authUser.assignedSpaceId))
      localStorage.setItem('authUser', JSON.stringify(authUser))
      
      console.log('✅ Login exitoso:', authUser.nombre)
      
    } catch (error) {
      console.error('❌ Error during login:', error)
      // Re-lanzar el error para que el componente de login lo maneje
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    setPermissions(null)
    localStorage.removeItem('authUser')
  }

  const value: AuthContextType = {
    user,
    permissions,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}



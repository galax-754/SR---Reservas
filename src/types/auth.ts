// Tipos de roles en el sistema
export type UserRole = 'Administrador' | 'Usuario' | 'Tablet'

// Usuario autenticado en el sistema
export interface AuthUser {
  id: string
  nombre: string
  correo: string
  rol: UserRole
  assignedSpaceId?: string // Solo para usuarios tipo tablet
  organizacion?: string
  temporaryPassword?: boolean // true si debe cambiar su contraseña
  estado?: 'Activo' | 'Pendiente' | 'Inactivo'
  createdAt?: string
  updatedAt?: string
}

// Datos para login
export interface LoginCredentials {
  correo: string
  contrasena: string // Ahora se llama 'contrasena' para compatibilidad
  password?: string   // Alias para el backend
}

// Datos para crear un nuevo usuario con autenticación
export interface CreateAuthUserData {
  nombre: string
  correo: string
  contrasena: string
  rol: UserRole
  assignedSpaceId?: string // Requerido solo para rol tablet
  organizacion?: string
}

// Datos para actualizar usuario autenticado
export interface UpdateAuthUserData {
  nombre?: string
  correo?: string
  contrasena?: string
  rol?: UserRole
  assignedSpaceId?: string
  organizacion?: string
}

// Respuesta de autenticación
export interface AuthResponse {
  user: AuthUser
  token?: string
  message?: string
  requirePasswordChange?: boolean
}

// Permisos por rol
export interface RolePermissions {
  canViewDashboard: boolean
  canViewReservations: boolean
  canCreateReservations: boolean
  canEditReservations: boolean
  canDeleteReservations: boolean
  canViewSpaces: boolean
  canManageSpaces: boolean
  canViewUsers: boolean
  canManageUsers: boolean
  canViewAllSpaces: boolean // Para tablet, solo puede ver su espacio asignado
}

// Función helper para obtener permisos según el rol
export function getRolePermissions(rol: UserRole, assignedSpaceId?: string): RolePermissions {
  switch (rol) {
    case 'Administrador':
      return {
        canViewDashboard: true,
        canViewReservations: true,
        canCreateReservations: true,
        canEditReservations: true,
        canDeleteReservations: true,
        canViewSpaces: true,
        canManageSpaces: true,
        canViewUsers: true,
        canManageUsers: true,
        canViewAllSpaces: true,
      }
    
    case 'Usuario':
      return {
        canViewDashboard: true,
        canViewReservations: true,
        canCreateReservations: true,
        canEditReservations: true,
        canDeleteReservations: false,
        canViewSpaces: false,
        canManageSpaces: false,
        canViewUsers: false,
        canManageUsers: false,
        canViewAllSpaces: true,
      }
    
    case 'Tablet':
      return {
        canViewDashboard: false,
        canViewReservations: true,
        canCreateReservations: false,
        canEditReservations: false,
        canDeleteReservations: false,
        canViewSpaces: false,
        canManageSpaces: false,
        canViewUsers: false,
        canManageUsers: false,
        canViewAllSpaces: false, // Solo puede ver su espacio asignado
      }
    
    default:
      // Sin permisos por defecto
      return {
        canViewDashboard: false,
        canViewReservations: false,
        canCreateReservations: false,
        canEditReservations: false,
        canDeleteReservations: false,
        canViewSpaces: false,
        canManageSpaces: false,
        canViewUsers: false,
        canManageUsers: false,
        canViewAllSpaces: false,
      }
  }
}



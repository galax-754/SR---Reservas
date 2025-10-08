export interface Usuario {
  id: string
  nombre: string
  correo: string
  password: string  // Hash de la contraseña
  organizacion: string
  rol: string
  estado: 'Activo' | 'Pendiente' | 'Inactivo'
  temporaryPassword: boolean  // true si debe cambiar su contraseña
  assignedSpaceId?: string  // Para tablets - ID del espacio asignado
  lastPasswordChange?: string  // Fecha del último cambio de contraseña
  createdAt?: string
  updatedAt?: string
}

export interface Organizacion {
  id: string
  nombre: string
  tipo: 'Interna' | 'Externa'
  estado: 'Activa' | 'Inactiva'
  descripcion?: string
  contacto?: string
  telefono?: string
  correo?: string
  // Control de límite de horas
  tieneLimiteHoras: boolean
  limiteHoras?: number // Horas totales permitidas (compartidas entre todos los espacios)
  horasUsadas?: number // Horas ya consumidas
  createdAt?: string
  updatedAt?: string
}

export interface Rol {
  id: string
  nombre: string
  descripcion: string
  nivel?: number
  permisos?: string[]
  createdAt?: string
  updatedAt?: string
}

export interface CreateUsuarioData {
  nombre: string
  correo: string
  organizacion: string
  rol: string
  estado?: 'Activo' | 'Pendiente' | 'Inactivo'
  assignedSpaceId?: string  // Para tablets - ID del espacio asignado
}

export interface UpdateUsuarioData {
  nombre?: string
  correo?: string
  organizacion?: string
  rol?: string
  estado?: 'Activo' | 'Pendiente' | 'Inactivo'
  assignedSpaceId?: string  // Para tablets - ID del espacio asignado
}

export interface ChangePasswordData {
  oldPassword: string
  newPassword: string
}

export interface LoginCredentials {
  correo: string
  password: string
}

export interface CreateOrganizacionData {
  nombre: string
  tipo: 'Interna' | 'Externa'
  estado?: 'Activa' | 'Inactiva'
  descripcion?: string
  contacto?: string
  telefono?: string
  correo?: string
  tieneLimiteHoras: boolean
  limiteHoras?: number
}

export interface UpdateOrganizacionData {
  nombre?: string
  tipo?: 'Interna' | 'Externa'
  estado?: 'Activa' | 'Inactiva'
  descripcion?: string
  contacto?: string
  telefono?: string
  correo?: string
  tieneLimiteHoras?: boolean
  limiteHoras?: number
  horasUsadas?: number
}


"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Reveal } from "@/components/ui/reveal"
import { 
  LayoutDashboard, 
  Calendar, 
  Settings, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Building,
  MapPin,
  Wifi,
  Coffee,
  X,
  Edit,
  Trash2,
  Tag,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Ban,
  Info,
  List,
  Map,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Modal } from "@/components/ui/Modal"
import { spaceTypes, dayOptions, colorOptions, Space, SpaceTag, CreateSpaceData, CreateTagData } from "@/types/space"
import { Reservation, ExternalVisitor } from "@/types/reservation"
import { spacesAPI } from "@/services/spacesAPI"
import { spaceTagsAPI } from "@/services/spaceTagsAPI"
import { reservationsAPI } from "@/services/reservationsAPI"
import { storageAPI } from "@/services/storageAPI"
import { ReservationForm } from "./reservation-form"
import { TabletReservationsView } from "./tablet-reservations-view"
import { useUsuarios } from "@/hooks/useUserManagement"
import type { Usuario, Organizacion, CreateUsuarioData, UpdateUsuarioData } from "@/types/user-management"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import "@/styles/reservations.css"
import "@/styles/reservations-views.css"
import "@/styles/dashboard-glass.css"
import "@/styles/dashboard-responsive.css"
import "@/styles/reservation-modal.css"

// ===== COMPONENTE DE USUARIOS =====
function UsuariosContent() {
  const { usuarios, organizaciones, roles, actualizarUsuario, desactivarUsuario, eliminarUsuario, crearUsuario, resetearPasswordUsuario, cargarDatos } = useUsuarios()
  const [spaces, setSpaces] = useState<Space[]>([])
  
  // Recargar datos al montar el componente
  useEffect(() => {
    cargarDatos()
    loadSpaces()
  }, [])

  const loadSpaces = async () => {
    try {
      const spacesData = await spacesAPI.getAll()
      setSpaces(spacesData.filter(space => space.isActive))
    } catch (error) {
      console.error('Error cargando espacios:', error)
      setSpaces([])
    }
  }
  const [showForm, setShowForm] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null)
  const [isSuperAdmin] = useState(true)
  const [formData, setFormData] = useState<CreateUsuarioData>({
    nombre: '',
    correo: '',
    organizacion: '',
    rol: '',
    assignedSpaceId: undefined,
  })
  const [editFormData, setEditFormData] = useState<UpdateUsuarioData>({
    nombre: '',
    correo: '',
    organizacion: '',
    rol: '',
    estado: undefined
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nombre || !formData.correo || !formData.organizacion || !formData.rol) {
      alert('Por favor, completa todos los campos obligatorios')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.correo)) {
      alert('Por favor, ingresa un correo electrónico válido')
      return
    }

    try {
      await crearUsuario({
        ...formData,
        estado: 'Pendiente'
      })
      
      setFormData({
        nombre: '',
        correo: '',
        organizacion: '',
        rol: '',
        assignedSpaceId: undefined,
      })
      
      setShowForm(false)
      alert('✅ Usuario creado exitosamente. Se ha enviado un correo para completar el registro.')
    } catch (error: any) {
      console.error('Error al crear usuario:', error)
      const errorMessage = error.message || 'Error al crear el usuario. Por favor, intenta nuevamente.'
      alert('❌ ' + errorMessage)
    }
  }

  const handleEditUsuario = (usuario: Usuario) => {
    setSelectedUsuario(usuario)
    setEditFormData({
      nombre: usuario.nombre,
      correo: usuario.correo,
      organizacion: usuario.organizacion,
      rol: usuario.rol,
      estado: usuario.estado
    })
    setShowEditModal(true)
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setSelectedUsuario(null)
    setEditFormData({
      nombre: '',
      correo: '',
      organizacion: '',
      rol: '',
      estado: undefined
    })
  }

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedUsuario) return

    if (!editFormData.nombre || !editFormData.correo || !editFormData.organizacion || !editFormData.rol) {
      alert('Por favor, completa todos los campos obligatorios')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(editFormData.correo)) {
      alert('Por favor, ingresa un correo electrónico válido')
      return
    }

    try {
      await actualizarUsuario(selectedUsuario.id, editFormData)
      closeEditModal()
      alert('✅ Usuario actualizado exitosamente')
    } catch (error: any) {
      console.error('Error al actualizar usuario:', error)
      const errorMessage = error.message || 'Error al actualizar el usuario. Por favor, intenta nuevamente.'
      alert('❌ ' + errorMessage)
    }
  }

  const handleDeleteUsuario = (usuario: Usuario) => {
    setSelectedUsuario(usuario)
    setShowDeleteModal(true)
  }

  const handleResetPassword = async (usuario: Usuario) => {
    if (confirm(`¿Estás seguro de que quieres resetear la contraseña de ${usuario.nombre}?\n\nSe generará una nueva contraseña temporal y se enviará por email.`)) {
      try {
        await resetearPasswordUsuario(usuario.id)
        alert('✅ Contraseña reseteada exitosamente. Se ha enviado un email con la nueva contraseña temporal.')
      } catch (error) {
        console.error('Error reseteando contraseña:', error)
        alert('❌ Error al resetear la contraseña')
      }
    }
  }

  const closeDeleteModal = () => {
    setShowDeleteModal(false)
    setSelectedUsuario(null)
  }

  const confirmDelete = async () => {
    if (!selectedUsuario) return

    try {
      if (selectedUsuario.estado === 'Inactivo') {
        // Si está inactivo, eliminarlo permanentemente
        await eliminarUsuario(selectedUsuario.id)
        closeDeleteModal()
        alert('✅ Usuario eliminado permanentemente')
      } else {
        // Si está activo o pendiente, solo desactivarlo
      await desactivarUsuario(selectedUsuario.id)
      closeDeleteModal()
        alert('✅ Usuario desactivado exitosamente')
      }
    } catch (error) {
      console.error('Error al procesar usuario:', error)
      alert('❌ Error al procesar el usuario. Por favor, intenta nuevamente.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header con botón de agregar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Usuarios Registrados</h3>
          <p className="text-sm text-gray-600 mt-1">{usuarios.length} usuarios en total</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Agregar Usuario
        </Button>
      </div>

      {/* Formulario de nuevo usuario */}
      {showForm && (
        <Reveal>
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <form onSubmit={handleSubmit} className="space-y-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Nuevo Usuario</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ingresa el nombre completo"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo electrónico *
                  </label>
                  <input
                    type="email"
                    name="correo"
                    value={formData.correo}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="usuario@empresa.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organización *
                  </label>
                  <select
                    name="organizacion"
                    value={formData.organizacion}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecciona una organización</option>
                    {organizaciones.map(org => (
                      <option key={org.id} value={org.nombre}>
                        {org.nombre} - {org.tipo}
                      </option>
                    ))}
                  </select>
                </div>

                {isSuperAdmin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Rol *
                    </label>
                    <select
                      name="rol"
                      value={formData.rol}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Selecciona un rol</option>
                      {roles
                        .filter(rol => rol.nombre !== 'Super Administrador') // Filtrar Super Admin
                        .map(rol => (
                          <option key={rol.id} value={rol.nombre}>
                            {rol.nombre}
                          </option>
                        ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Solo puedes asignar roles de tu nivel o inferiores
                    </p>
                  </div>
                )}

                {/* Campo para asignar espacio solo si el rol es Tablet */}
                {formData.rol === 'Tablet' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Espacio Asignado *
                    </label>
                    <select
                      name="assignedSpaceId"
                      value={formData.assignedSpaceId || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Selecciona un espacio</option>
                      {spaces
                        .filter(space => space.isActive)
                        .map(space => (
                          <option key={space.id} value={space.id}>
                            {space.name} - Capacidad: {space.capacity}
                          </option>
                        ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Los usuarios tipo Tablet solo pueden ver reservaciones de su espacio asignado
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  onClick={() => setShowForm(false)}
                  variant="ghost"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Crear Usuario
                </Button>
              </div>
            </form>
          </div>
        </Reveal>
      )}

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Correo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organización
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usuarios.map(usuario => (
                <tr key={usuario.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{usuario.nombre}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{usuario.correo}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{usuario.organizacion}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{usuario.rol}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn(
                      "px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full",
                      usuario.estado === 'Activo' && "bg-green-100 text-green-800",
                      usuario.estado === 'Pendiente' && "bg-yellow-100 text-yellow-800",
                      usuario.estado === 'Inactivo' && "bg-gray-100 text-gray-800"
                    )}>
                      {usuario.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEditUsuario(usuario)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Editar usuario"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleResetPassword(usuario)}
                        className="text-orange-600 hover:text-orange-900 p-1"
                        title="Resetear contraseña"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUsuario(usuario)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Desactivar usuario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {usuarios.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No hay usuarios registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de edición */}
      {showEditModal && selectedUsuario && (
        <Modal isOpen={showEditModal} onClose={closeEditModal}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white drop-shadow-md">Editar Usuario</h3>
              <button
                onClick={closeEditModal}
                className="text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveEdit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={editFormData.nombre || ''}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/60 text-white placeholder-white/60"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Correo electrónico *
                  </label>
                  <input
                    type="email"
                    name="correo"
                    value={editFormData.correo || ''}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/60 text-white placeholder-white/60"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Organización *
                  </label>
                  <select
                    name="organizacion"
                    value={editFormData.organizacion || ''}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/60 text-white"
                    required
                  >
                    <option value="" className="bg-gray-900">Selecciona una organización</option>
                    {organizaciones.map(org => (
                      <option key={org.id} value={org.nombre} className="bg-gray-900">
                        {org.nombre} - {org.tipo}
                      </option>
                    ))}
                  </select>
                </div>

                {isSuperAdmin && (
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Tipo de Rol *
                    </label>
                    <select
                      name="rol"
                      value={editFormData.rol || ''}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/60 text-white"
                      required
                    >
                      <option value="" className="bg-gray-900">Selecciona un rol</option>
                      {roles
                        .filter(rol => rol.nombre !== 'Super Administrador') // Filtrar Super Admin
                        .map(rol => (
                          <option key={rol.id} value={rol.nombre} className="bg-gray-900">
                            {rol.nombre}
                          </option>
                        ))}
                    </select>
                    <p className="mt-1 text-xs text-white/70">
                      Solo puedes asignar roles de tu nivel o inferiores
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Estado
                  </label>
                  <select
                    name="estado"
                    value={editFormData.estado || 'Activo'}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/60 text-white"
                  >
                    <option value="Activo" className="bg-gray-900">Activo</option>
                    <option value="Pendiente" className="bg-gray-900">Pendiente</option>
                    <option value="Inactivo" className="bg-gray-900">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-white/30">
                <Button
                  type="button"
                  onClick={closeEditModal}
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-500/30 hover:bg-blue-500/50 text-white border border-white/30"
                >
                  Guardar Cambios
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* Modal de confirmación de eliminación/desactivación */}
      {showDeleteModal && selectedUsuario && (
        <Modal isOpen={showDeleteModal} onClose={closeDeleteModal}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white drop-shadow-md">
                {selectedUsuario.estado === 'Inactivo' 
                  ? 'Confirmar Eliminación' 
                  : 'Confirmar Desactivación'}
              </h3>
              <button
                onClick={closeDeleteModal}
                className="text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {selectedUsuario.estado === 'Inactivo' ? (
                <>
                  <div className="flex items-start space-x-3 p-4 bg-red-500/20 border border-red-400/30 rounded-lg backdrop-blur-sm">
                    <AlertCircle className="w-5 h-5 text-red-200 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-white mb-1">
                        ⚠️ Esta acción es permanente
                      </p>
                      <p className="text-sm text-white">
                        ¿Estás seguro de que deseas <strong className="text-red-200">eliminar permanentemente</strong> al usuario <strong>{selectedUsuario.nombre}</strong>?
                      </p>
                      <p className="text-sm text-white/80 mt-2">
                        Esta acción no se puede deshacer. Todos los datos del usuario serán eliminados de la base de datos.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
              <div className="flex items-start space-x-3 p-4 bg-yellow-500/20 border border-yellow-400/30 rounded-lg backdrop-blur-sm">
                <AlertCircle className="w-5 h-5 text-yellow-200 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-white">
                    ¿Estás seguro de que deseas desactivar al usuario <strong>{selectedUsuario.nombre}</strong>?
                  </p>
                  <p className="text-sm text-white/80 mt-2">
                        El usuario será desactivado pero no se eliminará de la base de datos, manteniendo su historial para futuras referencias.
                  </p>
                </div>
              </div>
                  <div className="p-3 bg-blue-500/20 border border-blue-400/30 rounded-lg backdrop-blur-sm">
                    <p className="text-xs text-white">
                      💡 <strong>Tip:</strong> Una vez desactivado, podrás eliminarlo permanentemente desde esta misma opción.
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-white/30 mt-6">
              <Button
                type="button"
                onClick={closeDeleteModal}
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmDelete}
                className={cn(
                  "text-white border border-white/30",
                  selectedUsuario.estado === 'Inactivo'
                    ? "bg-red-500/30 hover:bg-red-500/50"
                    : "bg-orange-500/30 hover:bg-orange-500/50"
                )}
              >
                {selectedUsuario.estado === 'Inactivo' 
                  ? '🗑️ Eliminar Permanentemente' 
                  : '⚠️ Desactivar Usuario'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ===== COMPONENTE DE ORGANIZACIONES =====
function OrganizacionesContent() {
  const { organizaciones, cargarOrganizaciones, crearOrganizacion, actualizarOrganizacion, desactivarOrganizacion, eliminarOrganizacion } = useUsuarios()
  const [showForm, setShowForm] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedOrganizacion, setSelectedOrganizacion] = useState<Organizacion | null>(null)
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'Externa' as 'Interna' | 'Externa',
    descripcion: '',
    contacto: '',
    telefono: '',
    correo: '',
    tieneLimiteHoras: false,
    limiteHoras: undefined as number | undefined
  })
  const [editFormData, setEditFormData] = useState({
    nombre: '',
    tipo: 'Externa' as 'Interna' | 'Externa',
    descripcion: '',
    contacto: '',
    telefono: '',
    correo: '',
    tieneLimiteHoras: false,
    limiteHoras: undefined as number | undefined
  })

  // Recargar datos al montar
  useEffect(() => {
    cargarOrganizaciones()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleLimiteHorasToggle = () => {
    setFormData(prev => ({
      ...prev,
      tieneLimiteHoras: !prev.tieneLimiteHoras,
      limiteHoras: !prev.tieneLimiteHoras ? prev.limiteHoras : undefined
    }))
  }

  const handleEditLimiteHorasToggle = () => {
    setEditFormData(prev => ({
      ...prev,
      tieneLimiteHoras: !prev.tieneLimiteHoras,
      limiteHoras: !prev.tieneLimiteHoras ? prev.limiteHoras : undefined
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nombre) {
      alert('Por favor, ingresa el nombre de la organización')
      return
    }

    if (formData.tieneLimiteHoras && (!formData.limiteHoras || formData.limiteHoras <= 0)) {
      alert('Por favor, ingresa un límite de horas válido')
      return
    }

    try {
      await crearOrganizacion({
        nombre: formData.nombre,
        tipo: formData.tipo,
        descripcion: formData.descripcion,
        contacto: formData.contacto,
        telefono: formData.telefono,
        correo: formData.correo,
        tieneLimiteHoras: formData.tieneLimiteHoras,
        limiteHoras: formData.limiteHoras,
        estado: 'Activa'
      })
      alert('✅ Organización creada exitosamente')
      setShowForm(false)
      setFormData({
        nombre: '',
        tipo: 'Externa',
        descripcion: '',
        contacto: '',
        telefono: '',
        correo: '',
        tieneLimiteHoras: false,
        limiteHoras: undefined
      })
    } catch (error) {
      console.error('Error al crear organización:', error)
      alert('❌ Error al crear la organización')
    }
  }

  const handleEditOrganizacion = (org: Organizacion) => {
    setSelectedOrganizacion(org)
    setEditFormData({
      nombre: org.nombre,
      tipo: org.tipo,
      descripcion: org.descripcion || '',
      contacto: org.contacto || '',
      telefono: org.telefono || '',
      correo: org.correo || '',
      tieneLimiteHoras: org.tieneLimiteHoras,
      limiteHoras: org.limiteHoras
    })
    setShowEditModal(true)
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setSelectedOrganizacion(null)
  }

  const handleUpdateOrganizacion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOrganizacion) return

    if (!editFormData.nombre) {
      alert('Por favor, ingresa el nombre de la organización')
      return
    }

    if (editFormData.tieneLimiteHoras && (!editFormData.limiteHoras || editFormData.limiteHoras <= 0)) {
      alert('Por favor, ingresa un límite de horas válido')
      return
    }

    try {
      await actualizarOrganizacion(selectedOrganizacion.id, {
        nombre: editFormData.nombre,
        tipo: editFormData.tipo,
        descripcion: editFormData.descripcion,
        contacto: editFormData.contacto,
        telefono: editFormData.telefono,
        correo: editFormData.correo,
        tieneLimiteHoras: editFormData.tieneLimiteHoras,
        limiteHoras: editFormData.limiteHoras
      })
      closeEditModal()
      alert('✅ Organización actualizada exitosamente')
    } catch (error) {
      console.error('Error al actualizar organización:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar la organización. Por favor, intenta nuevamente.'
      alert('❌ ' + errorMessage)
    }
  }

  const handleDeleteOrganizacion = (org: Organizacion) => {
    setSelectedOrganizacion(org)
    setShowDeleteModal(true)
  }

  const closeDeleteModal = () => {
    setShowDeleteModal(false)
    setSelectedOrganizacion(null)
  }

  const confirmDelete = async () => {
    if (!selectedOrganizacion) return

    try {
      if (selectedOrganizacion.estado === 'Inactiva') {
        // Si está inactiva, eliminarla permanentemente
        await eliminarOrganizacion(selectedOrganizacion.id)
        closeDeleteModal()
        alert('✅ Organización eliminada permanentemente')
      } else {
        // Si está activa, solo desactivarla
        await desactivarOrganizacion(selectedOrganizacion.id)
        closeDeleteModal()
        alert('✅ Organización desactivada exitosamente')
      }
    } catch (error) {
      console.error('Error al procesar organización:', error)
      alert('❌ Error al procesar la organización. Por favor, intenta nuevamente.')
    }
  }

  const calcularPorcentajeHoras = (org: Organizacion) => {
    if (!org.tieneLimiteHoras || !org.limiteHoras) return 0
    const porcentaje = ((org.horasUsadas || 0) / org.limiteHoras) * 100
    return Math.min(100, Math.max(0, porcentaje))
  }

  return (
    <div className="space-y-6">
      {/* Header con botón de agregar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Organizaciones</h3>
          <p className="text-sm text-gray-600 mt-1">{organizaciones.length} organizaciones registradas</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Agregar Organización
        </Button>
      </div>

      {/* Formulario de nueva organización */}
      {showForm && (
        <Reveal>
    <div className="bg-white rounded-lg p-6 shadow-sm border">
            <form onSubmit={handleSubmit} className="space-y-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Nueva Organización</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la Empresa *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej. Empresa ABC S.A."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo *
                  </label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="Externa">Externa</option>
                    <option value="Interna">Interna</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descripción opcional de la organización"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Persona de Contacto
                  </label>
                  <input
                    type="text"
                    name="contacto"
                    value={formData.contacto}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nombre del contacto"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+52 55 1234 5678"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    name="correo"
                    value={formData.correo}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="contacto@empresa.com"
                  />
                </div>
              </div>

              {/* Sección de Límite de Horas */}
              <div className="border-t pt-6 mt-6">
                <h5 className="text-md font-semibold text-gray-900 mb-4">Control de Horas</h5>
                
                <div className="flex items-center space-x-3 mb-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.tieneLimiteHoras}
                      onChange={handleLimiteHorasToggle}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ml-3 text-sm font-medium text-gray-700">
                      {formData.tieneLimiteHoras ? 'Con límite de horas' : 'Sin límite de horas'}
                    </span>
                  </label>
                </div>

                {formData.tieneLimiteHoras && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4"
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Límite de Horas Totales *
                    </label>
                    <input
                      type="number"
                      name="limiteHoras"
                      value={formData.limiteHoras || ''}
                      onChange={handleInputChange}
                      min="1"
                      step="0.5"
                      className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej. 40"
                      required={formData.tieneLimiteHoras}
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      💡 Las horas son compartidas entre <strong>TODOS los espacios</strong>. Si pones 5 horas, serán 5 horas totales que la organización puede usar en cualquier espacio.
                    </p>
                  </motion.div>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  onClick={() => setShowForm(false)}
                  variant="ghost"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Crear Organización
                </Button>
              </div>
            </form>
          </div>
        </Reveal>
      )}

      {/* Lista de organizaciones */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organización
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Límite de Horas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uso de Horas
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {organizaciones.map((org) => {
                const porcentaje = calcularPorcentajeHoras(org)
                const horasRestantes = org.tieneLimiteHoras && org.limiteHoras 
                  ? org.limiteHoras - (org.horasUsadas || 0) 
                  : null
                
                return (
                  <tr key={org.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{org.nombre}</div>
                        {org.descripcion && (
                          <div className="text-xs text-gray-500">{org.descripcion}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full",
                        org.tipo === 'Interna' 
                          ? "bg-blue-100 text-blue-800" 
                          : "bg-green-100 text-green-800"
                      )}>
                        {org.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full",
                        org.estado === 'Activa' 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-800"
                      )}>
                        {org.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{org.contacto || '-'}</div>
                      {org.telefono && (
                        <div className="text-xs text-gray-500">{org.telefono}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {org.tieneLimiteHoras ? (
                        <div className="text-sm text-gray-900">
                          {org.limiteHoras} horas
                        </div>
                      ) : (
                        <span className="text-sm text-green-600 font-medium">Sin límite</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {org.tieneLimiteHoras && org.limiteHoras ? (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">
                              {org.horasUsadas || 0} / {org.limiteHoras} hrs
                            </span>
                            <span className={cn(
                              "font-medium",
                              porcentaje >= 90 ? "text-red-600" :
                              porcentaje >= 70 ? "text-yellow-600" :
                              "text-green-600"
                            )}>
                              {porcentaje.toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={cn(
                                "h-2 rounded-full transition-all",
                                porcentaje >= 90 ? "bg-red-500" :
                                porcentaje >= 70 ? "bg-yellow-500" :
                                "bg-green-500"
                              )}
                              style={{ width: `${porcentaje}%` }}
                            />
                          </div>
                          {horasRestantes !== null && (
                            <div className="text-xs text-gray-500">
                              {horasRestantes > 0 
                                ? `${horasRestantes.toFixed(1)} hrs restantes` 
                                : 'Sin horas disponibles'}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        onClick={() => handleEditOrganizacion(org)}
                        title="Editar organización"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className={cn(
                          "hover:text-red-900",
                          org.estado === 'Inactiva' ? "text-red-700" : "text-red-600"
                        )}
                        onClick={() => handleDeleteOrganizacion(org)}
                        title={org.estado === 'Inactiva' ? 'Eliminar permanentemente' : 'Desactivar organización'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {organizaciones.length === 0 && (
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay organizaciones registradas</h3>
            <p className="text-gray-600 mb-4">
              Crea tu primera organización para comenzar a gestionar usuarios
            </p>
            <Button
              onClick={() => setShowForm(true)}
              leftIcon={<Plus className="w-4 h-4" />}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Crear Primera Organización
            </Button>
          </div>
        )}
      </div>

      {/* Modal de edición */}
      {showEditModal && selectedOrganizacion && (
        <Modal isOpen={showEditModal} onClose={closeEditModal}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white drop-shadow-md">Editar Organización</h3>
              <button
                onClick={closeEditModal}
                className="text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateOrganizacion} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Nombre de la Empresa *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={editFormData.nombre}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/60 text-white placeholder-white/60"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Tipo *
                  </label>
                  <select
                    name="tipo"
                    value={editFormData.tipo}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/60 text-white"
                    required
                  >
                    <option value="Externa" className="bg-gray-900">Externa</option>
                    <option value="Interna" className="bg-gray-900">Interna</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-white mb-2">
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    value={editFormData.descripcion}
                    onChange={handleEditInputChange}
                    rows={3}
                    className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/60 text-white placeholder-white/60"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Persona de Contacto
                  </label>
                  <input
                    type="text"
                    name="contacto"
                    value={editFormData.contacto}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/60 text-white placeholder-white/60"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={editFormData.telefono}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/60 text-white placeholder-white/60"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-white mb-2">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    name="correo"
                    value={editFormData.correo}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/60 text-white placeholder-white/60"
                  />
                </div>
              </div>

              {/* Sección de Límite de Horas */}
              <div className="border-t border-white/30 pt-6 mt-6">
                <h5 className="text-md font-semibold text-white mb-4">Control de Horas</h5>
                
                <div className="flex items-center space-x-3 mb-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editFormData.tieneLimiteHoras}
                      onChange={handleEditLimiteHorasToggle}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-white/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500/50"></div>
                    <span className="ml-3 text-sm font-medium text-white">
                      {editFormData.tieneLimiteHoras ? 'Con límite de horas' : 'Sin límite de horas'}
                    </span>
                  </label>
                </div>

                {editFormData.tieneLimiteHoras && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4"
                  >
                    <label className="block text-sm font-medium text-white mb-2">
                      Límite de Horas Totales *
                    </label>
                    <input
                      type="number"
                      name="limiteHoras"
                      value={editFormData.limiteHoras || ''}
                      onChange={handleEditInputChange}
                      min="1"
                      step="0.5"
                      className="w-full md:w-64 px-3 py-2 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/60 text-white placeholder-white/60"
                      required={editFormData.tieneLimiteHoras}
                    />
                    <p className="mt-2 text-xs text-white/70">
                      💡 Las horas son compartidas entre <strong>TODOS los espacios</strong>.
                    </p>
                  </motion.div>
                )}
              </div>

              <div className="flex justify-end space-x-3 border-t border-white/30 pt-4">
                <Button
                  type="button"
                  onClick={closeEditModal}
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-500/30 hover:bg-blue-500/50 text-white border border-white/30"
                >
                  Guardar Cambios
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* Modal de confirmación de eliminación/desactivación */}
      {showDeleteModal && selectedOrganizacion && (
        <Modal isOpen={showDeleteModal} onClose={closeDeleteModal}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white drop-shadow-md">
                {selectedOrganizacion.estado === 'Inactiva' 
                  ? 'Confirmar Eliminación' 
                  : 'Confirmar Desactivación'}
              </h3>
              <button
                onClick={closeDeleteModal}
                className="text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {selectedOrganizacion.estado === 'Inactiva' ? (
                <>
                  <div className="flex items-start space-x-3 p-4 bg-red-500/20 border border-red-400/30 rounded-lg backdrop-blur-sm">
                    <AlertCircle className="w-5 h-5 text-red-200 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-white mb-1">
                        ⚠️ Esta acción es permanente
                      </p>
                      <p className="text-sm text-white">
                        ¿Estás seguro de que deseas <strong className="text-red-200">eliminar permanentemente</strong> la organización <strong>{selectedOrganizacion.nombre}</strong>?
                      </p>
                      <p className="text-sm text-white/80 mt-2">
                        Esta acción no se puede deshacer. Todos los datos de la organización serán eliminados de la base de datos.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start space-x-3 p-4 bg-yellow-500/20 border border-yellow-400/30 rounded-lg backdrop-blur-sm">
                    <AlertCircle className="w-5 h-5 text-yellow-200 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-white">
                        ¿Estás seguro de que deseas desactivar la organización <strong>{selectedOrganizacion.nombre}</strong>?
                      </p>
                      <p className="text-sm text-white/80 mt-2">
                        La organización será desactivada pero no se eliminará de la base de datos, manteniendo su historial para futuras referencias.
                      </p>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-500/20 border border-blue-400/30 rounded-lg backdrop-blur-sm">
                    <p className="text-xs text-white">
                      💡 <strong>Tip:</strong> Una vez desactivada, podrás eliminarla permanentemente desde esta misma opción.
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-white/30 mt-6">
              <Button
                type="button"
                onClick={closeDeleteModal}
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmDelete}
                className={cn(
                  "text-white border border-white/30",
                  selectedOrganizacion.estado === 'Inactiva'
                    ? "bg-red-500/30 hover:bg-red-500/50"
                    : "bg-orange-500/30 hover:bg-orange-500/50"
                )}
              >
                {selectedOrganizacion.estado === 'Inactiva' 
                  ? '🗑️ Eliminar Permanentemente' 
                  : '⚠️ Desactivar Organización'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export function DashboardSection() {
  const { user, permissions, logout } = useAuth()
  const router = useRouter()
  
  // Determinar tab inicial según permisos
  const getInitialTab = () => {
    if (!permissions) return "reservations"
    if (permissions.canViewDashboard) return "dashboard"
    if (permissions.canViewReservations) return "reservations"
    return "reservations"
  }
  
  const [activeTab, setActiveTab] = useState(getInitialTab())
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [spacesTab, setSpacesTab] = useState("espacios")
  const [usersTab, setUsersTab] = useState("usuarios")
  
  // Estados para gestión de espacios
  const [spaces, setSpaces] = useState<Space[]>([])
  const [tags, setTags] = useState<SpaceTag[]>([])
  const [showSpaceForm, setShowSpaceForm] = useState(false)
  const [showTagForm, setShowTagForm] = useState(false)
  const [showSpaceDetails, setShowSpaceDetails] = useState(false)
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null)
  const [spaceDetailsReadOnly, setSpaceDetailsReadOnly] = useState(false)
  const [editingSpaceId, setEditingSpaceId] = useState<string | null>(null)
  const [editingTagId, setEditingTagId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Estados para gestión de reservas
  const [viewMode, setViewMode] = useState<'day' | 'month' | 'list' | 'map'>('list') // Default to list for better mobile UX
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showActionsMenu, setShowActionsMenu] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [showReservationModal, setShowReservationModal] = useState(false)
  const [showReservationForm, setShowReservationForm] = useState(false)
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null)
  const [preselectedSpace, setPreselectedSpace] = useState<string>('')
  const [preselectedTime, setPreselectedTime] = useState<string>('')
  
  // Estados para vista de lista
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filterSpace, setFilterSpace] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [filterMeetingType, setFilterMeetingType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterOrganization, setFilterOrganization] = useState('')
  const [filterUser, setFilterUser] = useState('')
  
  // Estados para navegación de espacios
  const [spacePage, setSpacePage] = useState(0)
  
  // Estado para hover grupal de reservas
  const [hoveredReservationId, setHoveredReservationId] = useState<string | null>(null)
  
  // Estados para modos CRUD
  const [editMode, setEditMode] = useState(false)
  const [deleteMode, setDeleteMode] = useState(false)
  const [cancelMode, setCancelMode] = useState(false)
  const [selectedReservationForAction, setSelectedReservationForAction] = useState<Reservation | null>(null)

  // Variables calculadas para navegación de espacios
  const spacesPerPage = sidebarOpen ? 4 : 6
  const totalSpacePages = Math.ceil(spaces.length / spacesPerPage)
  const currentSpaces = spaces.slice(spacePage * spacesPerPage, (spacePage + 1) * spacesPerPage)

  // Estados del formulario de espacio
  const [newSpace, setNewSpace] = useState<CreateSpaceData>({
    name: '',
    type: 'meeting-room',
    capacity: 1,
    location: '',
    amenities: [],
    setupTypes: [],
    isActive: true,
    requiresCatering: false,
    requiresGuestList: false,
    availableHours: {
      start: '08:00',
      end: '18:00'
    },
    tags: [],
    backgroundImage: '',
    description: ''
  })

  // Estados para gestión de amenidades y tipos de acomodo
  const [availableAmenities, setAvailableAmenities] = useState([
    'Proyector', 'Pizarra', 'WiFi', 'Aire acondicionado', 'Cafetera', 'Refrigerador'
  ])
  const [availableSetupTypes, setAvailableSetupTypes] = useState([
    'U-Shape', 'Teatro', 'Clase', 'Cabaret', 'Reunión'
  ])
  const [newAmenity, setNewAmenity] = useState('')
  const [newSetupType, setNewSetupType] = useState('')
  
  // Estado para imagen de espacio
  const [spaceImageFile, setSpaceImageFile] = useState<File | null>(null)
  const [spaceImagePreview, setSpaceImagePreview] = useState<string>('')

  // Estados del formulario de tag
  const [newTag, setNewTag] = useState<CreateTagData>({
    name: '',
    color: '#3CC47C',
    allowedDays: [],
    allowedHours: {
      start: '08:00',
      end: '18:00'
    },
    description: ''
  })

  // Cargar todos los datos al inicio
  useEffect(() => {
    // Siempre cargar reservations y espacios
    loadReservations()
    loadSpaces()
    // Si empezamos en la pestaña de spaces, cargar tags inmediatamente
    if (activeTab === 'spaces') {
      loadTags()
    }
  }, [])

  // Recargar tags cada vez que se cambia a la pestaña de espacios
  useEffect(() => {
    if (activeTab === 'spaces') {
      loadTags()
    }
  }, [activeTab])

  // Resetear página cuando cambie el número de espacios por página
  useEffect(() => {
    if (spacePage >= totalSpacePages && totalSpacePages > 0) {
      setSpacePage(Math.max(0, totalSpacePages - 1))
    }
  }, [spacesPerPage, totalSpacePages, spacePage])

  // Forzar vista 'list' en pantallas < 1024px si está en 'day' o 'month'
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && (viewMode === 'day' || viewMode === 'month')) {
        setViewMode('list')
      }
    }

    // Check inicial
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [viewMode])

  // Cerrar date picker cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDatePicker && !(event.target as Element).closest('.date-selector')) {
        setShowDatePicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDatePicker])

  // Efecto para manejar las sombras del sidebar cuando se abren modales
  useEffect(() => {
    if (showSpaceForm || showTagForm) {
      document.body.classList.add('modal-open')
    } else {
      document.body.classList.remove('modal-open')
    }

    return () => {
      document.body.classList.remove('modal-open')
    }
  }, [showSpaceForm, showTagForm])

  // Efecto para cerrar modal con tecla ESC
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showReservationModal) {
        setShowReservationModal(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showReservationModal])

  const loadSpaces = async () => {
    console.log('🔄 Loading spaces...')
    setIsLoading(true)
    try {
      const spacesData = await spacesAPI.getAll()
      console.log('✅ Spaces loaded:', spacesData.length, 'spaces')
      setSpaces(spacesData)
    } catch (error) {
      console.error('❌ Error loading spaces:', error)
      setSpaces([])
    } finally {
      setIsLoading(false)
    }
  }

  const loadTags = async () => {
    console.log('🔄 Loading tags...')
    try {
      const tagsData = await spaceTagsAPI.getAll()
      console.log('✅ Tags loaded:', tagsData.length, 'tags')
      setTags(tagsData)
    } catch (error) {
      console.error('❌ Error loading tags:', error)
      setTags([])
    }
  }

  const loadReservations = async () => {
    console.log('🔄 Loading reservations...')
    try {
      const reservationsData = await reservationsAPI.getAll()
      console.log('✅ Reservations loaded:', reservationsData.length, 'reservations')
      
      // Filtrar reservas según el rol del usuario
      let filteredReservations = reservationsData
      
      if (user?.rol === 'Usuario' && user?.organizacion) {
        // Usuario solo ve reservas de su organización
        filteredReservations = reservationsData.filter((res: any) => 
          res.company === user.organizacion
        )
        console.log(`📋 Filtrando reservas para organización "${user.organizacion}":`, filteredReservations.length)
      } else if (user?.rol === 'Tablet' && user?.assignedSpaceId) {
        // Tablet solo ve reservas de su espacio asignado
        filteredReservations = reservationsData.filter((res: any) => 
          res.space?.id === user.assignedSpaceId
        )
        console.log(`📋 Filtrando reservas para espacio "${user.assignedSpaceId}":`, filteredReservations.length)
      }
      
      // Transformar datos del API al formato esperado
      const transformedReservations: Reservation[] = filteredReservations.map((res: any) => ({
        id: res.id,
        title: res.title,
        date: res.date,
        startTime: res.startTime,
        endTime: res.endTime,
        space: res.space,
        coordinatorName: res.coordinatorName,
        coordinatorEmail: res.coordinatorEmail,
        coordinatorPhone: res.coordinatorPhone,
        company: res.company,
        numberOfPeople: res.numberOfPeople,
        meetingType: res.meetingType,
        setupType: res.setupType,
        coffeeBreak: res.coffeeBreak,
        cateringProvider: res.cateringProvider,
        cateringStaff: res.cateringStaff,
        notes: res.notes,
        status: res.status || 'pending',
        createdAt: res.createdAt,
        updatedAt: res.updatedAt
      }))
      setReservations(transformedReservations)
    } catch (error) {
      console.error('❌ Error loading reservations:', error)
      setReservations([])
    }
  }

  // Horarios principales (cada 30 minutos)
  const timeSlots: string[] = []
  for (let hour = 8; hour <= 20; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`)
    if (hour < 20) {
      timeSlots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
  }

  // Funciones de utilidad
  const formatDateHeader = (date: Date) => {
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (time: string) => {
    return time
  }

  // Filtro base para usuarios tablet (solo su espacio asignado)
  const getBaseReservations = () => {
    if (user?.rol === 'Tablet' && user?.assignedSpaceId) {
      return reservations.filter(r => r.space.id === user.assignedSpaceId)
    }
    return reservations
  }

  const getReservationsForDayAndSpace = (date: Date, spaceId: string) => {
    const dateStr = date.toISOString().split('T')[0]
    const baseReservations = getBaseReservations()
    return baseReservations.filter(r => 
      r.date === dateStr && r.space.id === spaceId
    )
  }

  const getReservationsForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    const baseReservations = getBaseReservations()
    return baseReservations.filter(r => r.date === dateStr)
  }

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear()
  }

  const generateCalendarDays = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    
    // Primer día del mes
    const firstDay = new Date(year, month, 1)
    // Último día del mes
    const lastDay = new Date(year, month + 1, 0)
    
    // Día de la semana del primer día (0 = domingo, 1 = lunes, etc.)
    const firstDayOfWeek = firstDay.getDay()
    // Ajustar para que lunes sea 0
    const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1
    
    const days = []
    
    // Días del mes anterior
    const prevMonth = new Date(year, month - 1, 0)
    for (let i = adjustedFirstDay - 1; i >= 0; i--) {
      const day = new Date(year, month - 1, prevMonth.getDate() - i)
      days.push({ date: day, isCurrentMonth: false })
    }
    
    // Días del mes actual
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const dateObj = new Date(year, month, day)
      days.push({ date: dateObj, isCurrentMonth: true })
    }
    
    // Días del mes siguiente para completar la cuadrícula
    const remainingDays = 42 - days.length // 6 semanas * 7 días
    for (let day = 1; day <= remainingDays; day++) {
      const dateObj = new Date(year, month + 1, day)
      days.push({ date: dateObj, isCurrentMonth: false })
    }
    
    return days
  }

  const isReservationComplete = (reservation: Reservation) => {
    return reservation.coordinatorName && 
           reservation.coordinatorPhone && 
           reservation.company && 
           reservation.numberOfPeople
  }

  const isReservationCancelled = (reservation: Reservation) => {
    return reservation.status === 'cancelled'
  }

  // Funciones de manejo de reservas
  const handleReservationClick = (reservation: Reservation) => {
    // Si estamos en modo de acción, usar la función específica
    if (editMode || deleteMode || cancelMode) {
      handleReservationSelectForAction(reservation)
    } else {
      // Comportamiento normal: mostrar modal de detalles
      setSelectedReservation(reservation)
      setShowReservationModal(true)
    }
  }

  const handleTimeSlotClick = (time: string, spaceId: string) => {
    // Abrir formulario de nueva reservación
    setPreselectedSpace(spaceId)
    setPreselectedTime(time)
    setEditingReservation(null)
    setShowReservationForm(true)
  }
  
  const handleEditReservation = (reservation: Reservation) => {
    console.log('🔧 Abriendo modal de edición para reservación:', reservation.id);
    console.log('📧 Email en la reservación:', reservation.coordinatorEmail);
    console.log('📞 Teléfono en la reservación:', reservation.coordinatorPhone);
    setEditingReservation(reservation)
    setShowReservationForm(true)
  }
  
  const handleReservationFormSuccess = async () => {
    // Recargar reservaciones después de crear/editar
    console.log('🔄 Recargando reservaciones después de guardar...')
    
    // Guardar el ID de la reserva seleccionada si existe
    const selectedId = selectedReservation?.id
    
    await loadReservations()
    console.log('✅ Reservaciones recargadas')
    
    // Si había una reserva seleccionada, actualizarla con los datos nuevos
    if (selectedId && showReservationModal) {
      const allReservations = await reservationsAPI.getAll()
      const updatedReservation = allReservations.find(r => r.id === selectedId)
      if (updatedReservation) {
        console.log('🔄 Actualizando reservación seleccionada en el modal')
        setSelectedReservation(updatedReservation as any)
      }
    }
  }

  const prevSpacePage = () => {
    setSpacePage(Math.max(0, spacePage - 1))
  }

  const nextSpacePage = () => {
    setSpacePage(Math.min(totalSpacePages - 1, spacePage + 1))
  }

  // Filtros para vista de lista
  const filteredReservations = getBaseReservations().filter(reservation => {
    const matchesSearch = (reservation.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (reservation.coordinatorName && reservation.coordinatorName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (reservation.company && reservation.company.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesSpace = !filterSpace || (reservation.space && reservation.space.name === filterSpace)
    const matchesDate = !filterDate || reservation.date === filterDate
    const matchesMeetingType = !filterMeetingType || reservation.meetingType === filterMeetingType
    const matchesStatus = !filterStatus || 
      (filterStatus === 'complete' && isReservationComplete(reservation)) ||
      (filterStatus === 'incomplete' && !isReservationComplete(reservation))
    const matchesOrganization = !filterOrganization || (reservation.company && reservation.company.toLowerCase().includes(filterOrganization.toLowerCase()))
    const matchesUser = !filterUser || (reservation.coordinatorName && reservation.coordinatorName.toLowerCase().includes(filterUser.toLowerCase()))

    return matchesSearch && matchesSpace && matchesDate && matchesMeetingType && matchesStatus && matchesOrganization && matchesUser
  })

  const clearAllFilters = () => {
    setSearchQuery('')
    setFilterSpace('')
    setFilterDate('')
    setFilterMeetingType('')
    setFilterStatus('')
    setFilterOrganization('')
    setFilterUser('')
  }

  const handleDelete = async (reservationId: string) => {
    if (window.confirm('¿Estás seguro de que quieres cancelar esta reservación?')) {
      try {
        await reservationsAPI.delete(reservationId)
        setReservations(reservations.filter(r => r.id !== reservationId))
        alert('Reservación cancelada exitosamente')
      } catch (error) {
        console.error('Error deleting reservation:', error)
        alert('Error al cancelar la reservación')
      }
    }
  }

  // Funciones para modos CRUD
  const handleEditMode = () => {
    setEditMode(true)
    setDeleteMode(false)
    setCancelMode(false)
    setSelectedReservationForAction(null)
  }

  const handleDeleteMode = () => {
    setDeleteMode(true)
    setEditMode(false)
    setCancelMode(false)
    setSelectedReservationForAction(null)
  }

  const handleCancelMode = () => {
    setCancelMode(true)
    setEditMode(false)
    setDeleteMode(false)
    setSelectedReservationForAction(null)
  }

  const exitActionMode = () => {
    setEditMode(false)
    setDeleteMode(false)
    setCancelMode(false)
    setSelectedReservationForAction(null)
  }

  const handleReservationSelectForAction = (reservation: Reservation) => {
    if (editMode) {
      setSelectedReservationForAction(reservation)
      // Abrir modal de edición
      setSelectedReservation(reservation)
      setShowReservationModal(true)
    } else if (deleteMode) {
      if (window.confirm(`¿Estás seguro de que quieres eliminar la reservación "${reservation.title}"?`)) {
        handleDelete(reservation.id)
        exitActionMode()
      }
    } else if (cancelMode) {
      if (window.confirm(`¿Estás seguro de que quieres cancelar la reservación "${reservation.title}"?`)) {
        handleReservationCancel(reservation.id)
        exitActionMode()
      }
    }
  }

  const handleReservationCancel = async (reservationId: string) => {
    try {
      // Marcar la reservación como cancelada
      const updatedReservations = reservations.map(r => 
        r.id === reservationId ? { ...r, status: 'cancelled' as const } : r
      )
      setReservations(updatedReservations)
      alert('Reservación cancelada exitosamente')
    } catch (error) {
      console.error('Error cancelling reservation:', error)
      alert('Error al cancelar la reservación')
    }
  }

  // Filtrar items del sidebar según permisos
  const allSidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, permission: permissions?.canViewDashboard },
    { id: "reservations", label: user?.rol === 'Tablet' ? "Estado del Espacio" : "Mis Reservas", icon: Calendar, permission: permissions?.canViewReservations },
    { id: "spaces", label: "Gestión de espacios", icon: Settings, permission: permissions?.canManageSpaces },
    { id: "users", label: "Gestión de usuarios", icon: Users, permission: permissions?.canManageUsers }
  ]
  
  const sidebarItems = allSidebarItems.filter(item => item.permission)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "available":
        return "bg-blue-100 text-blue-800"
      case "occupied":
        return "bg-red-100 text-red-800"
      case "maintenance":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />
      case "pending":
        return <Clock className="w-4 h-4" />
      case "available":
        return <CheckCircle className="w-4 h-4" />
      case "occupied":
        return <AlertCircle className="w-4 h-4" />
      case "maintenance":
        return <Settings className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  // Funciones para manejar espacios
  const handleCreateSpace = () => {
    setEditingSpaceId(null)
    setNewSpace({
      name: '',
      type: 'meeting-room',
      capacity: 1,
      location: '',
      amenities: [],
      setupTypes: [],
      isActive: true,
      requiresCatering: false,
      requiresGuestList: false,
      availableHours: {
        start: '08:00',
        end: '18:00'
      },
      tags: [],
      backgroundImage: '',
      description: ''
    })
    // Limpiar estado de imagen
    setSpaceImageFile(null)
    setSpaceImagePreview('')
    setShowSpaceForm(true)
  }

  const handleEditSpace = (space: Space) => {
    setEditingSpaceId(space.id)
    setNewSpace({
      name: space.name,
      type: space.type,
      capacity: space.capacity,
      location: space.location,
      amenities: space.amenities,
      setupTypes: space.setupTypes,
      isActive: space.isActive,
      requiresCatering: space.requiresCatering,
      requiresGuestList: space.requiresGuestList,
      availableHours: space.availableHours || {
        start: '08:00',
        end: '18:00'
      },
      tags: space.tags,
      backgroundImage: space.backgroundImage || '',
      description: space.description || ''
    })
    // Limpiar estado de imagen nueva, pero mantener la imagen existente
    setSpaceImageFile(null)
    setSpaceImagePreview('')
    setShowSpaceForm(true)
  }

  const handleViewSpaceDetails = (space: Space, readOnly: boolean = false) => {
    setSelectedSpace(space)
    setSpaceDetailsReadOnly(readOnly)
    setShowSpaceDetails(true)
  }

  const handleDeleteSpace = async (spaceId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este espacio?')) {
      try {
        await spacesAPI.delete(spaceId)
        setSpaces(spaces.filter(space => space.id !== spaceId))
        alert('Espacio eliminado correctamente')
      } catch (error) {
        console.error('Error deleting space:', error)
        alert('Error al eliminar el espacio')
      }
    }
  }

  const handleSaveSpace = async () => {
    setIsLoading(true)
    try {
      let imageUrl = newSpace.backgroundImage;
      
      // Si hay una nueva imagen seleccionada, subirla primero
      if (spaceImageFile) {
        try {
          imageUrl = await storageAPI.uploadImage(spaceImageFile, 'spaces');
        } catch (error) {
          console.error('Error subiendo imagen:', error);
          alert('Error al subir la imagen. El espacio se guardará sin imagen.');
          imageUrl = '';
        }
      }
      
      // Crear objeto con los datos del espacio incluyendo la URL de la imagen
      const spaceDataToSave = {
        ...newSpace,
        backgroundImage: imageUrl
      };
      
      if (editingSpaceId) {
        // Actualizar espacio existente
        const response = await spacesAPI.update(editingSpaceId, spaceDataToSave)
        setSpaces(spaces.map(space => 
          space.id === editingSpaceId ? response.data : space
        ))
        alert('Espacio actualizado correctamente')
      } else {
        // Crear nuevo espacio
        const response = await spacesAPI.create(spaceDataToSave)
        setSpaces([...spaces, response.data])
        alert('Espacio creado correctamente')
      }
      
      // Limpiar el estado de la imagen
      setSpaceImageFile(null)
      setSpaceImagePreview('')
      setShowSpaceForm(false)
      setEditingSpaceId(null)
    } catch (error: any) {
      console.error('Error saving space:', error)
      // Mostrar mensaje de error específico si viene del servidor
      let errorMessage = error?.message || 'Error al guardar el espacio';
      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      if (error?.response?.data?.details) {
        errorMessage += `\n\nDetalles: ${error.response.data.details}`;
      }
      if (error?.response?.data?.code) {
        errorMessage += `\n\nCódigo: ${error.response.data.code}`;
      }
      alert(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Funciones para manejar amenidades
  const addNewAmenity = () => {
    if (newAmenity.trim() && !availableAmenities.includes(newAmenity.trim())) {
      setAvailableAmenities([...availableAmenities, newAmenity.trim()])
      setNewAmenity('')
    }
  }

  const removeAmenity = (amenity: string) => {
    setAvailableAmenities(availableAmenities.filter(a => a !== amenity))
    setNewSpace(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity)
    }))
  }

  const toggleAmenity = (amenity: string) => {
    setNewSpace(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  // Funciones para manejar tipos de acomodo
  const addNewSetupType = () => {
    if (newSetupType.trim() && !availableSetupTypes.includes(newSetupType.trim())) {
      setAvailableSetupTypes([...availableSetupTypes, newSetupType.trim()])
      setNewSetupType('')
    }
  }

  const removeSetupType = (setupType: string) => {
    setAvailableSetupTypes(availableSetupTypes.filter(s => s !== setupType))
    setNewSpace(prev => ({
      ...prev,
      setupTypes: prev.setupTypes.filter(s => s !== setupType)
    }))
  }

  const toggleSetupType = (setupType: string) => {
    setNewSpace(prev => ({
      ...prev,
      setupTypes: prev.setupTypes.includes(setupType)
        ? prev.setupTypes.filter(s => s !== setupType)
        : [...prev.setupTypes, setupType]
    }))
  }

  // Funciones para manejar tags
  const toggleTag = (tagId: string) => {
    setNewSpace(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter(t => t !== tagId)
        : [...prev.tags, tagId]
    }))
  }

  const getTagName = (tagId: string) => {
    const tag = tags.find(t => t.id === tagId)
    return tag ? tag.name : 'Tag no encontrado'
  }

  const getTagColor = (tagId: string) => {
    const tag = tags.find(t => t.id === tagId)
    return tag ? tag.color : '#6B7280'
  }

  // Funciones para manejar tags
  const handleCreateTag = () => {
    setEditingTagId(null)
    setNewTag({
      name: '',
      color: '#3CC47C',
      allowedDays: [],
      allowedHours: {
        start: '08:00',
        end: '18:00'
      },
      description: ''
    })
    setShowTagForm(true)
  }

  const handleEditTag = (tag: SpaceTag) => {
    setEditingTagId(tag.id)
    setNewTag(tag)
    setShowTagForm(true)
  }

  const handleDeleteTag = async (tagId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este tag?')) {
      try {
        await spaceTagsAPI.delete(tagId)
        setTags(tags.filter(tag => tag.id !== tagId))
        // También eliminar el tag de todos los espacios que lo tengan
        setSpaces(spaces.map(space => ({
          ...space,
          tags: space.tags.filter(tag => tag !== tagId)
        })))
        alert('Tag eliminado correctamente')
      } catch (error: any) {
        console.error('Error deleting tag:', error)
        let errorMessage = error?.message || 'Error al eliminar el tag';
        if (error?.response?.data?.error) {
          errorMessage = error.response.data.error;
        }
        alert(errorMessage)
      }
    }
  }

  const handleSaveTag = async () => {
    if (!newTag.name.trim()) {
      alert('El nombre del tag es requerido')
      return
    }
    if (newTag.allowedDays.length === 0) {
      alert('Debe seleccionar al menos un día')
      return
    }
    
    setIsLoading(true)
    try {
      if (editingTagId) {
        // Actualizar tag existente
        const response = await spaceTagsAPI.update(editingTagId, newTag)
        setTags(tags.map(tag => 
          tag.id === editingTagId ? response.data : tag
        ))
        alert('Tag actualizado correctamente')
      } else {
        // Crear nuevo tag
        const response = await spaceTagsAPI.create(newTag)
        setTags([...tags, response.data])
        alert('Tag creado correctamente')
      }
      setShowTagForm(false)
      setEditingTagId(null)
    } catch (error: any) {
      console.error('Error saving tag:', error)
      // Mostrar mensaje de error específico si viene del servidor
      let errorMessage = error?.message || 'Error al guardar el tag';
      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      if (error?.response?.data?.details) {
        errorMessage += `\n\nDetalles: ${error.response.data.details}`;
      }
      if (error?.response?.data?.code) {
        errorMessage += `\n\nCódigo: ${error.response.data.code}`;
      }
      alert(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleDay = (day: string) => {
    setNewTag(prev => ({
      ...prev,
      allowedDays: prev.allowedDays.includes(day)
        ? prev.allowedDays.filter(d => d !== day)
        : [...prev.allowedDays, day]
    }))
  }

  // Calcular métricas basadas en datos filtrados
  const calculateDashboardMetrics = () => {
    // Usar las reservas ya filtradas según el rol
    const filteredReservations = getBaseReservations()
    
    // Total de reservas
    const totalReservations = filteredReservations.length
    
    // Espacios activos (todos los espacios para usuarios normales, filtrados para tablets)
    const activeSpaces = user?.rol === 'Tablet' 
      ? spaces.filter(s => s.id === user.assignedSpaceId).length
      : spaces.length
    
    // Reservas de hoy
    const today = new Date().toISOString().split('T')[0]
    const reservationsToday = filteredReservations.filter(r => r.date === today).length
    
    // Calcular ocupación promedio (basado en las reservas de hoy)
    const totalCapacity = spaces.reduce((sum, space) => sum + (space.capacity || 0), 0)
    const occupiedCapacity = filteredReservations
      .filter(r => r.date === today)
      .reduce((sum, r) => sum + (r.numberOfPeople || 0), 0)
    const occupancyRate = totalCapacity > 0 ? Math.round((occupiedCapacity / totalCapacity) * 100) : 0
    
    return {
      totalReservations,
      activeSpaces,
      reservationsToday,
      occupancyRate
    }
  }

  const metrics = calculateDashboardMetrics()

  const renderDashboard = () => (
    <div className="space-y-6">
      <Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {user?.rol === 'Usuario' ? 'Mis Reservas' : 'Total Reservas'}
                </p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalReservations}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Espacios Activos</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.activeSpaces}</p>
              </div>
              <Settings className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {user?.rol === 'Usuario' ? 'Mis Reservas Hoy' : 'Reservas Hoy'}
                </p>
                <p className="text-2xl font-bold text-gray-900">{metrics.reservationsToday}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ocupación</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.occupancyRate}%</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.2}>
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {user?.rol === 'Usuario' ? 'Mis Reservas Recientes' : 'Reservas Recientes'}
          </h3>
          <div className="space-y-3">
            {getBaseReservations().length > 0 ? (
              getBaseReservations().slice(0, 3).map((reservation) => (
              <div key={reservation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                      <p className="font-medium text-gray-900">{reservation.coordinatorName || reservation.title}</p>
                      <p className="text-sm text-gray-600">{reservation.space?.name || 'Sin espacio'}</p>
                  </div>
                </div>
                <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{reservation.startTime} - {reservation.endTime}</p>
                    <span className={cn("inline-flex items-center px-2 py-1 rounded-full text-xs font-medium", getStatusColor(reservation.status || 'pending'))}>
                      {getStatusIcon(reservation.status || 'pending')}
                      <span className="ml-1 capitalize">{reservation.status || 'pending'}</span>
                  </span>
                </div>
              </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p>No hay reservas recientes</p>
              </div>
            )}
          </div>
        </div>
      </Reveal>
    </div>
  )

  const renderReservations = () => {
    // Si es tablet, mostrar vista especial
    if (user?.rol === 'Tablet') {
      return <TabletReservationsView />
    }

    return (
      <div className="space-y-6">
        {/* Indicador de modo de acción */}
        {(editMode || deleteMode || cancelMode) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <span className="text-yellow-800 font-medium">
                {editMode && '✏️ Modo Edición - Selecciona una reserva'}
                {deleteMode && '🗑️ Modo Eliminación - Selecciona una reserva'}
                {cancelMode && '🚫 Modo Cancelación - Selecciona una reserva'}
              </span>
            </div>
          </div>
        )}

        {/* Header Navigation */}
        <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-6 relative z-50">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
            {/* View Mode Selector */}
            {/* Mobile/Tablet (< 950px): Dropdown - Solo Lista y Ver espacios */}
            <div className="lg:hidden w-full">
              <select
                value={(viewMode === 'day' || viewMode === 'month') ? 'list' : viewMode}
                onChange={(e) => setViewMode(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="list">Lista</option>
                <option value="map">Ver espacios</option>
              </select>
            </div>

            {/* Desktop (>= 950px): Buttons - Todas las vistas */}
            <div className="hidden lg:flex space-x-2">
              {[
                { key: 'day', label: 'Día', icon: Calendar },
                { key: 'month', label: 'Mes', icon: Calendar },
                { key: 'list', label: 'Lista', icon: List },
                { key: 'map', label: 'Ver espacios', icon: Map },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setViewMode(key as any)}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap",
                    viewMode === key 
                      ? "bg-blue-600 text-white" 
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          
          {/* Action Buttons - Solo visible en vistas: day, month, list (NO en map) */}
          {viewMode !== 'map' && (
            <>
              {/* Mobile/Tablet (< 1024px / ~950px): Dropdown Menu */}
              <div className="lg:hidden w-full">
                <div className="flex gap-2">
                  <Button 
                    className="flex-1 bg-[#272E4B] hover:bg-[#1e2438] text-white" 
                    leftIcon={<Plus />}
                    onClick={() => handleTimeSlotClick('', '')}
                    size="sm"
                  >
                    Nueva
                  </Button>
                  
                  <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setShowActionsMenu(!showActionsMenu)}
                  size="sm"
                  className="px-3"
                  leftIcon={<MoreVertical className="w-4 h-4" />}
                >
                </Button>
                
                {/* Backdrop */}
                {showActionsMenu && (
                  <div 
                    className="fixed inset-0 z-[1000]"
                    onClick={() => setShowActionsMenu(false)}
                  />
                )}
                
                {showActionsMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-black backdrop-blur-lg rounded-lg shadow-2xl border border-white/20 z-[1001] overflow-hidden">
                    <button
                      onClick={() => {
                        handleEditMode()
                        setShowActionsMenu(false)
                      }}
                      className={cn(
                        "w-full flex items-center space-x-2 px-4 py-3 text-left bg-black hover:bg-gray-800 transition-colors text-white",
                        editMode && "bg-blue-600"
                      )}
                    >
                      <Edit className="w-4 h-4" />
                      <span>Editar</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        handleDeleteMode()
                        setShowActionsMenu(false)
                      }}
                      className={cn(
                        "w-full flex items-center space-x-2 px-4 py-3 text-left bg-black hover:bg-gray-800 transition-colors border-t border-gray-700 text-white",
                        deleteMode && "bg-red-600"
                      )}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Eliminar</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        handleCancelMode()
                        setShowActionsMenu(false)
                      }}
                      className={cn(
                        "w-full flex items-center space-x-2 px-4 py-3 text-left bg-black hover:bg-gray-800 transition-colors border-t border-gray-700 text-white",
                        cancelMode && "bg-orange-600"
                      )}
                    >
                      <Ban className="w-4 h-4" />
                      <span>Cancelar reserva</span>
                    </button>

                    {(editMode || deleteMode || cancelMode) && (
                      <button
                        onClick={() => {
                          exitActionMode()
                          setShowActionsMenu(false)
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-3 text-left bg-black hover:bg-gray-800 transition-colors border-t border-gray-700 text-white"
                      >
                        <X className="w-4 h-4" />
                        <span>Salir del modo</span>
                      </button>
                    )}
                  </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tablet/Desktop (>= 1024px / ~950px): Dropdown Menu con botón "Acciones" */}
            <div className="hidden lg:flex items-center space-x-3">
              <Button 
                className="bg-[#272E4B] hover:bg-[#1e2438] text-white" 
                leftIcon={<Plus />}
                onClick={() => handleTimeSlotClick('', '')}
              >
                Nueva reservación
              </Button>
              
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setShowActionsMenu(!showActionsMenu)}
                  leftIcon={<MoreVertical />}
                >
                  Acciones
                </Button>
                
                {/* Backdrop */}
                {showActionsMenu && (
                  <div 
                    className="fixed inset-0 z-[1000]"
                    onClick={() => setShowActionsMenu(false)}
                  />
                )}
                
                {showActionsMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-black backdrop-blur-lg rounded-lg shadow-2xl border border-white/20 z-[1001] overflow-hidden">
                    <button
                      onClick={() => {
                        handleEditMode()
                        setShowActionsMenu(false)
                      }}
                      className={cn(
                        "w-full flex items-center space-x-2 px-4 py-3 text-left bg-black hover:bg-gray-800 transition-colors text-white",
                        editMode && "bg-blue-600"
                      )}
                    >
                      <Edit className="w-4 h-4" />
                      <span>Editar</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        handleDeleteMode()
                        setShowActionsMenu(false)
                      }}
                      className={cn(
                        "w-full flex items-center space-x-2 px-4 py-3 text-left bg-black hover:bg-gray-800 transition-colors border-t border-gray-700 text-white",
                        deleteMode && "bg-red-600"
                      )}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Eliminar</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        handleCancelMode()
                        setShowActionsMenu(false)
                      }}
                      className={cn(
                        "w-full flex items-center space-x-2 px-4 py-3 text-left bg-black hover:bg-gray-800 transition-colors border-t border-gray-700 text-white",
                        cancelMode && "bg-orange-600"
                      )}
                    >
                      <Ban className="w-4 h-4" />
                      <span>Cancelar reserva</span>
                    </button>

                    {(editMode || deleteMode || cancelMode) && (
                      <button
                        onClick={() => {
                          exitActionMode()
                          setShowActionsMenu(false)
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-3 text-left bg-black hover:bg-gray-800 transition-colors border-t border-gray-700 text-white"
                      >
                        <X className="w-4 h-4" />
                        <span>Salir del modo</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile: Active Mode Indicator */}
            {(editMode || deleteMode || cancelMode) && (
              <div className="lg:hidden mt-3 p-2 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">
                  {editMode && 'Modo Edición'}
                  {deleteMode && 'Modo Eliminar'}
                  {cancelMode && 'Modo Cancelar'}
                </span>
                <button
                  onClick={exitActionMode}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Salir
                </button>
              </div>
            )}
          </>
        )}
          </div>
        </div>

        {/* Contenido Principal */}
        <div>
          {/* Vista Day - Solo disponible en >= 950px */}
          {viewMode === 'day' && (
            <div className="day-view-container">
              {/* Day View Header with Date Navigation */}
              <div className="day-view-header">
              <button 
                onClick={() => {
                  const newDate = new Date(currentDate)
                  newDate.setDate(currentDate.getDate() - 1)
                  setCurrentDate(newDate)
                }}
                className="date-navigation-button"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>
              
              {/* Date Selector */}
              <div className="date-selector">
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="date-selector-button"
                >
                  <h3 className="date-header">
                    {formatDateHeader(currentDate)}
                  </h3>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {/* Date Picker */}
                {showDatePicker && (
                  <div className="date-picker-dropdown">
                <input
                      type="date"
                      value={currentDate.toISOString().split('T')[0]}
                      onChange={(e) => {
                        const newDate = new Date(e.target.value)
                        setCurrentDate(newDate)
                        setShowDatePicker(false)
                      }}
                      className="date-picker-input"
                      autoFocus
                />
              </div>
                )}
              </div>
              
              <button 
                onClick={() => {
                  const newDate = new Date(currentDate)
                  newDate.setDate(currentDate.getDate() + 1)
                  setCurrentDate(newDate)
                }}
                className="date-navigation-button"
              >
                <span>Siguiente</span>
                <ChevronRight className="w-4 h-4" />
              </button>
          </div>
          
            {/* Grid Header con múltiples espacios */}
            <div className="space-grid" style={{ gridTemplateColumns: `200px repeat(${currentSpaces.length}, 1fr)` }}>
              <div className="space-grid-header">
                <h3 className="space-grid-header-title">Espacios</h3>
                    </div>
              {currentSpaces.map((space) => (
                <div key={space.id} className="space-header-cell">
                  <div className="space-header-content">
                    <h3 className="space-name">{space.name}</h3>
                    <Info className="w-4 h-4 text-gray-500" />
                    </div>
                </div>
              ))}
                  </div>
                  
            {/* Space Navigation Arrows */}
            {totalSpacePages > 1 && (
              <div className="space-navigation">
                <button 
                  onClick={prevSpacePage}
                  disabled={spacePage === 0}
                  className={cn(
                    "space-nav-button",
                    spacePage === 0 
                      ? "space-nav-button--disabled" 
                      : "space-nav-button--enabled"
                  )}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="space-nav-info">
                  Página {spacePage + 1} de {totalSpacePages}
                </span>
                <button 
                  onClick={nextSpacePage}
                  disabled={spacePage === totalSpacePages - 1}
                  className={cn(
                    "space-nav-button",
                    spacePage === totalSpacePages - 1 
                      ? "space-nav-button--disabled" 
                      : "space-nav-button--enabled"
                  )}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                    </div>
            )}

            {/* Leyenda de Colores */}
            <div className="legend" style={{ gridColumn: `1 / span ${currentSpaces.length + 1}` }}>
              <div className="legend-content">
                <div className="legend-item">
                  <div className="legend-color legend-color--complete"></div>
                  <span className="legend-text">Información completa</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color legend-color--incomplete"></div>
                  <span className="legend-text">Información pendiente</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color legend-color--cancelled"></div>
                  <span className="legend-text">Reserva cancelada</span>
                </div>
              </div>
            </div>

            {/* Grid Content - Time Slots */}
            <div className={cn(
              "time-grid",
              (editMode || deleteMode || cancelMode) ? 'selection-mode-active' : ''
            )} style={{ 
              gridTemplateColumns: `200px repeat(${currentSpaces.length}, 1fr)`,
              gridAutoRows: '40px'
            }}>
              {timeSlots.map((timeSlot) => (
                <React.Fragment key={timeSlot}>
                  {/* Time Label - Solo en la primera columna */}
                  <div className="time-label">
                    <span className="time-label-text">
                      {formatTime(timeSlot)}
                    </span>
                  </div>

                  {/* Space Cells */}
                  {currentSpaces.map((space) => {
                    const spaceReservations = getReservationsForDayAndSpace(currentDate, space.id)
                    
                    const reservationAtTime = spaceReservations.find(r => {
                      return r.startTime === timeSlot
                    })

                    const isTimeSlotOccupied = spaceReservations.some(r => {
                      const startTime = r.startTime
                      const endTime = r.endTime
                      return timeSlot >= startTime && timeSlot < endTime
                    })

                    const occupyingReservation = spaceReservations.find(r => {
                      const startTime = r.startTime
                      const endTime = r.endTime
                      return timeSlot >= startTime && timeSlot < endTime
                    })

                    // Determinar la posición de la celda en la reserva
                    const getCellPosition = (reservation: Reservation, currentTime: string) => {
                      if (!reservation) return null
                      
                      const startTime = reservation.startTime
                      const endTime = reservation.endTime
                      
                      if (currentTime === startTime) return 'first'
                      if (currentTime === endTime) return 'last'
                      if (currentTime > startTime && currentTime < endTime) return 'middle'
                      return null
                    }

                    const cellPosition = occupyingReservation ? getCellPosition(occupyingReservation, timeSlot) : null
                    const reservationId = occupyingReservation ? occupyingReservation.id : null

                    return (
                      <div 
                        key={`${space.id}-${timeSlot}`}
                        className={cn(
                          "time-slot",
                          isTimeSlotOccupied 
                            ? `time-slot--occupied ${cellPosition ? `time-slot--${cellPosition}` : ''}` 
                            : '',
                          hoveredReservationId === reservationId ? 'reservation-hover-active' : ''
                        )}
                        data-reservation-id={reservationId}
                        onMouseEnter={() => {
                          if (reservationId) {
                            setHoveredReservationId(reservationId)
                          }
                        }}
                        onMouseLeave={() => {
                          setHoveredReservationId(null)
                        }}
                        onClick={() => {
                          if (reservationAtTime) {
                            handleReservationClick(reservationAtTime)
                          } else if (isTimeSlotOccupied && occupyingReservation) {
                            handleReservationClick(occupyingReservation)
                          } else {
                            handleTimeSlotClick(timeSlot, space.id)
                          }
                        }}
                        title={reservationAtTime ? 
                          `${reservationAtTime.title} - ${isReservationComplete(reservationAtTime) ? 'Información completa' : 'Información pendiente'}` : 
                          isTimeSlotOccupied && occupyingReservation ? 
                            `${occupyingReservation.title} - ${isReservationComplete(occupyingReservation) ? 'Información completa' : 'Información pendiente'} (Hacer clic para ver detalles)` :
                            `Hacer clic para reservar ${space.name} a las ${formatTime(timeSlot)}`
                        }
                      >
                        {reservationAtTime ? (
                          <div className={cn(
                            "reservation-cell",
                            isReservationCancelled(reservationAtTime)
                              ? 'reservation-cell--cancelled'
                              : isReservationComplete(reservationAtTime)
                                ? 'reservation-cell--complete'
                                : 'reservation-cell--incomplete',
                            'reservation-cell--first'
                          )}
                          data-reservation-id={reservationAtTime.id}>
                            <div className="reservation-cell-content">
                              <div className={cn(
                                "reservation-cell-title",
                                isReservationCancelled(reservationAtTime)
                                  ? 'reservation-cell-title--cancelled'
                                  : isReservationComplete(reservationAtTime)
                                    ? 'reservation-cell-title--complete'
                                    : 'reservation-cell-title--incomplete'
                              )} title={reservationAtTime.title}>
                                {isReservationCancelled(reservationAtTime) && '❌ '}
                                {reservationAtTime.title}
                              </div>
                              <div className={cn(
                                "reservation-cell-time",
                                isReservationCancelled(reservationAtTime)
                                  ? 'reservation-cell-time--cancelled'
                                  : isReservationComplete(reservationAtTime)
                                    ? 'reservation-cell-time--complete'
                                    : 'reservation-cell-time--incomplete'
                              )}>
                                {reservationAtTime.startTime} - {reservationAtTime.endTime}
                              </div>
                            </div>
                          </div>
                        ) : isTimeSlotOccupied ? (
                          <div className={cn(
                            "reservation-cell",
                            isReservationCancelled(occupyingReservation!)
                              ? 'reservation-cell--cancelled'
                              : isReservationComplete(occupyingReservation!)
                                ? 'reservation-cell--complete'
                                : 'reservation-cell--incomplete',
                            cellPosition ? `reservation-cell--${cellPosition}` : ''
                          )}
                          data-reservation-id={occupyingReservation!.id}>
                          </div>
                        ) : (
                          <div className="time-slot--available">
                          </div>
                        )}
                      </div>
                    )
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Vista Month */}
        {viewMode === 'month' && (
          <div className="month-view-container">
            {/* Month Calendar Header */}
            <div className="month-header">
              <button 
                onClick={() => {
                  const newDate = new Date(currentDate)
                  newDate.setMonth(currentDate.getMonth() - 1)
                  setCurrentDate(newDate)
                }}
                className="month-navigation-button"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="month-title">
                {currentDate.toLocaleString('es-MX', { month: 'long', year: 'numeric' })}
              </h3>
              <button 
                onClick={() => {
                  const newDate = new Date(currentDate)
                  newDate.setMonth(currentDate.getMonth() + 1)
                  setCurrentDate(newDate)
                }}
                className="month-navigation-button"
              >
                <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

            {/* Days of Week Header */}
            <div className="month-grid">
              {['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'].map((day) => (
                <div key={day} className="day-header">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="calendar-grid">
              {generateCalendarDays(currentDate).map((day, index) => {
                const dayReservations = getReservationsForDay(day.date)
                const isToday = isSameDay(day.date, new Date())
                const isCurrentMonth = day.isCurrentMonth
                
                return (
                  <div 
                    key={index}
                    className={cn(
                      "calendar-day",
                      isToday && "calendar-day--today",
                      !isCurrentMonth && "calendar-day--other-month"
                    )}
                    onClick={() => {
                      if (isCurrentMonth) {
                        setCurrentDate(day.date)
                        setViewMode('day')
                      }
                    }}
                  >
                    <div className="calendar-day-number">
                      {day.date.getDate()}
                    </div>
                    {dayReservations.length > 0 && (
                      <div className="calendar-day-reservations">
                        {dayReservations.slice(0, 3).map((reservation, idx) => (
                          <div 
                            key={idx}
                            className={cn(
                              "calendar-reservation-item",
                              isReservationCancelled(reservation)
                                ? "calendar-reservation-item--cancelled"
                                : isReservationComplete(reservation)
                                  ? "calendar-reservation-item--complete"
                                  : "calendar-reservation-item--incomplete"
                            )}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleReservationClick(reservation)
                            }}
                            title={`${reservation.title} - ${reservation.startTime} a ${reservation.endTime}`}
                          >
                            <div className="calendar-reservation-time">
                              {reservation.startTime}
                            </div>
                            <div className="calendar-reservation-title">
                              {reservation.title}
                </div>
              </div>
            ))}
                        {dayReservations.length > 3 && (
                          <div className="calendar-more-reservations">
                            +{dayReservations.length - 3} más
          </div>
                        )}
        </div>
                    )}
    </div>
  )
              })}
            </div>
          </div>
        )}

        {/* Vista List */}
        {viewMode === 'list' && (
          <div className="list-view-container">
            <div className="list-header">
              <h3 className="list-title">Lista de Reservaciones</h3>
              <div className="list-controls">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-64 pl-9 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <Button 
                  variant="outline" 
                  leftIcon={<Filter />}
                  onClick={() => setShowFilters(!showFilters)}
                  size="sm"
                  className="flex-shrink-0"
                >
                  <span className="hidden sm:inline">Filtros</span>
                  <span className="sm:hidden">
                    <Filter className="w-4 h-4" />
                  </span>
                </Button>
              </div>
            </div>

              {/* Panel de Filtros */}
              {showFilters && (
                <div className="filters-panel">
                  <div className="filters-header">
                    <h4 className="filters-title">Filtros</h4>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-xs"
                    >
                      Limpiar filtros
                    </Button>
                  </div>
                  
                  <div className="filters-grid">
                    {/* Filtro por espacio */}
                    <div className="filter-group">
                      <label className="filter-label">
                        Espacio
                      </label>
                      <select 
                        value={filterSpace}
                        onChange={(e) => setFilterSpace(e.target.value)}
                        className="filter-select"
                      >
                        <option value="">Todos los espacios</option>
                        {spaces.map((space) => (
                          <option key={space.id} value={space.name}>
                            {space.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Filtro por fecha */}
                    <div className="filter-group">
                      <label className="filter-label">
                        Fecha
                      </label>
                      <input 
                        type="date" 
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="filter-select"
                      />
                    </div>

                    {/* Filtro por tipo de reunión */}
                    <div className="filter-group">
                      <label className="filter-label">
                        Tipo de Reunión
                      </label>
                      <select 
                        value={filterMeetingType}
                        onChange={(e) => setFilterMeetingType(e.target.value)}
                        className="filter-select"
                      >
                        <option value="">Todos los tipos</option>
                        <option value="presencial">Presencial</option>
                        <option value="hibrido">Híbrida</option>
                      </select>
                    </div>

                    {/* Filtro por estado */}
                    <div className="filter-group">
                      <label className="filter-label">
                        Estado
                      </label>
                      <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="filter-select"
                      >
                        <option value="">Todos los estados</option>
                        <option value="complete">Información completa</option>
                        <option value="incomplete">Información pendiente</option>
                      </select>
                    </div>

                    {/* Filtro por organización */}
                    <div className="filter-group">
                      <label className="filter-label">
                        Organización
                      </label>
                      <input 
                        type="text"
                        placeholder="Buscar por organización..."
                        value={filterOrganization}
                        onChange={(e) => setFilterOrganization(e.target.value)}
                        className="filter-select"
                      />
                    </div>

                    {/* Filtro por coordinador */}
                    <div className="filter-group">
                      <label className="filter-label">
                        Coordinador
                      </label>
                      <input 
                        type="text"
                        placeholder="Buscar por coordinador..."
                        value={filterUser}
                        onChange={(e) => setFilterUser(e.target.value)}
                        className="filter-select"
                      />
                    </div>
                  </div>
                </div>
              )}
            
            {/* Lista de Reservaciones */}
            <div className="reservation-list">
              {filteredReservations.length > 0 ? (
                filteredReservations.map((reservation) => (
                  <div 
                    key={reservation.id} 
                    className="reservation-item"
                    onClick={() => handleReservationClick(reservation)}
                  >
                    <div className="reservation-item-content">
                      <div className="reservation-item-main">
                        <div className="reservation-date-badge">
                          <div className="reservation-date-day">
                            {new Date(reservation.date).getDate()}
                          </div>
                          <div className="reservation-date-month">
                            {new Date(reservation.date).toLocaleDateString('es-MX', { month: 'short' })}
                          </div>
                        </div>
                        <div className="reservation-details">
                          <div className="reservation-item-header">
                            <h3 className="reservation-item-title">{reservation.title}</h3>
                            <span className={cn(
                              "reservation-status-badge",
                              isReservationCancelled(reservation)
                                ? "reservation-status-badge--cancelled"
                                : isReservationComplete(reservation)
                                  ? "reservation-status-badge--complete"
                                  : "reservation-status-badge--incomplete"
                            )}>
                              {isReservationCancelled(reservation) ? 'Cancelada' : 
                               isReservationComplete(reservation) ? 'Completa' : 'Pendiente'}
                            </span>
                          </div>
                          <div className="reservation-meta">
                            <p className="reservation-type">{reservation.space?.name || 'Sin espacio'}</p>
                            <p className="reservation-meta">
                              {reservation.coordinatorName} • {reservation.company}
                            </p>
                            <p className="reservation-meta">
                              {reservation.startTime} - {reservation.endTime} • {reservation.numberOfPeople} personas
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="empty-state-title">No se encontraron reservaciones</h3>
                  <p className="empty-state-description">No se encontraron reservaciones con los filtros aplicados</p>
                  <Button 
                    variant="outline" 
                    onClick={clearAllFilters}
                  >
                    Limpiar filtros
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Vista de Espacios - Solo lectura */}
        {viewMode === 'map' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Espacios Disponibles</h2>
              <p className="text-gray-600 mt-1">
                <Info className="inline w-4 h-4 mr-1" />
                Haz clic en un espacio para ver sus detalles y especificaciones
              </p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando espacios...</p>
                </div>
              </div>
            ) : spaces.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay espacios disponibles</h3>
                <p className="text-gray-500">Aún no se han creado espacios para reservar</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {spaces
                  .filter(space => space.isActive)
                  .map((space) => (
                    <div
                      key={space.id}
                      className="group bg-white rounded-lg shadow-md border-2 border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer relative"
                      onClick={() => handleViewSpaceDetails(space, true)}
                    >
                      {/* Imagen del espacio */}
                      <div className="relative h-64 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
                        {space.backgroundImage ? (
                          <img
                            src={space.backgroundImage}
                            alt={space.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building className="w-20 h-20 text-white/80" />
                          </div>
                        )}
                        
                        {/* Overlay oscuro */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        
                        {/* Nombre del espacio */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="text-xl font-bold text-white drop-shadow-lg mb-1">
                            {space.name}
                          </h3>
                          <div className="flex items-center space-x-2 text-white/90 text-sm">
                            <Users className="w-4 h-4" />
                            <span>{space.capacity} personas</span>
                            {space.location && (
                              <>
                                <span>•</span>
                                <MapPin className="w-4 h-4" />
                                <span>{space.location}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Indicador de click */}
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 group-hover:bg-blue-500 group-hover:scale-110 transition-all duration-300">
                          <Info className="w-5 h-5 text-blue-600 group-hover:text-white" />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    )
  }

  const renderSpaces = () => (
    <div className="space-y-6">
      {spacesTab === "espacios" && (
          <div className="space-y-6">
            {/* Botones de acción para espacios */}
            <div className="flex justify-end space-x-3">
              <Button 
                onClick={handleCreateSpace} 
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Nuevo Espacio
              </Button>
            </div>

            {/* Lista de Espacios */}
            <Reveal delay={0.1}>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando espacios...</p>
                  </div>
                </div>
              ) : spaces.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-gray-500 mb-4">No hay espacios disponibles</p>
                  <Button onClick={handleCreateSpace} leftIcon={<Plus className="w-4 h-4" />}>
                    Crear Primer Espacio
                  </Button>
                </div>
              ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {spaces.map((space) => (
                  <div 
                    key={space.id} 
                    className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow overflow-hidden cursor-pointer"
                    onClick={() => handleViewSpaceDetails(space)}
                  >
                    {/* Imagen de fondo si existe */}
                    {space.backgroundImage && (
                      <div className="h-32 bg-cover bg-center relative" style={{ backgroundImage: `url(${space.backgroundImage})` }}>
                        <div className="absolute inset-0 bg-black/20" />
                      </div>
                    )}
                    
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Building className="w-4 h-4 text-gray-500" />
                            <h3 className="font-semibold text-gray-900 text-sm">{space.name}</h3>
                          </div>
                          <p className="text-xs text-gray-600">
                            {spaceTypes.find(t => t.value === space.type)?.label}
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditSpace(space)
                            }} 
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title="Editar espacio"
                          >
                            <Edit className="w-3 h-3 text-gray-500" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteSpace(space.id)
                            }} 
                            className="p-1 hover:bg-red-100 rounded transition-colors"
                            title="Eliminar espacio"
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                          <Users className="w-3 h-3" />
                          <span>{space.capacity} personas</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                          <MapPin className="w-3 h-3" />
                          <span>{space.location}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                          {space.isActive ? (
                            <CheckCircle className="w-3 h-3 text-green-600" />
                          ) : (
                            <X className="w-3 h-3 text-red-600" />
                          )}
                          <span>{space.isActive ? 'Activo' : 'Inactivo'}</span>
                        </div>
                      </div>
                      
                      {/* Tags asignados - solo mostrar algunos */}
                      {space.tags.length > 0 && (
                        <div className="mt-3">
                          <div className="flex flex-wrap gap-1">
                            {space.tags.slice(0, 2).map((tagId) => (
                              <span
                                key={tagId}
                                className="px-2 py-1 text-xs rounded"
                                style={{ 
                                  backgroundColor: getTagColor(tagId) + '20',
                                  color: getTagColor(tagId)
                                }}
                              >
                                {getTagName(tagId)}
                              </span>
                            ))}
                            {space.tags.length > 2 && (
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                +{space.tags.length - 2}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                  </div>
                )}
            </Reveal>
          </div>
        )}

      {spacesTab === "tags" && (
        <div className="space-y-6">
          {/* Botones de acción para tags */}
          <div className="flex justify-end space-x-3">
            <Button 
              onClick={handleCreateTag} 
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Nuevo Tag
            </Button>
          </div>

          {/* Lista de Tags */}
          <Reveal delay={0.1}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tags.map((tag) => (
                <div key={tag.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <div 
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: tag.color }}
                          />
                          <h3 className="font-semibold text-gray-900">{tag.name}</h3>
                        </div>
                        {tag.description && (
                          <p className="text-sm text-gray-600">{tag.description}</p>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <button 
                          onClick={() => handleEditTag(tag)} 
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Editar tag"
                        >
                          <Edit className="w-4 h-4 text-gray-500" />
                        </button>
                        <button 
                          onClick={() => handleDeleteTag(tag.id)} 
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                          title="Eliminar tag"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{tag.allowedHours.start} - {tag.allowedHours.end}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {dayOptions.filter(day => (tag.allowedDays || []).includes(day.value)).map(day => day.label).join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {tags.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay tags creados</h3>
                  <p className="text-gray-600 mb-4">
                    Crea tu primer tag para establecer restricciones horarias en los espacios.
                  </p>
                  <Button 
                    onClick={handleCreateTag} 
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Crear primer tag
                  </Button>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      )}
    </div>
  )

  const renderUsers = () => {
    if (usersTab === "usuarios") {
      return <UsuariosContent key={`usuarios-${activeTab}`} />
    }
    if (usersTab === "organizaciones") {
      return <OrganizacionesContent key={`organizaciones-${activeTab}`} />
    }
    return null
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard()
      case "reservations":
        return renderReservations()
      case "spaces":
        return renderSpaces()
      case "users":
        return renderUsers()
      default:
        return renderDashboard()
    }
  }

  return (
    <section className="relative min-h-screen overflow-hidden" id="dashboard">
      {/* Imagen de fondo con efecto blur */}
      <div className="fixed inset-0 -z-10">
        {/* Imagen para escritorio/iPad - visible en pantallas md y superiores */}
        <img
          src="/fondo_escritorio.png"
          alt="Fondo dashboard escritorio"
          className="hidden md:block w-full h-full object-cover blur-sm"
        />
        
        {/* Imagen para móvil - visible en pantallas menores a md */}
        <img
          src="/fondo_movil.png"
          alt="Fondo dashboard móvil"
          className="block md:hidden w-full h-full object-cover blur-sm"
        />
        
        {/* Overlay para mejor contraste - más oscuro que el hero */}
        <div className="absolute inset-0 bg-black/75 backdrop-blur-md" />
      </div>
      
      <div className="flex flex-col xl:flex-row h-screen relative z-10">
        {/* Desktop Sidebar (>= 1280px) */}
        <motion.div
          className={cn(
            "hidden xl:block bg-white/10 backdrop-blur-2xl border-r border-white/30 shadow-2xl transition-all duration-300",
            sidebarOpen ? "w-64" : "w-16"
          )}
          initial={{ x: -100 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          <div className={cn("p-6", !sidebarOpen && "px-2")}>
            {/* Botón para abrir/cerrar siempre visible */}
            <div className={cn(
              "flex items-center mb-8",
              sidebarOpen ? "justify-between" : "justify-center"
            )}>
                {sidebarOpen && (
                <Reveal>
                  <h1 className="text-xl font-bold text-white drop-shadow-lg">Dashboard</h1>
                </Reveal>
              )}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2.5 hover:bg-white/20 rounded-lg transition-all duration-200 hover:shadow-md border border-white/30 hover:border-white/50 bg-white/10"
                title={sidebarOpen ? "Cerrar menú" : "Abrir menú"}
              >
                {sidebarOpen ? (
                  <PanelLeftClose className="w-5 h-5 text-white" />
                ) : (
                  <PanelLeftOpen className="w-5 h-5 text-white" />
                )}
              </button>
              </div>

            <nav className="space-y-2">
              {sidebarItems.map((item, index) => {
                const Icon = item.icon
                return (
                  <Reveal key={item.id} delay={0.1 * index}>
                    <button
                      onClick={() => setActiveTab(item.id)}
                      className={cn(
                        "w-full flex items-center justify-center rounded-lg transition-all duration-200 border",
                        sidebarOpen ? "space-x-3 px-3 py-2" : "p-2.5",
                        activeTab === item.id
                          ? "bg-white/30 text-white border-white/60 shadow-lg shadow-white/20"
                          : "text-white/80 border-white/20 hover:bg-white/20 hover:text-white hover:border-white/40 hover:shadow-md"
                      )}
                    >
                      {sidebarOpen ? (
                        <span className="font-medium">{item.label}</span>
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </button>
                  </Reveal>
                )
              })}
            </nav>
          </div>
        </motion.div>

        {/* Bottom Navigation (< 1280px) */}
        <motion.nav
          className="xl:hidden fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-2xl border-t border-white/30 shadow-2xl z-50 safe-area-bottom"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          <div className="flex items-center justify-around px-2 py-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 min-w-[70px] touch-manipulation",
                    activeTab === item.id
                      ? "bg-white/30 text-white"
                      : "text-white/70 active:bg-white/20"
                  )}
                >
                  <Icon className={cn(
                    "mb-1 transition-all",
                    activeTab === item.id ? "w-6 h-6" : "w-5 h-5"
                  )} />
                  <span className={cn(
                    "text-[10px] font-medium leading-tight text-center",
                    activeTab === item.id ? "text-white" : "text-white/70"
                  )}>
                    {item.label}
                  </span>
                </button>
              )
            })}
          </div>
        </motion.nav>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden pb-16 xl:pb-0">
          {/* Header */}
          <motion.header
            className="bg-white/10 backdrop-blur-2xl border-b border-white/30 px-6 py-4 shadow-lg"
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {activeTab === "spaces" ? (
                  <div className="flex space-x-8">
                    <button
                      onClick={() => setSpacesTab("espacios")}
                      className={cn(
                        "pb-2 px-1 text-sm font-medium border-b-2 transition-colors",
                        spacesTab === "espacios"
                          ? "border-white text-white drop-shadow-lg"
                          : "border-transparent text-white/70 hover:text-white hover:border-white/50"
                      )}
                    >
                      Espacios
                    </button>
                    <button
                      onClick={() => setSpacesTab("tags")}
                      className={cn(
                        "pb-2 px-1 text-sm font-medium border-b-2 transition-colors",
                        spacesTab === "tags"
                          ? "border-white text-white drop-shadow-lg"
                          : "border-transparent text-white/70 hover:text-white hover:border-white/50"
                      )}
                    >
                      Tags
                    </button>
                  </div>
                ) : activeTab === "users" ? (
                  <div className="flex space-x-8">
                    <button
                      onClick={() => setUsersTab("usuarios")}
                      className={cn(
                        "pb-2 px-1 text-sm font-medium border-b-2 transition-colors",
                        usersTab === "usuarios"
                          ? "border-white text-white drop-shadow-lg"
                          : "border-transparent text-white/70 hover:text-white hover:border-white/50"
                      )}
                    >
                      Usuarios
                    </button>
                    <button
                      onClick={() => setUsersTab("organizaciones")}
                      className={cn(
                        "pb-2 px-1 text-sm font-medium border-b-2 transition-colors",
                        usersTab === "organizaciones"
                          ? "border-white text-white drop-shadow-lg"
                          : "border-transparent text-white/70 hover:text-white hover:border-white/50"
                      )}
                    >
                      Organizaciones
                    </button>
                  </div>
                ) : (
                  <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                    {sidebarItems.find(item => item.id === activeTab)?.label}
                  </h2>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-white drop-shadow-md">{user?.nombre}</p>
                  <p className="text-xs text-white/80 capitalize">{user?.rol}</p>
                </div>
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm border-2 border-white/50 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-semibold drop-shadow-md">
                    {user?.nombre?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                      logout()
                      router.push('/login')
                    }
                  }}
                  className="p-2 hover:bg-red-500/30 rounded-lg transition-all duration-200 hover:shadow-md border border-white/30 hover:border-red-400/60 group"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-5 h-5 text-white group-hover:text-red-300" />
                </button>
              </div>
            </div>
          </motion.header>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-transparent to-black/10 dashboard-content-glass">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Modal de Formulario de Espacio */}
      {showSpaceForm && (
        <Modal
          isOpen={showSpaceForm}
          onClose={() => setShowSpaceForm(false)}
          title={editingSpaceId ? 'Editar Espacio' : 'Nuevo Espacio'}
          size="lg"
        >
          <div className="p-6 space-y-6">
            {/* Información Básica */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Información Básica</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Nombre del espacio</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/60 text-white placeholder-white/60"
                    value={newSpace.name}
                    onChange={(e) => setNewSpace(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej. Meeting Room 1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Tipo de espacio</label>
                  <select
                    className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/60 text-white"
                    value={newSpace.type}
                    onChange={(e) => setNewSpace(prev => ({ ...prev, type: e.target.value }))}
                  >
                    {spaceTypes.map((type) => (
                      <option key={type.value} value={type.value} className="bg-gray-900">
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Capacidad y Ubicación */}
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Capacidad</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/60 text-white placeholder-white/60"
                    value={newSpace.capacity}
                    onChange={(e) => setNewSpace(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Ubicación</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/60 text-white placeholder-white/60"
                    value={newSpace.location}
                    onChange={(e) => setNewSpace(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Ej. Piso 1"
                  />
                </div>
              </div>
            </div>

            {/* Imagen de fondo */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Imagen de fondo</label>
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  className="block w-full text-sm text-white
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-white/20 file:text-white
                    hover:file:bg-white/30
                    file:cursor-pointer cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSpaceImageFile(file);
                      // Crear preview de la imagen
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setSpaceImagePreview(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                {(spaceImagePreview || newSpace.backgroundImage) && (
                  <div className="relative w-full h-32 bg-cover bg-center rounded-lg border border-white/30" 
                       style={{ backgroundImage: `url(${spaceImagePreview || newSpace.backgroundImage})` }}>
                    <button
                      type="button"
                      onClick={() => {
                        setSpaceImageFile(null);
                        setSpaceImagePreview('');
                        setNewSpace(prev => ({ ...prev, backgroundImage: '' }));
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 rounded-full"
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>
                )}
                <p className="text-xs text-white/60">
                  Formatos aceptados: JPG, PNG, GIF. Tamaño máximo: 5MB
                </p>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Descripción</label>
              <textarea
                className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/60 text-white placeholder-white/60"
                value={newSpace.description}
                onChange={(e) => setNewSpace(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción del espacio..."
                rows={3}
              />
            </div>

            {/* Gestión de Amenidades */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Amenidades disponibles</h3>
              
              {/* Agregar nueva amenidad */}
              <div className="flex space-x-3 mb-4">
                <input
                  type="text"
                  placeholder="Nueva amenidad..."
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/60 text-white placeholder-white/60"
                  onKeyPress={(e) => e.key === 'Enter' && addNewAmenity()}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={addNewAmenity}
                  disabled={!newAmenity.trim()}
                  leftIcon={<Plus className="w-4 h-4" />}
                  className="bg-blue-500/30 hover:bg-blue-500/50 text-white border border-white/30"
                >
                  Agregar
                </Button>
              </div>

              {/* Lista de amenidades */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableAmenities.map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newSpace.amenities.includes(amenity)}
                        onChange={() => toggleAmenity(amenity)}
                        className="rounded border-white/30 text-blue-500 focus:ring-white/50 bg-white/10"
                      />
                      <span className="text-sm text-white">{amenity}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => removeAmenity(amenity)}
                      className="p-1 hover:bg-red-500/20 rounded"
                      title="Eliminar amenidad"
                    >
                      <X className="w-3 h-3 text-red-300" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Gestión de Tipos de Acomodo */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Tipos de acomodo disponibles</h3>
              
              {/* Agregar nuevo tipo de acomodo */}
              <div className="flex space-x-3 mb-4">
                <input
                  type="text"
                  placeholder="Nuevo tipo de acomodo..."
                  value={newSetupType}
                  onChange={(e) => setNewSetupType(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/60 text-white placeholder-white/60"
                  onKeyPress={(e) => e.key === 'Enter' && addNewSetupType()}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={addNewSetupType}
                  disabled={!newSetupType.trim()}
                  leftIcon={<Plus className="w-4 h-4" />}
                  className="bg-blue-500/30 hover:bg-blue-500/50 text-white border border-white/30"
                >
                  Agregar
                </Button>
              </div>

              {/* Lista de tipos de acomodo */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableSetupTypes.map((setupType) => (
                  <div key={setupType} className="flex items-center space-x-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newSpace.setupTypes.includes(setupType)}
                        onChange={() => toggleSetupType(setupType)}
                        className="rounded border-white/30 text-blue-500 focus:ring-white/50 bg-white/10"
                      />
                      <span className="text-sm text-white">{setupType}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => removeSetupType(setupType)}
                      className="p-1 hover:bg-red-500/20 rounded"
                      title="Eliminar tipo de acomodo"
                    >
                      <X className="w-3 h-3 text-red-300" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Configuraciones Adicionales */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Configuraciones</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newSpace.isActive}
                    onChange={(e) => setNewSpace(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded border-white/30 text-blue-500 focus:ring-white/50 bg-white/10"
                  />
                  <span className="text-sm text-white">Espacio activo</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newSpace.requiresCatering}
                    onChange={(e) => setNewSpace(prev => ({ ...prev, requiresCatering: e.target.checked }))}
                    className="rounded border-white/30 text-blue-500 focus:ring-white/50 bg-white/10"
                  />
                  <span className="text-sm text-white">Permite coffee break</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newSpace.requiresGuestList}
                    onChange={(e) => setNewSpace(prev => ({ ...prev, requiresGuestList: e.target.checked }))}
                    className="rounded border-white/30 text-blue-500 focus:ring-white/50 bg-white/10"
                  />
                  <span className="text-sm text-white">Requiere lista de invitados</span>
                </label>
              </div>
            </div>

            {/* Horario Disponible */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Horario Disponible</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Hora de inicio</label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/60 text-white"
                    value={newSpace.availableHours?.start || '08:00'}
                    onChange={(e) => setNewSpace(prev => ({ 
                      ...prev, 
                      availableHours: { 
                        ...prev.availableHours, 
                        start: e.target.value,
                        end: prev.availableHours?.end || '18:00'
                      } 
                    }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Hora de fin</label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/60 text-white"
                    value={newSpace.availableHours?.end || '18:00'}
                    onChange={(e) => setNewSpace(prev => ({ 
                      ...prev, 
                      availableHours: { 
                        start: prev.availableHours?.start || '08:00',
                        ...prev.availableHours,
                        end: e.target.value
                      } 
                    }))}
                  />
                </div>
              </div>
            </div>

            {/* Asignación de Tags */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Tags de restricción horaria</h3>
              <div className="space-y-3">
                {tags.map((tag) => (
                  <div key={tag.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/30 rounded-lg">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newSpace.tags.includes(tag.id)}
                        onChange={() => toggleTag(tag.id)}
                        className="rounded border-white/30 text-blue-500 focus:ring-white/50 bg-white/10"
                      />
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: tag.color }} />
                        <span className="text-sm font-medium text-white">{tag.name}</span>
                      </div>
                    </label>
                    <div className="text-xs text-white/70 text-right">
                      {dayOptions.filter(day => (tag.allowedDays || []).includes(day.value)).map(day => day.label).join(', ')}
                      <br />
                      {tag.allowedHours.start} - {tag.allowedHours.end}
                    </div>
                  </div>
                ))}
              </div>
              {tags.length === 0 && (
                <p className="text-sm text-white/70 text-center py-4">
                  No hay tags disponibles. Crea tags para establecer restricciones horarias.
                </p>
              )}
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-white/30">
              <Button 
                variant="outline" 
                onClick={() => setShowSpaceForm(false)}
                className="text-white hover:bg-white/20 border-white/30"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveSpace} 
                isLoading={isLoading}
                className="bg-blue-500/30 hover:bg-blue-500/50 text-white border border-white/30"
              >
                {editingSpaceId ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de Formulario de Tag */}
      {showTagForm && (
        <Modal
          isOpen={showTagForm}
          onClose={() => setShowTagForm(false)}
          title={editingTagId ? 'Editar Tag' : 'Nuevo Tag'}
          size="md"
        >
          <div className="p-6 space-y-6">
            {/* Información Básica */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Información Básica</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Nombre del tag</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/60 text-white placeholder-white/60"
                    value={newTag.name}
                    onChange={(e) => setNewTag(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej. Horario Matutino"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Color del tag</label>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 ${
                          newTag.color === color ? 'border-white' : 'border-white/30'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewTag(prev => ({ ...prev, color }))}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Descripción (opcional)</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/60 text-white placeholder-white/60"
                value={newTag.description}
                onChange={(e) => setNewTag(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción del tag..."
              />
            </div>

            {/* Horarios Permitidos */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Horarios Permitidos</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Hora de inicio</label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/60 text-white"
                    value={newTag.allowedHours.start}
                    onChange={(e) => setNewTag(prev => ({
                      ...prev,
                      allowedHours: { ...prev.allowedHours, start: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Hora de fin</label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/60 text-white"
                    value={newTag.allowedHours.end}
                    onChange={(e) => setNewTag(prev => ({
                      ...prev,
                      allowedHours: { ...prev.allowedHours, end: e.target.value }
                    }))}
                  />
                </div>
              </div>
            </div>

            {/* Días Permitidos */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Días Permitidos</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {dayOptions.map((day) => (
                  <label key={day.value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newTag.allowedDays.includes(day.value)}
                      onChange={() => toggleDay(day.value)}
                      className="rounded border-white/30 text-blue-500 focus:ring-white/50 bg-white/10"
                    />
                    <span className="text-sm text-white">{day.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-white/30">
              <Button 
                variant="outline" 
                onClick={() => setShowTagForm(false)}
                className="text-white hover:bg-white/20 border-white/30"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveTag} 
                isLoading={isLoading}
                className="bg-blue-500/30 hover:bg-blue-500/50 text-white border border-white/30"
              >
                {editingTagId ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de Detalles del Espacio */}
      {showSpaceDetails && selectedSpace && (
        <Modal
          isOpen={showSpaceDetails}
          onClose={() => setShowSpaceDetails(false)}
          title={selectedSpace.name}
          size="lg"
        >
          <div className="p-3 sm:p-6 space-y-3 sm:space-y-6">
            {/* Imagen de fondo si existe */}
            {selectedSpace.backgroundImage && (
              <div className="h-24 sm:h-40 md:h-48 bg-cover bg-center rounded-lg relative" style={{ backgroundImage: `url(${selectedSpace.backgroundImage})` }}>
                <div className="absolute inset-0 bg-black/20 rounded-lg" />
              </div>
            )}

            {/* Información básica */}
            <div>
              <h3 className="text-sm sm:text-lg font-semibold text-white mb-2 sm:mb-4">Información Básica</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-white/70 mb-1">Tipo de espacio</label>
                  <p className="text-xs sm:text-sm text-white">
                    {spaceTypes.find(t => t.value === selectedSpace.type)?.label}
                  </p>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-white/70 mb-1">Capacidad</label>
                  <p className="text-xs sm:text-sm text-white">{selectedSpace.capacity} personas</p>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-white/70 mb-1">Ubicación</label>
                  <p className="text-xs sm:text-sm text-white">{selectedSpace.location}</p>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-white/70 mb-1">Estado</label>
                  <div className="flex items-center space-x-2">
                    {selectedSpace.isActive ? (
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-300 flex-shrink-0" />
                    ) : (
                      <X className="w-3 h-3 sm:w-4 sm:h-4 text-red-300 flex-shrink-0" />
                    )}
                    <span className="text-xs sm:text-sm text-white">{selectedSpace.isActive ? 'Activo' : 'Inactivo'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Descripción */}
            {selectedSpace.description && (
              <div>
                <h3 className="text-sm sm:text-lg font-semibold text-white mb-2 sm:mb-4">Descripción</h3>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed">{selectedSpace.description}</p>
              </div>
            )}

            {/* Amenidades */}
            {selectedSpace.amenities.length > 0 && (
              <div>
                <h3 className="text-sm sm:text-lg font-semibold text-white mb-2 sm:mb-4">Amenidades</h3>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {selectedSpace.amenities.map((amenity, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-200 text-xs rounded-full border border-blue-400/30">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tipos de acomodo */}
            {selectedSpace.setupTypes.length > 0 && (
              <div>
                <h3 className="text-sm sm:text-lg font-semibold text-white mb-2 sm:mb-4">Tipos de Acomodo</h3>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {selectedSpace.setupTypes.map((setupType, index) => (
                    <span key={index} className="px-2 py-1 bg-green-500/20 text-green-200 text-xs rounded-full border border-green-400/30">
                      {setupType}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags asignados */}
            {selectedSpace.tags.length > 0 && (
              <div>
                <h3 className="text-sm sm:text-lg font-semibold text-white mb-2 sm:mb-4">Tags de Restricción Horaria</h3>
                <div className="space-y-2">
                  {selectedSpace.tags.map((tagId) => {
                    const tag = tags.find(t => t.id === tagId)
                    if (!tag) return null
                    
                    return (
                      <div key={tagId} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 bg-white/5 border border-white/30 rounded-lg gap-2">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div 
                            className="w-3 h-3 sm:w-4 sm:h-4 rounded flex-shrink-0"
                            style={{ backgroundColor: tag.color }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-white text-xs sm:text-base truncate">{tag.name}</p>
                            {tag.description && (
                              <p className="text-xs text-white/70 truncate">{tag.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-left sm:text-right text-xs text-white/70">
                          <p className="truncate">{dayOptions.filter(day => (tag.allowedDays || []).includes(day.value)).map(day => day.label).join(', ')}</p>
                          <p className="font-medium">{tag.allowedHours.start} - {tag.allowedHours.end}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Configuraciones */}
            <div>
              <h3 className="text-sm sm:text-lg font-semibold text-white mb-2 sm:mb-4">Configuraciones</h3>
              <div className="space-y-1 sm:space-y-2">
                <div className="flex items-center space-x-2">
                  {selectedSpace.requiresCatering ? (
                    <Coffee className="w-3 h-3 sm:w-4 sm:h-4 text-green-300 flex-shrink-0" />
                  ) : (
                    <X className="w-3 h-3 sm:w-4 sm:h-4 text-white/40 flex-shrink-0" />
                  )}
                  <span className="text-xs sm:text-sm text-white">
                    Coffee Break: {selectedSpace.requiresCatering ? 'Permitido' : 'No permitido'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {selectedSpace.requiresGuestList ? (
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-300 flex-shrink-0" />
                  ) : (
                    <X className="w-3 h-3 sm:w-4 sm:h-4 text-white/40 flex-shrink-0" />
                  )}
                  <span className="text-xs sm:text-sm text-white">
                    Lista de Invitados: {selectedSpace.requiresGuestList ? 'Requerida' : 'No requerida'}
                  </span>
                </div>
              </div>
            </div>

            {/* Horario Disponible */}
            {selectedSpace.availableHours && (
              <div>
                <h3 className="text-sm sm:text-lg font-semibold text-white mb-2 sm:mb-4">Horario Disponible</h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 bg-white/5 border border-white/30 rounded-lg p-2 sm:p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3 h-3 sm:w-5 h-5 text-blue-300 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-white/70">Hora de inicio</p>
                      <p className="text-sm sm:text-lg font-semibold text-white">{selectedSpace.availableHours.start}</p>
                    </div>
                  </div>
                  <div className="text-white/40 text-center sm:hidden">—</div>
                  <div className="hidden sm:block text-white/40">—</div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3 h-3 sm:w-5 h-5 text-blue-300 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-white/70">Hora de fin</p>
                      <p className="text-sm sm:text-lg font-semibold text-white">{selectedSpace.availableHours.end}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-6 border-t border-white/30">
              <Button 
                onClick={() => setShowSpaceDetails(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white border-0 shadow-lg w-full sm:w-auto"
                size="sm"
              >
                Cerrar
              </Button>
              {!spaceDetailsReadOnly && (
                <Button 
                  onClick={() => {
                    setShowSpaceDetails(false)
                    handleEditSpace(selectedSpace)
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-lg w-full sm:w-auto"
                  size="sm"
                >
                  Editar Espacio
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de Detalles de Reservación */}
      {showReservationModal && selectedReservation && (
        <div 
          className="reservation-details-modal"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowReservationModal(false)
            }
          }}
        >
          <div className="reservation-details-content">
            {/* Header Section con Fecha y Estado */}
            <div className="reservation-modal-hero">
              <button
                className="reservation-modal-close"
                onClick={() => setShowReservationModal(false)}
                aria-label="Cerrar modal"
              >
                ×
              </button>
              <h3 className="reservation-modal-date">
                {new Date(selectedReservation.date).getDate()}
              </h3>
              <p className="reservation-modal-time">
                {formatDateHeader(new Date(selectedReservation.date))}
              </p>
              <p className="reservation-modal-time">
                {selectedReservation.startTime} - {selectedReservation.endTime}
              </p>
              
              {/* Badge de Estado */}
              <div className="reservation-modal-status">
                {isReservationComplete(selectedReservation) ? 'COMPLETA' : 'PENDIENTE'}
              </div>
            </div>

            {/* Grid de Información */}
            <div className="reservation-modal-body">
              {/* Espacio */}
              <div className="reservation-info-card">
                <h4>Espacio</h4>
                <p>{selectedReservation.space?.name || 'No especificado'}</p>
            </div>
            
              {/* Coordinador */}
              <div className="reservation-info-card">
                <h4>Coordinador</h4>
                <p>{selectedReservation.coordinatorName || 'No especificado'}</p>
              </div>

              {/* Correo del Coordinador */}
              {selectedReservation.coordinatorEmail && (
                <div className="reservation-info-card">
                  <h4>Correo Electrónico</h4>
                  <p>{selectedReservation.coordinatorEmail}</p>
                </div>
              )}

              {/* Teléfono del Coordinador */}
              {selectedReservation.coordinatorPhone && (
                <div className="reservation-info-card">
                  <h4>Teléfono</h4>
                  <p>{selectedReservation.coordinatorPhone}</p>
                </div>
              )}

              {/* Empresa */}
              <div className="reservation-info-card">
                <h4>Empresa</h4>
                <p>{selectedReservation.company || 'No especificado'}</p>
          </div>

              {/* Asistentes */}
              <div className="reservation-info-card reservation-attendees-card">
                <h4>Asistentes</h4>
                <p>{selectedReservation.numberOfPeople || 'N/A'}</p>
                  </div>

              {/* Acomodo */}
                {selectedReservation.setupType && (
                <div className="reservation-info-card">
                  <h4>Acomodo</h4>
                  <p>{selectedReservation.setupType}</p>
                  </div>
                )}

              {/* Tipo de Reunión */}
              {selectedReservation.meetingType && (
                <div className="reservation-info-card">
                  <h4>Tipo de Reunión</h4>
                  <div className="reservation-type-badge">
                      {selectedReservation.meetingType === 'presencial' ? 'Presencial' : 'Híbrida'}
                  </div>
                </div>
              )}

              {/* Información de Catering */}
              {selectedReservation.coffeeBreak && (
                <div className="reservation-info-card">
                  <h4>Catering</h4>
                  <div className="reservation-type-badge">
                    {selectedReservation.coffeeBreak === 'si' ? 'Sí' : 
                     selectedReservation.coffeeBreak === 'no' ? 'No' : 'Buscando'}
                  </div>
                </div>
              )}

              {/* Proveedor de Catering */}
              {selectedReservation.cateringProvider?.name && (
                <div className="reservation-info-card">
                  <h4>Proveedor de Catering</h4>
                  <p>{selectedReservation.cateringProvider.name}</p>
                  {selectedReservation.cateringProvider.contact && (
                    <p><strong>Contacto:</strong> {selectedReservation.cateringProvider.contact}</p>
                  )}
                  {selectedReservation.cateringProvider.phone && (
                    <p><strong>Teléfono:</strong> {selectedReservation.cateringProvider.phone}</p>
                  )}
                </div>
              )}

              {/* Staff de Catering */}
              {selectedReservation.cateringStaff && selectedReservation.cateringStaff.length > 0 && (
                <div className="reservation-info-card">
                  <h4>Staff de Catering</h4>
                  <div className="catering-staff-list">
                    {selectedReservation.cateringStaff.map((staff, index) => (
                      <div key={index} className="catering-staff-item">
                        <p><strong>{staff.name}</strong></p>
                        {staff.company && <p>Empresa: {staff.company}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Invitados Externos */}
              {selectedReservation.externalVisitors && selectedReservation.externalVisitors.length > 0 && (
                <div className="reservation-info-card">
                  <h4>Invitados Externos</h4>
                  <div className="external-visitors-list">
                    {selectedReservation.externalVisitors.map((visitor: ExternalVisitor, index: number) => (
                      <div key={index} className="external-visitor-item">
                        <p><strong>{visitor.name}</strong></p>
                        {visitor.company && <p>Empresa: {visitor.company}</p>}
                        <div className="visitor-status">
                          <span className={`status-badge ${visitor.status}`}>
                            {visitor.status === 'confirmed' ? 'Confirmado' : 
                             visitor.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                          </span>
                          {visitor.ticketSent && <span className="ticket-sent">Ticket enviado</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Notas */}
            {selectedReservation.notes && (
                <div className="reservation-notes-section">
                  <div className="reservation-notes-content">
                    <h4>Notas</h4>
                    <p>{selectedReservation.notes}</p>
                </div>
              </div>
            )}
          </div>

            {/* Botones de Acción */}
            <div className="reservation-modal-actions">
              <button
                onClick={() => setShowReservationModal(false)}
                className="reservation-action-button secondary"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowReservationModal(false)
                  if (selectedReservation) {
                    console.log('🔍 Reservación seleccionada antes de editar:', selectedReservation);
                    handleEditReservation(selectedReservation)
                  }
                }}
                className="reservation-action-button primary"
              >
                Editar Reservación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Formulario de Reservación */}
      <ReservationForm
        isOpen={showReservationForm}
        onClose={() => {
          setShowReservationForm(false)
          setEditingReservation(null)
          setPreselectedSpace('')
          setPreselectedTime('')
        }}
        onSuccess={handleReservationFormSuccess}
        editingReservation={editingReservation}
        preselectedSpace={preselectedSpace}
        preselectedTime={preselectedTime}
        preselectedDate={editingReservation ? undefined : currentDate}
      />
    </section>
  )
}





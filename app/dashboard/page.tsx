"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardSection } from "@/components/features/dashboard-section"
import { ChangePasswordModal } from "@/components/features/change-password-modal"
import { useAuth } from "@/contexts/AuthContext"

export default function DashboardPage() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  // Detectar si el usuario debe cambiar su contraseña
  useEffect(() => {
    if (user && user.temporaryPassword) {
      setShowChangePasswordModal(true)
    }
  }, [user])

  const handlePasswordChangeSuccess = (updatedUser: any) => {
    console.log('✅ Contraseña actualizada exitosamente')
    setShowChangePasswordModal(false)
    
    // Actualizar el usuario en localStorage
    const storedUser = localStorage.getItem('authUser')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      userData.temporaryPassword = false
      localStorage.setItem('authUser', JSON.stringify(userData))
    }
    
    // Forzar recarga de la página para refrescar el estado
    window.location.reload()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      <DashboardSection />
      
      {/* Modal de cambio de contraseña obligatorio */}
      {user && (
        <ChangePasswordModal
          isOpen={showChangePasswordModal}
          userId={user.id}
          userName={user.nombre}
          isTemporary={true}
          onSuccess={handlePasswordChangeSuccess}
        />
      )}
    </>
  )
}


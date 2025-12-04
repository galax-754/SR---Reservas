"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { TabletView } from '@/components/features/tablet-view'

export default function TabletPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (!isLoading && user) {
      // Verificar que el usuario tenga rol de Tablet
      if (user.rol === 'Tablet' && user.assignedSpaceId) {
        setIsAuthorized(true)
      } else {
        // Redirigir a dashboard si no es tablet o no tiene espacio asignado
        router.push('/dashboard')
      }
    } else if (!isLoading && !user) {
      // Redirigir a login si no está autenticado
      router.push('/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    )
  }

  if (!isAuthorized || !user?.assignedSpaceId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-pink-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">Acceso no autorizado</div>
      </div>
    )
  }

  return <TabletView assignedSpaceId={user.assignedSpaceId} />
}







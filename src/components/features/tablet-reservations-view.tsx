"use client"

import React, { useState, useEffect } from 'react'
import { Clock, Calendar, Users, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { reservationsAPI } from '@/services/reservationsAPI'
import { spacesAPI } from '@/services/spacesAPI'
import { Reservation } from '@/types/reservation'
import { Space } from '@/types/space'
import { useAuth } from '@/contexts/AuthContext'

export function TabletReservationsView() {
  const { user } = useAuth()
  const [space, setSpace] = useState<Space | null>(null)
  const [currentReservation, setCurrentReservation] = useState<Reservation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Debug logging
  useEffect(() => {
    console.log('🔍 TabletReservationsView - Usuario:', user)
    console.log('🔍 TabletReservationsView - Rol:', user?.rol)
    console.log('🔍 TabletReservationsView - assignedSpaceId:', user?.assignedSpaceId)
  }, [user])

  // Actualizar la hora cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Cada minuto

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    console.log('🔍 useEffect - user?.assignedSpaceId:', user?.assignedSpaceId)
    console.log('🔍 useEffect - user existe:', !!user)
    
    if (user?.assignedSpaceId) {
      console.log('✅ Cargando datos del espacio...')
      loadSpaceData()
      checkCurrentReservation()
      
      // Verificar reservación actual cada minuto
      const interval = setInterval(() => {
        checkCurrentReservation()
        setLastUpdate(new Date())
      }, 60000)

      return () => clearInterval(interval)
    } else {
      console.log('❌ No hay assignedSpaceId, no se cargan datos')
      setIsLoading(false)
    }
  }, [user?.assignedSpaceId])

  const loadSpaceData = async () => {
    try {
      const spaces = await spacesAPI.getAll()
      const assignedSpace = spaces.find(s => s.id === user?.assignedSpaceId)
      setSpace(assignedSpace || null)
    } catch (error) {
      console.error('❌ Error cargando espacio:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const checkCurrentReservation = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const reservations = await reservationsAPI.getAll()
      
      // Filtrar reservas para este espacio y hoy
      const todayReservations = reservations.filter(r => 
        r.space?.id === user?.assignedSpaceId && 
        r.date === today &&
        r.status !== 'cancelled'
      )

      // Buscar la reserva actual basada en la hora
      const now = new Date()
      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()
      const currentTimeMinutes = currentHour * 60 + currentMinute

      const activeReservation = todayReservations.find(r => {
        const [startHour, startMin] = r.startTime.split(':').map(Number)
        const [endHour, endMin] = r.endTime.split(':').map(Number)
        const startMinutes = startHour * 60 + startMin
        const endMinutes = endHour * 60 + endMin

        return currentTimeMinutes >= startMinutes && currentTimeMinutes < endMinutes
      })

      setCurrentReservation(activeReservation || null)
    } catch (error) {
      console.error('Error verificando reservación:', error)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleRefresh = () => {
    checkCurrentReservation()
    setLastUpdate(new Date())
  }

  if (isLoading) {
    return (
      <div 
        className="min-h-screen relative overflow-hidden flex items-center justify-center p-4"
        style={{
          backgroundImage: 'url(/fondo_escritorio.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay oscuro para mejorar legibilidad */}
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <div className="text-white text-xl font-medium">Cargando estado del espacio...</div>
        </div>
      </div>
    )
  }

  if (!space) {
    return (
      <div 
        className="min-h-screen relative overflow-hidden flex items-center justify-center p-4"
        style={{
          backgroundImage: 'url(/fondo_escritorio.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay oscuro para mejorar legibilidad */}
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="text-center relative z-10">
          <div className="bg-red-500/20 backdrop-blur-sm rounded-full p-4 mx-auto mb-4 w-fit border border-red-400/50">
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
          <div className="text-white text-xl font-medium">Espacio no encontrado</div>
          <div className="text-white/70 text-sm mt-2">No se pudo cargar la información del espacio asignado</div>
        </div>
      </div>
    )
  }

  const isAvailable = !currentReservation

  return (
    <div 
      className="min-h-screen relative overflow-hidden p-4"
      style={{
        backgroundImage: 'url(/fondo_escritorio.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay oscuro para mejorar legibilidad */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header con información del espacio */}
        <div className="text-center mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 mb-6">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              {space.name}
            </h1>
            <div className="flex items-center justify-center gap-6 text-white/80 text-base md:text-lg">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-300" />
                <span className="font-medium">Capacidad: {space.capacity} personas</span>
              </div>
              {space.location && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">{space.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Estado actual */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-6 md:p-8 text-center mb-6">
          <div className={`inline-flex items-center gap-6 p-6 md:p-8 rounded-2xl mb-6 backdrop-blur-md ${
            isAvailable 
              ? 'bg-green-500/20 border-2 border-green-400/50' 
              : 'bg-red-500/20 border-2 border-red-400/50'
          }`}>
            {isAvailable ? (
              <CheckCircle className="w-12 h-12 md:w-16 md:h-16 text-green-400" />
            ) : (
              <XCircle className="w-12 h-12 md:w-16 md:h-16 text-red-400" />
            )}
            <span className={`text-2xl md:text-4xl font-bold ${
              isAvailable ? 'text-green-300' : 'text-red-300'
            }`}>
              {isAvailable ? 'DISPONIBLE' : 'OCUPADO'}
            </span>
          </div>

          {/* Información de la reserva actual */}
          {currentReservation && (
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/10">
              <h3 className="text-xl md:text-2xl font-semibold text-white mb-4">
                Reservado
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-white/90">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/20 p-2 rounded-lg backdrop-blur-sm">
                    <Clock className="w-5 h-5 md:w-6 md:h-6 text-blue-300" />
                  </div>
                  <div>
                    <p className="text-base md:text-lg font-semibold text-white">
                      {currentReservation.startTime} - {currentReservation.endTime}
                    </p>
                    <p className="text-xs md:text-sm text-white/70">Horario de reserva</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/20 p-2 rounded-lg backdrop-blur-sm">
                    <Users className="w-5 h-5 md:w-6 md:h-6 text-blue-300" />
                  </div>
                  <div>
                    <p className="text-base md:text-lg font-semibold text-white">
                      {currentReservation.company}
                    </p>
                    <p className="text-xs md:text-sm text-white/70">Organización</p>
                  </div>
                </div>
              </div>
              {currentReservation.coordinatorName && (
                <div className="mt-4 md:mt-6 pt-4 border-t border-white/20">
                  <p className="text-white/90 text-sm md:text-base">
                    <strong className="text-white">Coordinador:</strong> {currentReservation.coordinatorName}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Información de fecha y hora */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-4 md:p-6 text-center mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="flex items-center justify-center gap-4">
              <div className="bg-blue-500/20 p-3 rounded-xl backdrop-blur-sm">
                <Calendar className="w-6 h-6 md:w-8 md:h-8 text-blue-300" />
              </div>
              <div className="text-left">
                <p className="text-base md:text-lg font-semibold text-white">
                  {formatDate(currentTime)}
                </p>
                <p className="text-xs md:text-sm text-white/70">Fecha actual</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4">
              <div className="bg-blue-500/20 p-3 rounded-xl backdrop-blur-sm">
                <Clock className="w-6 h-6 md:w-8 md:h-8 text-blue-300" />
              </div>
              <div className="text-left">
                <p className="text-base md:text-lg font-semibold text-white">
                  {formatTime(currentTime)}
                </p>
                <p className="text-xs md:text-sm text-white/70">Hora actual</p>
              </div>
            </div>
          </div>
        </div>

        {/* Información de actualización */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-white/70 text-sm">
            <RefreshCw className="w-4 h-4" />
            <span>Última actualización: {formatTime(lastUpdate)}</span>
            <button
              onClick={handleRefresh}
              className="ml-2 p-1 hover:bg-white/10 rounded transition-colors"
              title="Actualizar ahora"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <p className="text-white/70 text-xs mt-1">
            Esta pantalla se actualiza automáticamente cada minuto
          </p>
        </div>
      </div>
    </div>
  )
}

"use client"

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { LogIn, Eye, EyeOff, AlertCircle, Play } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export function LoginSection() {
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [showPlayButton, setShowPlayButton] = useState(false)
  const [useImageFallback, setUseImageFallback] = useState(false)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  
  const { login } = useAuth()
  const router = useRouter()
  const videoRefDesktop = useRef<HTMLVideoElement>(null)
  const videoRefMobile = useRef<HTMLVideoElement>(null)
  const fallbackTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const interactionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Manejar reproducción automática del video con fallback a imagen
  useEffect(() => {
    const isMobile = window.innerWidth < 768
    const video = isMobile ? videoRefMobile.current : videoRefDesktop.current
    
    if (!video) return

    // Función para activar fallback a imagen
    const activateImageFallback = () => {
      setUseImageFallback(true)
      setShowPlayButton(false)
      setIsVideoPlaying(false)
      console.log('Activando fallback a imagen de fondo')
    }

    // Función para intentar reproducir video después de interacción del usuario
    const tryPlayAfterInteraction = async () => {
      if (hasUserInteracted) return // Solo intentar una vez
      
      setHasUserInteracted(true)
      
      try {
        await video.play()
        setIsVideoPlaying(true)
        setShowPlayButton(false)
        setUseImageFallback(false)
        
        // Limpiar todos los timeouts si el video inicia
        if (fallbackTimeoutRef.current) {
          clearTimeout(fallbackTimeoutRef.current)
          fallbackTimeoutRef.current = null
        }
        if (interactionTimeoutRef.current) {
          clearTimeout(interactionTimeoutRef.current)
          interactionTimeoutRef.current = null
        }
      } catch (error) {
        console.log('Error al reproducir video después de interacción:', error)
        // Si falla después de la interacción, activar fallback inmediatamente
        activateImageFallback()
      }
    }

    const handleLoadStart = () => {
      // Limpiar timeout anterior si existe
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current)
      }

      // Intentar reproducir cuando el video se carga
      video.play().catch(() => {
        // Si falla la reproducción automática, mostrar botón de play
        setShowPlayButton(true)
        setIsVideoPlaying(false)
      })

      // Configurar timeout de 4 segundos para fallback a imagen
      fallbackTimeoutRef.current = setTimeout(() => {
        if (!isVideoPlaying && !hasUserInteracted) {
          activateImageFallback()
        }
      }, 4000)
    }

    const handlePlay = () => {
      setIsVideoPlaying(true)
      setShowPlayButton(false)
      setUseImageFallback(false)
      
      // Limpiar timeout si el video inicia correctamente
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current)
        fallbackTimeoutRef.current = null
      }
    }

    const handlePause = () => {
      setIsVideoPlaying(false)
    }

    const handleError = () => {
      setShowPlayButton(true)
      setIsVideoPlaying(false)
      
      // Activar fallback inmediatamente si hay error
      activateImageFallback()
    }

    video.addEventListener('loadstart', handleLoadStart)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('error', handleError)

    // Intentar reproducir inmediatamente
    video.play().catch(() => {
      setShowPlayButton(true)
    })

    return () => {
      video.removeEventListener('loadstart', handleLoadStart)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('error', handleError)
      
      // Limpiar timeouts al desmontar
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current)
        fallbackTimeoutRef.current = null
      }
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current)
        interactionTimeoutRef.current = null
      }
    }
  }, [isVideoPlaying, hasUserInteracted])

  // Función para manejar clics en móviles
  const handleMobileInteraction = () => {
    const isMobile = window.innerWidth < 768
    if (!isMobile || hasUserInteracted || useImageFallback) return
    
    console.log('Usuario interactuó en móvil, intentando reproducir video...')
    
    // Limpiar timeout de fallback si existe
    if (fallbackTimeoutRef.current) {
      clearTimeout(fallbackTimeoutRef.current)
      fallbackTimeoutRef.current = null
    }
    
    // Intentar reproducir el video
    const video = videoRefMobile.current
    if (!video) return
    
    video.play()
      .then(() => {
        setIsVideoPlaying(true)
        setShowPlayButton(false)
        setUseImageFallback(false)
        setHasUserInteracted(true)
      })
      .catch((error) => {
        console.log('Error al reproducir video después de interacción:', error)
        
        // Configurar timeout de 2 segundos después de la interacción
        // Si no funciona en 2 segundos, usar imagen de fondo
        interactionTimeoutRef.current = setTimeout(() => {
          if (!isVideoPlaying) {
            activateImageFallback()
          }
        }, 2000)
      })
  }

  const handlePlayVideo = async () => {
    const isMobile = window.innerWidth < 768
    const video = isMobile ? videoRefMobile.current : videoRefDesktop.current
    
    if (!video) return

    try {
      await video.play()
      setShowPlayButton(false)
      setIsVideoPlaying(true)
      setUseImageFallback(false)
      
      // Limpiar timeout si el video inicia correctamente
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current)
        fallbackTimeoutRef.current = null
      }
    } catch (error) {
      console.error('Error al reproducir video:', error)
      // Si falla, activar fallback a imagen
      setUseImageFallback(true)
      setShowPlayButton(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login({ correo, contrasena })
      // Redirigir según el rol del usuario
      const storedUser = localStorage.getItem('authUser')
      if (storedUser) {
        const user = JSON.parse(storedUser)
        if (user.rol === 'Tablet') {
          router.push('/tablet')
        } else {
          router.push('/dashboard')
        }
      } else {
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div 
      className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 overflow-hidden"
      onClick={handleMobileInteraction}
    >
      {/* Imagen de fondo - Desktop */}
      <div 
        className="hidden md:block absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/fondo_escritorio.png')`
        }}
      />
      
      {/* Imagen de fondo - Mobile */}
      <div 
        className="block md:hidden absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/fondo_movil.png')`
        }}
      />
      
      {/* Video de fondo - desktop (solo si no está en fallback) */}
      {!useImageFallback && (
        <video
          ref={videoRefDesktop}
          className="hidden md:block absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          webkit-playsinline="true"
          onError={() => {
            console.log('Error en video desktop, usando imagen de fondo')
            setUseImageFallback(true)
          }}
        >
          <source src="/Video_fondo_escritorio.mp4?v=2" type="video/mp4" />
        </video>
      )}
      
      {/* Video de fondo - mobile (solo si no está en fallback) */}
      {!useImageFallback && (
        <video
          ref={videoRefMobile}
          className="block md:hidden absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          webkit-playsinline="true"
          onError={() => {
            console.log('Error en video móvil, usando imagen de fondo')
            setUseImageFallback(true)
          }}
        >
          <source src="/Video_fondo_movil.mp4?v=2" type="video/mp4" />
        </video>
      )}

      {/* Botón de play para móviles cuando el video no se reproduce automáticamente */}
      {showPlayButton && !useImageFallback && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={handlePlayVideo}
        >
          <div className="text-center">
            <div className="bg-white/95 backdrop-blur-md rounded-full p-4 sm:p-6 shadow-2xl hover:bg-white transition-colors mb-3">
              <Play className="w-8 h-8 sm:w-12 sm:h-12 text-gray-800 ml-1 mx-auto" fill="currentColor" />
            </div>
            <p className="text-white text-sm font-medium">Toca para reproducir video</p>
          </div>
        </motion.button>
      )}
      
      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-black/40" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Sistema de Reservas
            </h1>
            <p className="text-white/80 text-xs sm:text-sm">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-500/20 backdrop-blur-sm border border-red-400/50 rounded-lg sm:rounded-xl flex items-start space-x-2 sm:space-x-3"
            >
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-200 flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-red-100">{error}</p>
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label 
                htmlFor="correo" 
                className="block text-xs sm:text-sm font-semibold text-white mb-1.5 sm:mb-2"
              >
                Correo electrónico
              </label>
              <input
                id="correo"
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg sm:rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all focus:bg-white/20 text-sm sm:text-base"
                placeholder="tu@correo.com"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label 
                htmlFor="contrasena" 
                className="block text-xs sm:text-sm font-semibold text-white mb-1.5 sm:mb-2"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="contrasena"
                  type={showPassword ? 'text' : 'password'}
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg sm:rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all pr-10 sm:pr-12 focus:bg-white/20 text-sm sm:text-base"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors p-1 touch-manipulation"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-3 sm:py-3.5 rounded-lg sm:rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/60 disabled:opacity-50 disabled:cursor-not-allowed mt-4 sm:mt-6 text-sm sm:text-base touch-manipulation"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              ) : (
                "Iniciar Sesión"
              )}
            </motion.button>
          </form>

        </div>
      </motion.div>
    </div>
  )
}

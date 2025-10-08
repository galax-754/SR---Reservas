"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export function LoginSection() {
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { login } = useAuth()
  const router = useRouter()

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
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Video de fondo - desktop */}
      <video
        className="hidden md:block absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/Video_fondo_escritorio.mp4" type="video/mp4" />
      </video>
      
      {/* Video de fondo - mobile */}
      <video
        className="block md:hidden absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/Video_fondo_movil.mp4" type="video/mp4" />
      </video>
      
      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-black/40" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
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

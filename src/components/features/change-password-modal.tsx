"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

interface ChangePasswordModalProps {
  isOpen: boolean
  userId: string
  userName: string
  isTemporary: boolean // Si es true, el modal no se puede cerrar
  onSuccess: (updatedUser: any) => void
  onCancel?: () => void
}

interface PasswordStrength {
  score: number
  message: string
  color: string
}

export function ChangePasswordModal({
  isOpen,
  userId,
  userName,
  isTemporary,
  onSuccess,
  onCancel
}: ChangePasswordModalProps) {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Validar fortaleza de contraseña en tiempo real
  const getPasswordStrength = (password: string): PasswordStrength => {
    if (!password) {
      return { score: 0, message: '', color: 'text-gray-400' }
    }

    let score = 0
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }

    if (checks.length) score++
    if (checks.uppercase) score++
    if (checks.lowercase) score++
    if (checks.number) score++
    if (checks.special) score++

    if (score <= 2) {
      return { score, message: 'Débil', color: 'text-red-500' }
    } else if (score === 3) {
      return { score, message: 'Regular', color: 'text-yellow-500' }
    } else if (score === 4) {
      return { score, message: 'Buena', color: 'text-blue-500' }
    } else {
      return { score, message: 'Excelente', color: 'text-green-500' }
    }
  }

  const passwordStrength = getPasswordStrength(newPassword)

  // Validar requisitos
  const requirements = [
    { met: newPassword.length >= 8, label: 'Mínimo 8 caracteres' },
    { met: /[A-Z]/.test(newPassword), label: 'Una mayúscula' },
    { met: /[a-z]/.test(newPassword), label: 'Una minúscula' },
    { met: /[0-9]/.test(newPassword), label: 'Un número' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validaciones
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Todos los campos son requeridos')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas nuevas no coinciden')
      return
    }

    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    if (!/[A-Z]/.test(newPassword)) {
      setError('La contraseña debe contener al menos una mayúscula')
      return
    }

    if (!/[a-z]/.test(newPassword)) {
      setError('La contraseña debe contener al menos una minúscula')
      return
    }

    if (!/[0-9]/.test(newPassword)) {
      setError('La contraseña debe contener al menos un número')
      return
    }

    if (newPassword === oldPassword) {
      setError('La nueva contraseña debe ser diferente a la actual')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          oldPassword,
          newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cambiar la contraseña')
      }

      // Éxito - actualizar usuario en el padre
      onSuccess(data.user)
      
      // Limpiar formulario
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')

    } catch (err: any) {
      setError(err.message || 'Error al cambiar la contraseña')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (isTemporary) return // No permitir cerrar si es temporal
    
    setOldPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setError('')
    onCancel?.()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} size="lg">
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 sm:mb-6 gap-2">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-2xl font-bold text-white truncate">
                {isTemporary ? '🔐 Cambio Requerido' : 'Cambiar Contraseña'}
              </h2>
              <p className="text-xs sm:text-sm text-white/80 mt-0.5 sm:mt-1">
                {isTemporary 
                  ? 'Debes cambiar tu contraseña temporal'
                  : 'Actualiza tu contraseña'
                }
              </p>
            </div>
          </div>
          {!isTemporary && (
            <button
              onClick={handleCancel}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 touch-manipulation"
              disabled={isLoading}
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            </button>
          )}
        </div>

        {/* Alert de contraseña temporal */}
        {isTemporary && (
          <div className="mb-6 p-4 bg-yellow-900/30 border-l-4 border-yellow-400 rounded-r-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Contraseña Temporal Activa
                </h3>
                <p className="text-sm text-white/90 mt-1">
                  Estás usando una contraseña temporal. Por tu seguridad, debes crear una nueva contraseña 
                  antes de continuar usando el sistema.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-900/30 border-l-4 border-red-400 rounded-r-lg flex items-start space-x-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-white">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-5">
          {/* Contraseña Actual */}
          <div>
            <label htmlFor="oldPassword" className="block text-xs sm:text-sm font-semibold text-white mb-1.5 sm:mb-2">
              Contraseña Actual
            </label>
            <div className="relative">
              <input
                id="oldPassword"
                type={showOldPassword ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 pr-10 sm:pr-12 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/10 text-white border-white/30 placeholder-white/60 text-sm sm:text-base"
                placeholder="Tu contraseña actual"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors touch-manipulation"
                tabIndex={-1}
              >
                {showOldPassword ? (
                  <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
                ) : (
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
                )}
              </button>
            </div>
          </div>

          {/* Nueva Contraseña */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-semibold text-white mb-2">
              Nueva Contraseña
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/10 text-white border-white/30 placeholder-white/60"
                placeholder="Tu nueva contraseña"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-white/20 rounded-lg transition-colors"
                tabIndex={-1}
              >
                {showNewPassword ? (
                  <EyeOff className="w-5 h-5 text-white/70" />
                ) : (
                  <Eye className="w-5 h-5 text-white/70" />
                )}
              </button>
            </div>

            {/* Strength Indicator */}
            {newPassword && (
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/80">Fortaleza:</span>
                  <span className={`font-semibold ${passwordStrength.color}`}>
                    {passwordStrength.message}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${
                      passwordStrength.score <= 2
                        ? 'bg-red-500'
                        : passwordStrength.score === 3
                        ? 'bg-yellow-500'
                        : passwordStrength.score === 4
                        ? 'bg-blue-500'
                        : 'bg-green-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}

            {/* Requirements Checklist */}
            {newPassword && (
              <div className="mt-3 space-y-1.5">
                {requirements.map((req, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    {req.met ? (
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <div className="w-4 h-4 border-2 border-gray-300 rounded-full flex-shrink-0" />
                    )}
                    <span className={req.met ? 'text-green-400' : 'text-white/70'}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Confirmar Nueva Contraseña */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-white mb-2">
              Confirmar Nueva Contraseña
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:border-transparent transition-all bg-white/10 text-white placeholder-white/60 ${
                  confirmPassword && newPassword !== confirmPassword
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-white/30 focus:ring-blue-500'
                }`}
                placeholder="Confirma tu nueva contraseña"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-white/20 rounded-lg transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5 text-white/70" />
                ) : (
                  <Eye className="w-5 h-5 text-white/70" />
                )}
              </button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>Las contraseñas no coinciden</span>
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-3 sm:pt-4">
            {!isTemporary && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              disabled={
                isLoading ||
                !oldPassword ||
                !newPassword ||
                !confirmPassword ||
                newPassword !== confirmPassword ||
                passwordStrength.score < 3
              }
              className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto sm:min-w-[140px]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-4 h-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              ) : (
                'Cambiar Contraseña'
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}





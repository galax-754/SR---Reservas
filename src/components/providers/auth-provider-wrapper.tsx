"use client"

import { AuthProvider } from "@/contexts/AuthContext"
import { ReactNode } from "react"

interface AuthProviderWrapperProps {
  children: ReactNode
}

export function AuthProviderWrapper({ children }: AuthProviderWrapperProps) {
  return <AuthProvider>{children}</AuthProvider>
}






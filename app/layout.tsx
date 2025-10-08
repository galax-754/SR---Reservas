import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProviderWrapper } from "@/components/providers/auth-provider-wrapper"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "SR - Reservas",
  description: "Sistema de Reservas de Espacios",
  generator: "v0.app",
  alternates: {
    canonical: "https://sr-reservas.example/",
  },
  openGraph: {
    siteName: "SR - Reservas",
    title: "Sistema de Reservas de Espacios | SR - Reservas",
    description: "Sistema de Reservas de Espacios",
    type: "website",
    url: "https://sr-reservas.example/",
    images: [
      {
        url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/opengraph-katachi.jpg-7vz2r3hxZA6woukGOmH115Fg7Piyjs.jpeg",
        alt: "SR - Reservas — Sistema de Reservas de Espacios",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_BE",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sistema de Reservas de Espacios | SR - Reservas",
    description: "Sistema de Reservas de Espacios",
    images: [
      {
        url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/opengraph-katachi.jpg-7vz2r3hxZA6woukGOmH115Fg7Piyjs.jpeg",
        alt: "SR - Reservas — Sistema de Reservas de Espacios",
      },
    ],
    site: "@srreservas",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${inter.variable} antialiased`}>
      <body className="font-sans bg-neutral-50 text-neutral-900 overflow-x-hidden">
        <AuthProviderWrapper>{children}</AuthProviderWrapper>
      </body>
    </html>
  )
}

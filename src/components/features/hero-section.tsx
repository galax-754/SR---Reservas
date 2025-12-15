"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { MapPin, User, CheckCircle, LogIn } from "lucide-react" // Iconos profesionales para el proceso de reserva
import { Reveal } from "@/components/ui/reveal"
import { BlurPanel } from "@/components/ui/blur-panel"

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  const imageScale = useTransform(scrollYProgress, [0, 1], [1.1, 1.0]) // Slightly zoomed to focus on top
  const imageY = useTransform(scrollYProgress, [0, 1], [0, -50])
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 100])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  // Estado para las palabras animadas
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const words = ["Trabajar", "Reunirte", "Planear", "Aprender"]

  // Efecto para el efecto de escritura
  useEffect(() => {
    const currentWord = words[currentWordIndex]
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Escribiendo
        if (displayedText.length < currentWord.length) {
          setDisplayedText(currentWord.slice(0, displayedText.length + 1))
        } else {
          // Pausa antes de borrar
          setTimeout(() => setIsDeleting(true), 1000)
        }
      } else {
        // Borrando
        if (displayedText.length > 0) {
          setDisplayedText(displayedText.slice(0, -1))
        } else {
          // Cambiar a la siguiente palabra
          setIsDeleting(false)
          setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length)
        }
      }
    }, isDeleting ? 100 : 200) // Velocidad de borrado más rápida

    return () => clearTimeout(timeout)
  }, [displayedText, currentWordIndex, isDeleting, words])

  // Función para ir a login
  const handleLoginClick = () => {
    router.push('/login')
  }

  const AnimatedText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
    return (
      <span>
        {text.split("").map((char, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: delay + index * 0.03,
              ease: [0.21, 0.47, 0.32, 0.98],
            }}
            style={{ display: char === " " ? "inline" : "inline-block" }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </span>
    )
  }

  // Componente para la palabra animada
  const AnimatedWord = ({ word, delay = 0 }: { word: string; delay?: number }) => {
    return (
      <motion.span
        key={word}
        initial={{ opacity: 0, y: 30, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -30, scale: 0.8 }}
        transition={{
          duration: 0.8,
          delay: delay,
          ease: [0.21, 0.47, 0.32, 0.98],
        }}
        className="inline-block"
      >
        {word}
      </motion.span>
    )
  }

  return (
    <section ref={containerRef} className="relative h-screen overflow-hidden bg-black">
      {/* Background Video with Cinematic Effects */}
      <motion.div
        className="absolute inset-0"
        style={{ scale: imageScale, y: imageY }}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.2, ease: [0.21, 0.47, 0.32, 0.98] }}
      >
        {/* Video para escritorio/iPad - visible en pantallas md y superiores */}
        <video
          className="hidden md:block w-full h-full object-cover object-top"
          autoPlay
          muted
          loop
          playsInline
        >
            <source src="/Video_fondo_escritorio.mp4?v=3" type="video/mp4" />
        </video>
        
        {/* Video para móvil - visible en pantallas menores a md */}
        <video
          className="block md:hidden w-full h-full object-cover object-top"
          autoPlay
          muted
          loop
          playsInline
        >
            <source src="/Video_fondo_movil.mp4?v=3" type="video/mp4" />
        </video>
        
        <div className="absolute inset-0 bg-black/70" />
      </motion.div>

      {/* Content */}
      <motion.div
        className="relative z-10 h-full flex items-start justify-center px-4 sm:px-6 pt-4 sm:pt-6 md:pt-8 lg:pt-12"
        style={{ y: contentY, opacity: contentOpacity }}
      >
        <div className="max-w-7xl mx-auto text-center text-white w-full">
          <Reveal>
            {/* Logo */}
            <div className="flex justify-center mb-1 sm:mb-2 md:mb-3">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Image
                  src="/Logo_consolida.png"
                  alt="Logo Consolida"
                  width={200}
                  height={200}
                  className="w-auto h-32 sm:h-40 md:h-52 lg:h-64 xl:h-72 object-contain"
                  priority
                />
              </motion.div>
            </div>
            {/* Título GRUPO CONSOLIDA */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight md:leading-none tracking-tight mb-2 sm:mb-3 md:mb-4 px-2 uppercase" style={{ fontFamily: "'Century Gothic', 'CenturyGothic', AppleGothic, sans-serif", color: '#e0e6f6' }}>
              GRUPO CONSOLIDA
            </h1>
            {/* Subtítulo Reserva un espacio para */}
            <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-normal leading-tight md:leading-none tracking-tight mb-1 sm:mb-2 md:mb-3 px-2" style={{ fontFamily: "'Century Gothic', 'CenturyGothic', AppleGothic, sans-serif", color: '#e0e6f6' }}>
              <span>Reserva un espacio para</span>
            </h2>
            <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-light italic leading-tight md:leading-none tracking-tight mb-2 sm:mb-3 md:mb-4 px-2" style={{ color: '#e0e6f6' }}>
              <span className="inline-block">
                {displayedText}
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
                  className="inline-block"
                >
                  |
                </motion.span>
              </span>
            </h3>
            
            {/* Botón de Iniciar Sesión */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.5 }}
              className="mt-6 sm:mt-8 md:mt-10 lg:mt-12"
            >
              <motion.button
                onClick={handleLoginClick}
                className="inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 bg-transparent border-2 rounded-full font-semibold text-base sm:text-lg transition-all duration-300 shadow-lg hover:shadow-xl touch-manipulation"
                style={{ borderColor: '#e0e6f6', color: '#e0e6f6' }}
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(224, 230, 246, 0.1)' }}
                whileTap={{ scale: 0.95 }}
              >
                <LogIn className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#e0e6f6' }} />
                Iniciar Sesión
              </motion.button>
            </motion.div>

            {/* Mensaje descriptivo */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 2 }}
              className="mt-4 sm:mt-5 md:mt-6 lg:mt-8 text-center"
            >
              <p className="text-xs sm:text-sm" style={{ color: '#e0e6f6', opacity: 0.8 }}>
                Accede al sistema de reservas
              </p>
            </motion.div>
          </Reveal>

        </div>
      </motion.div>

      {/* Info Strip */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 z-20 flex justify-center px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2, ease: [0.21, 0.47, 0.32, 0.98] }}
      >
        <BlurPanel className="mx-2 sm:mx-6 mb-4 sm:mb-6 px-3 sm:px-6 py-3 sm:py-4 bg-black/24 backdrop-blur-md border-white/20 w-full sm:w-auto">
          <div className="flex items-center justify-center sm:justify-between gap-3 sm:gap-6 flex-wrap sm:flex-nowrap" style={{ color: '#e0e6f6' }}>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" style={{ color: '#e0e6f6' }} />
              <span className="text-xs sm:text-sm whitespace-nowrap">Elige tu espacio</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" style={{ color: '#e0e6f6' }} />
              <span className="text-xs sm:text-sm whitespace-nowrap">Llena tus datos</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" style={{ color: '#e0e6f6' }} />
              <span className="text-xs sm:text-sm whitespace-nowrap">Listo</span>
            </div>
          </div>
        </BlurPanel>
      </motion.div>
    </section>
  )
}

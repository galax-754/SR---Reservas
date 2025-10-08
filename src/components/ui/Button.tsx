"use client"

import { forwardRef } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive"
  size?: "sm" | "md" | "lg"
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = "default", 
    size = "md", 
    isLoading = false,
    leftIcon,
    rightIcon,
    children, 
    disabled,
    ...props 
  }, ref) => {
    const baseClasses = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation active:scale-95"
    
    const variants = {
      default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 active:bg-blue-800",
      outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500 active:bg-gray-100",
      ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500 active:bg-gray-200",
      destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 active:bg-red-800"
    }
    
    const sizes = {
      sm: "px-2.5 py-1.5 text-xs sm:px-3 sm:text-sm",
      md: "px-3 py-2 text-sm sm:px-4",
      lg: "px-4 py-2.5 text-sm sm:px-6 sm:py-3 sm:text-base"
    }

    return (
      <motion.button
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin mr-1.5 sm:mr-2" />
        ) : leftIcon ? (
          <span className="mr-1.5 sm:mr-2 flex items-center">{leftIcon}</span>
        ) : null}
        
        <span className="truncate">{children}</span>
        
        {rightIcon && !isLoading && (
          <span className="ml-1.5 sm:ml-2 flex items-center">{rightIcon}</span>
        )}
      </motion.button>
    )
  }
)

Button.displayName = "Button"

export { Button }

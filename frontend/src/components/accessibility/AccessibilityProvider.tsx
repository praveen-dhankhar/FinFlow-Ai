'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AccessibilityContextType {
  // High contrast mode
  isHighContrast: boolean
  toggleHighContrast: () => void
  
  // Reduced motion
  isReducedMotion: boolean
  toggleReducedMotion: () => void
  
  // Font size
  fontSize: 'small' | 'medium' | 'large'
  setFontSize: (size: 'small' | 'medium' | 'large') => void
  
  // Focus management
  focusVisible: boolean
  setFocusVisible: (visible: boolean) => void
  
  // Screen reader announcements
  announce: (message: string) => void
  
  // Keyboard navigation
  isKeyboardNavigation: boolean
  setKeyboardNavigation: (enabled: boolean) => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

interface AccessibilityProviderProps {
  children: ReactNode
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [isHighContrast, setIsHighContrast] = useState(false)
  const [isReducedMotion, setIsReducedMotion] = useState(false)
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium')
  const [focusVisible, setFocusVisible] = useState(false)
  const [isKeyboardNavigation, setKeyboardNavigation] = useState(false)

  // Load preferences from localStorage
  useEffect(() => {
    const savedHighContrast = localStorage.getItem('accessibility-high-contrast')
    const savedReducedMotion = localStorage.getItem('accessibility-reduced-motion')
    const savedFontSize = localStorage.getItem('accessibility-font-size')
    
    if (savedHighContrast) {
      setIsHighContrast(savedHighContrast === 'true')
    }
    if (savedReducedMotion) {
      setIsReducedMotion(savedReducedMotion === 'true')
    }
    if (savedFontSize) {
      setFontSize(savedFontSize as 'small' | 'medium' | 'large')
    }

    // Check for system preferences
    if (window.matchMedia) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
      setIsReducedMotion(prefersReducedMotion.matches)
      
      const prefersHighContrast = window.matchMedia('(prefers-contrast: high)')
      setIsHighContrast(prefersHighContrast.matches)
    }
  }, [])

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('accessibility-high-contrast', isHighContrast.toString())
  }, [isHighContrast])

  useEffect(() => {
    localStorage.setItem('accessibility-reduced-motion', isReducedMotion.toString())
  }, [isReducedMotion])

  useEffect(() => {
    localStorage.setItem('accessibility-font-size', fontSize)
  }, [fontSize])

  // Apply accessibility settings to document
  useEffect(() => {
    const root = document.documentElement
    
    // High contrast
    if (isHighContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }
    
    // Reduced motion
    if (isReducedMotion) {
      root.classList.add('reduced-motion')
    } else {
      root.classList.remove('reduced-motion')
    }
    
    // Font size
    root.classList.remove('font-small', 'font-medium', 'font-large')
    root.classList.add(`font-${fontSize}`)
  }, [isHighContrast, isReducedMotion, fontSize])

  // Screen reader announcements
  const announce = (message: string) => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', 'polite')
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message
    
    document.body.appendChild(announcement)
    
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }

  // Keyboard navigation detection
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        setKeyboardNavigation(true)
        setFocusVisible(true)
      }
    }

    const handleMouseDown = () => {
      setKeyboardNavigation(false)
      setFocusVisible(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])

  const toggleHighContrast = () => {
    setIsHighContrast(prev => !prev)
  }

  const toggleReducedMotion = () => {
    setIsReducedMotion(prev => !prev)
  }

  const value: AccessibilityContextType = {
    isHighContrast,
    toggleHighContrast,
    isReducedMotion,
    toggleReducedMotion,
    fontSize,
    setFontSize,
    focusVisible,
    setFocusVisible,
    announce,
    isKeyboardNavigation,
    setKeyboardNavigation
  }

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  )
}

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider')
  }
  return context
}

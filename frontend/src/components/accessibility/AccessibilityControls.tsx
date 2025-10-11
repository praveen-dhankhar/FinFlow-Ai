'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Accessibility, 
  Eye, 
  EyeOff, 
  Type, 
  MousePointer, 
  Keyboard,
  Settings,
  X,
  Check
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useAccessibility } from './AccessibilityProvider'
import { cn } from '@/lib/utils/cn'

interface AccessibilityControlsProps {
  className?: string
}

export function AccessibilityControls({ className }: AccessibilityControlsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const {
    isHighContrast,
    toggleHighContrast,
    isReducedMotion,
    toggleReducedMotion,
    fontSize,
    setFontSize,
    isKeyboardNavigation
  } = useAccessibility()

  const fontSizeOptions = [
    { value: 'small', label: 'Small', description: 'Compact text' },
    { value: 'medium', label: 'Medium', description: 'Standard text' },
    { value: 'large', label: 'Large', description: 'Larger text' }
  ] as const

  return (
    <div className={cn('fixed bottom-4 left-4 z-50', className)}>
      {/* Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full shadow-lg"
        aria-label="Open accessibility controls"
      >
        <Accessibility className="w-5 h-5" />
      </Button>

      {/* Controls Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 left-0 w-80"
          >
            <Card className="shadow-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Accessibility className="w-5 h-5 text-blue-600" />
                    <CardTitle className="text-lg">Accessibility</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <CardDescription>
                  Customize your experience for better accessibility
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* High Contrast Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {isHighContrast ? (
                      <Eye className="w-5 h-5 text-blue-600" />
                    ) : (
                      <EyeOff className="w-5 h-5 text-gray-400" />
                    )}
                    <div>
                      <p className="font-medium">High Contrast</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Increase contrast for better visibility
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={isHighContrast ? "default" : "outline"}
                    size="sm"
                    onClick={toggleHighContrast}
                    className="min-w-[80px]"
                  >
                    {isHighContrast ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        On
                      </>
                    ) : (
                      'Off'
                    )}
                  </Button>
                </div>

                {/* Reduced Motion Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2",
                      isReducedMotion 
                        ? "border-blue-600 bg-blue-600" 
                        : "border-gray-300"
                    )}>
                      {isReducedMotion && (
                        <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">Reduced Motion</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Minimize animations and transitions
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={isReducedMotion ? "default" : "outline"}
                    size="sm"
                    onClick={toggleReducedMotion}
                    className="min-w-[80px]"
                  >
                    {isReducedMotion ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        On
                      </>
                    ) : (
                      'Off'
                    )}
                  </Button>
                </div>

                {/* Font Size Selector */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Type className="w-5 h-5 text-gray-600" />
                    <p className="font-medium">Font Size</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {fontSizeOptions.map((option) => (
                      <Button
                        key={option.value}
                        variant={fontSize === option.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFontSize(option.value)}
                        className="flex flex-col h-auto py-2"
                      >
                        <span className="text-xs font-medium">{option.label}</span>
                        <span className="text-xs text-gray-500">{option.description}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Status Indicators */}
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      {isKeyboardNavigation ? (
                        <Keyboard className="w-4 h-4 text-green-600" />
                      ) : (
                        <MousePointer className="w-4 h-4 text-gray-400" />
                      )}
                      <span className={cn(
                        isKeyboardNavigation ? 'text-green-600' : 'text-gray-400'
                      )}>
                        {isKeyboardNavigation ? 'Keyboard Navigation' : 'Mouse Navigation'}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Badge variant="secondary" className="text-xs">
                        <Settings className="w-3 h-3 mr-1" />
                        Customized
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Focus trap component for modals
interface FocusTrapProps {
  children: React.ReactNode
  active: boolean
  className?: string
}

export function FocusTrap({ children, active, className }: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!active || !containerRef.current) return

    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus()
          e.preventDefault()
        }
      }
    }

    document.addEventListener('keydown', handleTabKey)
    firstElement?.focus()

    return () => {
      document.removeEventListener('keydown', handleTabKey)
    }
  }, [active])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}

// Screen reader only text
export function ScreenReaderOnly({ children }: { children: React.ReactNode }) {
  return (
    <span className="sr-only">
      {children}
    </span>
  )
}

// Skip link for keyboard navigation
export function SkipLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded focus:shadow-lg"
    >
      {children}
    </a>
  )
}

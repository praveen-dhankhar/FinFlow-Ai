'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Download, 
  X, 
  Smartphone, 
  Monitor, 
  Wifi, 
  WifiOff,
  Bell,
  BellOff
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils/cn'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

interface PWAInstallPromptProps {
  className?: string
}

export function PWAInstallPrompt({ className }: PWAInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true)
      }
    }

    // Check online status
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    // Check notification permission
    const checkNotificationPermission = () => {
      setNotificationPermission(Notification.permission)
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowPrompt(true)
    }

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
    }

    // Initial checks
    checkInstalled()
    updateOnlineStatus()
    checkNotificationPermission()

    // Event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('PWA: User accepted the install prompt')
      } else {
        console.log('PWA: User dismissed the install prompt')
      }
      
      setDeferredPrompt(null)
      setShowPrompt(false)
    } catch (error) {
      console.error('PWA: Error during installation', error)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Store dismissal in localStorage to avoid showing again immediately
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  const handleEnableNotifications = async () => {
    try {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)
    } catch (error) {
      console.error('PWA: Error requesting notification permission', error)
    }
  }

  // Don't show if already installed or recently dismissed
  if (isInstalled || !showPrompt) {
    return null
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={cn('fixed bottom-4 right-4 z-50 max-w-sm', className)}
        >
          <Card className="shadow-lg border-0 bg-white dark:bg-gray-900">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">Install App</CardTitle>
                    <CardDescription className="text-xs">
                      Get quick access to your finances
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0 space-y-3">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Smartphone className="w-4 h-4" />
                  <span>Access from home screen</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Monitor className="w-4 h-4" />
                  <span>Works offline</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Wifi className="w-4 h-4" />
                  <span>Faster loading</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={handleInstall}
                  className="flex-1"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Install
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDismiss}
                  size="sm"
                >
                  Later
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// PWA Status component
export function PWAStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [isInstalled, setIsInstalled] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine)
    const checkInstalled = () => {
      setIsInstalled(window.matchMedia('(display-mode: standalone)').matches)
    }
    const checkNotificationPermission = () => {
      setNotificationPermission(Notification.permission)
    }

    updateOnlineStatus()
    checkInstalled()
    checkNotificationPermission()

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  return (
    <div className="flex items-center space-x-4 text-sm">
      <div className="flex items-center space-x-1">
        {isOnline ? (
          <Wifi className="w-4 h-4 text-green-600" />
        ) : (
          <WifiOff className="w-4 h-4 text-red-600" />
        )}
        <span className={cn(
          isOnline ? 'text-green-600' : 'text-red-600'
        )}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>

      {isInstalled && (
        <Badge variant="secondary" className="text-xs">
          <Smartphone className="w-3 h-3 mr-1" />
          Installed
        </Badge>
      )}

      <div className="flex items-center space-x-1">
        {notificationPermission === 'granted' ? (
          <Bell className="w-4 h-4 text-green-600" />
        ) : (
          <BellOff className="w-4 h-4 text-gray-400" />
        )}
        <span className={cn(
          notificationPermission === 'granted' ? 'text-green-600' : 'text-gray-400'
        )}>
          {notificationPermission === 'granted' ? 'Notifications' : 'No Notifications'}
        </span>
      </div>
    </div>
  )
}

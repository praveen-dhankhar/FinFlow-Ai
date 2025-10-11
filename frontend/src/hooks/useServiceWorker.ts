'use client'

import { useEffect, useState } from 'react'

interface ServiceWorkerState {
  isSupported: boolean
  isInstalled: boolean
  isUpdated: boolean
  registration: ServiceWorkerRegistration | null
  error: string | null
}

export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: false,
    isInstalled: false,
    isUpdated: false,
    registration: null,
    error: null
  })

  useEffect(() => {
    // Check if service workers are supported
    if (!('serviceWorker' in navigator)) {
      setState(prev => ({ ...prev, isSupported: false }))
      return
    }

    setState(prev => ({ ...prev, isSupported: true }))

    // Register service worker
    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        })

        setState(prev => ({ 
          ...prev, 
          registration,
          isInstalled: true,
          error: null
        }))

        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (!newWorker) return

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setState(prev => ({ ...prev, isUpdated: true }))
            }
          })
        })

        // Handle controller change
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload()
        })

      } catch (error) {
        console.error('Service worker registration failed:', error)
        setState(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : 'Registration failed'
        }))
      }
    }

    // Check if service worker is already installed
    if (navigator.serviceWorker.controller) {
      setState(prev => ({ ...prev, isInstalled: true }))
    }

    registerServiceWorker()
  }, [])

  // Update service worker
  const updateServiceWorker = () => {
    if (state.registration?.waiting) {
      state.registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    }
  }

  // Unregister service worker
  const unregisterServiceWorker = async () => {
    if (state.registration) {
      const success = await state.registration.unregister()
      if (success) {
        setState(prev => ({ 
          ...prev, 
          isInstalled: false,
          registration: null
        }))
      }
      return success
    }
    return false
  }

  return {
    ...state,
    updateServiceWorker,
    unregisterServiceWorker
  }
}

'use client'

import { useState, useEffect } from 'react'

interface PushNotificationState {
  isSupported: boolean
  permission: NotificationPermission
  subscription: PushSubscription | null
  isSubscribed: boolean
  error: string | null
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    permission: 'default',
    subscription: null,
    isSubscribed: false,
    error: null
  })

  useEffect(() => {
    // Check if push notifications are supported
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState(prev => ({ ...prev, isSupported: false }))
      return
    }

    setState(prev => ({ ...prev, isSupported: true, permission: Notification.permission }))

    // Check existing subscription
    checkSubscription()
  }, [])

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      
      setState(prev => ({
        ...prev,
        subscription,
        isSubscribed: !!subscription
      }))
    } catch (error) {
      console.error('Error checking push subscription:', error)
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to check subscription'
      }))
    }
  }

  const requestPermission = async (): Promise<boolean> => {
    try {
      const permission = await Notification.requestPermission()
      setState(prev => ({ ...prev, permission }))
      return permission === 'granted'
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to request permission'
      }))
      return false
    }
  }

  const subscribe = async (): Promise<boolean> => {
    try {
      if (!state.isSupported) {
        throw new Error('Push notifications are not supported')
      }

      if (state.permission !== 'granted') {
        const granted = await requestPermission()
        if (!granted) {
          throw new Error('Notification permission denied')
        }
      }

      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      })

      // Send subscription to server
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      })

      if (!response.ok) {
        throw new Error('Failed to save subscription')
      }

      setState(prev => ({
        ...prev,
        subscription,
        isSubscribed: true,
        error: null
      }))

      return true
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to subscribe'
      }))
      return false
    }
  }

  const unsubscribe = async (): Promise<boolean> => {
    try {
      if (!state.subscription) {
        return true
      }

      const success = await state.subscription.unsubscribe()
      
      if (success) {
        // Remove subscription from server
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ endpoint: state.subscription.endpoint }),
        })

        setState(prev => ({
          ...prev,
          subscription: null,
          isSubscribed: false,
          error: null
        }))
      }

      return success
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error)
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to unsubscribe'
      }))
      return false
    }
  }

  const sendTestNotification = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/push/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      return response.ok
    } catch (error) {
      console.error('Error sending test notification:', error)
      return false
    }
  }

  return {
    ...state,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification
  }
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Wifi, 
  WifiOff, 
  Cloud, 
  CloudOff, 
  Sync, 
  AlertTriangle,
  CheckCircle,
  Clock,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { cn } from '@/lib/utils/cn'

interface OfflineAction {
  id: string
  type: 'create' | 'update' | 'delete'
  resource: string
  data: any
  timestamp: Date
  retries: number
  maxRetries: number
}

interface OfflineHandlerProps {
  children: React.ReactNode
  className?: string
}

export function OfflineHandler({ children, className }: OfflineHandlerProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [isReconnecting, setIsReconnecting] = useState(false)
  const [pendingActions, setPendingActions] = useState<OfflineAction[]>([])
  const [syncProgress, setSyncProgress] = useState(0)
  const [lastSync, setLastSync] = useState<Date | null>(null)

  // Monitor online status
  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine
      setIsOnline(online)
      
      if (online && !isOnline) {
        setIsReconnecting(true)
        // Simulate reconnection delay
        setTimeout(() => {
          setIsReconnecting(false)
          setLastSync(new Date())
        }, 1000)
      }
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    updateOnlineStatus()

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [isOnline])

  // Load pending actions from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('offline-actions')
    if (stored) {
      try {
        const actions = JSON.parse(stored).map((action: any) => ({
          ...action,
          timestamp: new Date(action.timestamp)
        }))
        setPendingActions(actions)
      } catch (error) {
        console.error('Failed to load pending actions:', error)
      }
    }
  }, [])

  // Save pending actions to localStorage
  const savePendingActions = useCallback((actions: OfflineAction[]) => {
    localStorage.setItem('offline-actions', JSON.stringify(actions))
    setPendingActions(actions)
  }, [])

  // Add action to queue
  const queueAction = useCallback((action: Omit<OfflineAction, 'id' | 'timestamp' | 'retries'>) => {
    const newAction: OfflineAction = {
      ...action,
      id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      retries: 0,
      maxRetries: 3
    }

    const updatedActions = [...pendingActions, newAction]
    savePendingActions(updatedActions)
  }, [pendingActions, savePendingActions])

  // Sync pending actions
  const syncActions = useCallback(async () => {
    if (pendingActions.length === 0) return

    setIsReconnecting(true)
    setSyncProgress(0)

    const totalActions = pendingActions.length
    let completedActions = 0

    for (const action of pendingActions) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // In a real app, you would make the actual API call here
        // await apiCall(action.type, action.resource, action.data)
        
        completedActions++
        setSyncProgress((completedActions / totalActions) * 100)
      } catch (error) {
        console.error('Failed to sync action:', action, error)
        
        // Retry logic
        if (action.retries < action.maxRetries) {
          const updatedAction = { ...action, retries: action.retries + 1 }
          const updatedActions = pendingActions.map(a => 
            a.id === action.id ? updatedAction : a
          )
          savePendingActions(updatedActions)
        } else {
          // Remove failed action after max retries
          const updatedActions = pendingActions.filter(a => a.id !== action.id)
          savePendingActions(updatedActions)
        }
      }
    }

    // Clear successfully synced actions
    const remainingActions = pendingActions.filter(action => action.retries < action.maxRetries)
    savePendingActions(remainingActions)
    
    setIsReconnecting(false)
    setLastSync(new Date())
  }, [pendingActions, savePendingActions])

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pendingActions.length > 0) {
      syncActions()
    }
  }, [isOnline, pendingActions.length, syncActions])

  return (
    <div className={className}>
      {children}
      
      {/* Offline Indicator */}
      <OfflineIndicator
        isOnline={isOnline}
        isReconnecting={isReconnecting}
        pendingCount={pendingActions.length}
        syncProgress={syncProgress}
        lastSync={lastSync}
        onSync={syncActions}
      />
    </div>
  )
}

// Offline indicator component
interface OfflineIndicatorProps {
  isOnline: boolean
  isReconnecting: boolean
  pendingCount: number
  syncProgress: number
  lastSync: Date | null
  onSync: () => void
}

function OfflineIndicator({
  isOnline,
  isReconnecting,
  pendingCount,
  syncProgress,
  lastSync,
  onSync
}: OfflineIndicatorProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (isOnline && pendingCount === 0) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto"
      >
        <Card className={cn(
          'shadow-lg border-0',
          isOnline ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        )}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center',
                isOnline ? 'bg-blue-100 dark:bg-blue-900' : 'bg-red-100 dark:bg-red-900'
              )}>
                {isOnline ? (
                  isReconnecting ? (
                    <Sync className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
                  ) : (
                    <Wifi className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  )
                ) : (
                  <WifiOff className="w-4 h-4 text-red-600 dark:text-red-400" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className={cn(
                    'font-medium text-sm',
                    isOnline ? 'text-blue-900 dark:text-blue-100' : 'text-red-900 dark:text-red-100'
                  )}>
                    {isOnline ? 'Syncing...' : 'You\'re offline'}
                  </h4>
                  
                  {pendingCount > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {pendingCount} pending
                    </Badge>
                  )}
                </div>

                <p className={cn(
                  'text-xs',
                  isOnline ? 'text-blue-700 dark:text-blue-300' : 'text-red-700 dark:text-red-300'
                )}>
                  {isOnline 
                    ? isReconnecting 
                      ? 'Syncing your changes...' 
                      : 'All changes synced'
                    : 'Your changes will sync when you\'re back online'
                  }
                </p>

                {isReconnecting && (
                  <div className="mt-2">
                    <Progress value={syncProgress} className="h-1" />
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {Math.round(syncProgress)}% complete
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {isOnline && pendingCount > 0 && !isReconnecting && (
                  <Button
                    onClick={onSync}
                    size="sm"
                    variant="outline"
                    className="h-8 px-3"
                  >
                    <Sync className="w-3 h-3 mr-1" />
                    Sync
                  </Button>
                )}
                
                <Button
                  onClick={() => setIsExpanded(!isExpanded)}
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                >
                  {isExpanded ? (
                    <X className="w-4 h-4" />
                  ) : (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Connection Status</span>
                    <Badge variant={isOnline ? 'default' : 'destructive'} className="text-xs">
                      {isOnline ? 'Online' : 'Offline'}
                    </Badge>
                  </div>
                  
                  {lastSync && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">Last Sync</span>
                      <span className="text-gray-900 dark:text-white">
                        {lastSync.toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                  
                  {pendingCount > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">Pending Actions</span>
                      <span className="text-gray-900 dark:text-white">{pendingCount}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}

// Offline queue hook
export function useOfflineQueue() {
  const [actions, setActions] = useState<OfflineAction[]>([])

  const addAction = useCallback((action: Omit<OfflineAction, 'id' | 'timestamp' | 'retries'>) => {
    const newAction: OfflineAction = {
      ...action,
      id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      retries: 0,
      maxRetries: 3
    }

    setActions(prev => [...prev, newAction])
    
    // Save to localStorage
    const updatedActions = [...actions, newAction]
    localStorage.setItem('offline-actions', JSON.stringify(updatedActions))
  }, [actions])

  const removeAction = useCallback((actionId: string) => {
    setActions(prev => prev.filter(action => action.id !== actionId))
    
    // Update localStorage
    const updatedActions = actions.filter(action => action.id !== actionId)
    localStorage.setItem('offline-actions', JSON.stringify(updatedActions))
  }, [actions])

  const clearActions = useCallback(() => {
    setActions([])
    localStorage.removeItem('offline-actions')
  }, [])

  return {
    actions,
    addAction,
    removeAction,
    clearActions
  }
}

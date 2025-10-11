'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Activity, 
  Zap, 
  Clock, 
  Database, 
  Wifi, 
  WifiOff,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { cn } from '@/lib/utils/cn'

interface PerformanceMetrics {
  // Core Web Vitals
  lcp: number | null // Largest Contentful Paint
  fid: number | null // First Input Delay
  cls: number | null // Cumulative Layout Shift
  fcp: number | null // First Contentful Paint
  ttfb: number | null // Time to First Byte
  
  // Additional metrics
  memoryUsage: number | null
  connectionSpeed: string
  isOnline: boolean
  bundleSize: number
  renderTime: number
}

interface PerformanceMonitorProps {
  className?: string
  showDetails?: boolean
}

export function PerformanceMonitor({ className, showDetails = false }: PerformanceMonitorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null,
    memoryUsage: null,
    connectionSpeed: 'unknown',
    isOnline: true,
    bundleSize: 0,
    renderTime: 0
  })
  const [alerts, setAlerts] = useState<string[]>([])
  const observerRef = useRef<PerformanceObserver | null>(null)

  useEffect(() => {
    // Initialize performance monitoring
    initializePerformanceMonitoring()
    
    // Monitor connection speed
    monitorConnectionSpeed()
    
    // Monitor memory usage
    monitorMemoryUsage()
    
    // Monitor online status
    monitorOnlineStatus()

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  const initializePerformanceMonitoring = () => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return

    try {
      // Observe Core Web Vitals
      observerRef.current = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          switch (entry.entryType) {
            case 'largest-contentful-paint':
              setMetrics(prev => ({ ...prev, lcp: entry.startTime }))
              break
            case 'first-input':
              setMetrics(prev => ({ ...prev, fid: (entry as any).processingStart - entry.startTime }))
              break
            case 'layout-shift':
              if (!(entry as any).hadRecentInput) {
                setMetrics(prev => ({ ...prev, cls: (prev.cls || 0) + (entry as any).value }))
              }
              break
            case 'paint':
              if (entry.name === 'first-contentful-paint') {
                setMetrics(prev => ({ ...prev, fcp: entry.startTime }))
              }
              break
            case 'navigation':
              setMetrics(prev => ({ ...prev, ttfb: (entry as any).responseStart - (entry as any).requestStart }))
              break
          }
        }
      })

      // Observe different entry types
      observerRef.current.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift', 'paint', 'navigation'] })
    } catch (error) {
      console.error('Performance monitoring initialization failed:', error)
    }
  }

  const monitorConnectionSpeed = () => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      const speed = connection.effectiveType || 'unknown'
      setMetrics(prev => ({ ...prev, connectionSpeed: speed }))
    }
  }

  const monitorMemoryUsage = () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      const usage = memory.usedJSHeapSize / memory.jsHeapSizeLimit
      setMetrics(prev => ({ ...prev, memoryUsage: usage }))
    }
  }

  const monitorOnlineStatus = () => {
    const updateOnlineStatus = () => {
      setMetrics(prev => ({ ...prev, isOnline: navigator.onLine }))
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    updateOnlineStatus()

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }

  // Analyze metrics and generate alerts
  useEffect(() => {
    const newAlerts: string[] = []

    if (metrics.lcp && metrics.lcp > 2500) {
      newAlerts.push('LCP is slow (>2.5s)')
    }
    if (metrics.fid && metrics.fid > 100) {
      newAlerts.push('FID is slow (>100ms)')
    }
    if (metrics.cls && metrics.cls > 0.1) {
      newAlerts.push('CLS is poor (>0.1)')
    }
    if (metrics.memoryUsage && metrics.memoryUsage > 0.8) {
      newAlerts.push('High memory usage')
    }
    if (!metrics.isOnline) {
      newAlerts.push('Offline mode')
    }

    setAlerts(newAlerts)
  }, [metrics])

  const getPerformanceScore = () => {
    let score = 100
    
    if (metrics.lcp && metrics.lcp > 2500) score -= 20
    if (metrics.fid && metrics.fid > 100) score -= 20
    if (metrics.cls && metrics.cls > 0.1) score -= 20
    if (metrics.memoryUsage && metrics.memoryUsage > 0.8) score -= 20
    if (!metrics.isOnline) score -= 20
    
    return Math.max(0, score)
  }

  const formatMetric = (value: number | null, unit: string, threshold?: number) => {
    if (value === null) return 'N/A'
    
    const formatted = `${value.toFixed(2)}${unit}`
    const isGood = threshold ? value <= threshold : true
    
    return (
      <span className={cn(
        isGood ? 'text-green-600' : 'text-red-600'
      )}>
        {formatted}
      </span>
    )
  }

  const performanceScore = getPerformanceScore()

  return (
    <div className={cn('fixed bottom-4 right-4 z-50', className)}>
      {/* Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-12 h-12 rounded-full shadow-lg",
          alerts.length > 0 ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
        )}
        aria-label="Open performance monitor"
      >
        <Activity className="w-5 h-5" />
        {alerts.length > 0 && (
          <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 text-xs">
            {alerts.length}
          </Badge>
        )}
      </Button>

      {/* Performance Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-80"
          >
            <Card className="shadow-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    <CardTitle className="text-lg">Performance</CardTitle>
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
                  Real-time performance metrics
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Performance Score */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Performance Score</span>
                    <Badge variant={performanceScore >= 80 ? "default" : performanceScore >= 60 ? "secondary" : "destructive"}>
                      {performanceScore}/100
                    </Badge>
                  </div>
                  <Progress value={performanceScore} className="h-2" />
                </div>

                {/* Core Web Vitals */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Core Web Vitals</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>LCP:</span>
                      {formatMetric(metrics.lcp, 'ms', 2500)}
                    </div>
                    <div className="flex justify-between">
                      <span>FID:</span>
                      {formatMetric(metrics.fid, 'ms', 100)}
                    </div>
                    <div className="flex justify-between">
                      <span>CLS:</span>
                      {formatMetric(metrics.cls, '', 0.1)}
                    </div>
                    <div className="flex justify-between">
                      <span>FCP:</span>
                      {formatMetric(metrics.fcp, 'ms', 1800)}
                    </div>
                  </div>
                </div>

                {/* System Status */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">System Status</h4>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      {metrics.isOnline ? (
                        <Wifi className="w-4 h-4 text-green-600" />
                      ) : (
                        <WifiOff className="w-4 h-4 text-red-600" />
                      )}
                      <span>Connection</span>
                    </div>
                    <Badge variant={metrics.isOnline ? "default" : "destructive"}>
                      {metrics.connectionSpeed}
                    </Badge>
                  </div>
                  
                  {metrics.memoryUsage && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Database className="w-4 h-4 text-blue-600" />
                        <span>Memory</span>
                      </div>
                      <span className={cn(
                        metrics.memoryUsage > 0.8 ? 'text-red-600' : 'text-green-600'
                      )}>
                        {(metrics.memoryUsage * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Alerts */}
                {alerts.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-red-600">Alerts</h4>
                    <div className="space-y-1">
                      {alerts.map((alert, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm text-red-600">
                          <AlertTriangle className="w-4 h-4" />
                          <span>{alert}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Details Toggle */}
                {showDetails && (
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <Button variant="outline" size="sm" className="w-full">
                      View Detailed Report
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

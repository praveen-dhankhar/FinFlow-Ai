'use client'

import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils/cn'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  fill?: boolean
  sizes?: string
  style?: React.CSSProperties
  onLoad?: () => void
  onError?: () => void
  fallback?: React.ReactNode
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  fill = false,
  sizes,
  style,
  onLoad,
  onError,
  fallback
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!imgRef.current || priority) {
      setIsInView(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    )

    observer.observe(imgRef.current)

    return () => observer.disconnect()
  }, [priority])

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }

  if (hasError && fallback) {
    return <>{fallback}</>
  }

  return (
    <div ref={imgRef} className={cn('relative overflow-hidden', className)} style={style}>
      {isInView && (
        <>
          <Image
            src={src}
            alt={alt}
            width={fill ? undefined : width}
            height={fill ? undefined : height}
            fill={fill}
            priority={priority}
            quality={quality}
            placeholder={placeholder}
            blurDataURL={blurDataURL}
            sizes={sizes}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              'transition-opacity duration-300',
              isLoading ? 'opacity-0' : 'opacity-100'
            )}
          />
          
          {isLoading && (
            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// Avatar component with optimization
interface OptimizedAvatarProps {
  src?: string
  alt: string
  size?: number
  className?: string
  fallback?: React.ReactNode
}

export function OptimizedAvatar({
  src,
  alt,
  size = 40,
  className,
  fallback
}: OptimizedAvatarProps) {
  const [hasError, setHasError] = useState(false)

  if (!src || hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400',
          className
        )}
        style={{ width: size, height: size }}
      >
        {fallback || alt[0]?.toUpperCase()}
      </div>
    )
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn('rounded-full', className)}
      fallback={
        <div
          className={cn(
            'flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400',
            className
          )}
          style={{ width: size, height: size }}
        >
          {alt[0]?.toUpperCase()}
        </div>
      }
      onError={() => setHasError(true)}
    />
  )
}

// Chart image optimization
interface OptimizedChartProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
}

export function OptimizedChart({
  src,
  alt,
  width = 800,
  height = 400,
  className
}: OptimizedChartProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      quality={90}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
    />
  )
}

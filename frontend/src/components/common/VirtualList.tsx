'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { FixedSizeList as List } from 'react-window'
import { cn } from '@/lib/utils/cn'

interface VirtualListProps<T> {
  items: T[]
  height: number
  itemHeight: number
  renderItem: (props: { index: number; style: React.CSSProperties; item: T }) => React.ReactNode
  className?: string
  overscanCount?: number
  onScroll?: (scrollOffset: number) => void
}

export function VirtualList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  className,
  overscanCount = 5,
  onScroll
}: VirtualListProps<T>) {
  const listRef = useRef<List>(null)

  const handleScroll = (scrollOffset: number) => {
    onScroll?.(scrollOffset)
  }

  return (
    <div className={cn('w-full', className)}>
      <List
        ref={listRef}
        height={height}
        itemCount={items.length}
        itemSize={itemHeight}
        overscanCount={overscanCount}
        onScroll={({ scrollOffset }) => handleScroll(scrollOffset)}
      >
        {({ index, style }) => renderItem({ index, style, item: items[index] })}
      </List>
    </div>
  )
}

// Hook for virtual scrolling with dynamic item heights
export function useVirtualScroll<T>({
  items,
  containerHeight,
  estimatedItemHeight = 50,
  overscan = 5
}: {
  items: T[]
  containerHeight: number
  estimatedItemHeight?: number
  overscan?: number
}) {
  const [scrollTop, setScrollTop] = useState(0)
  const [itemHeights, setItemHeights] = useState<number[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate visible range
  const visibleRange = useMemo(() => {
    let start = 0
    let end = items.length
    let currentTop = 0

    for (let i = 0; i < items.length; i++) {
      const itemHeight = itemHeights[i] || estimatedItemHeight
      
      if (currentTop + itemHeight > scrollTop) {
        start = Math.max(0, i - overscan)
        break
      }
      currentTop += itemHeight
    }

    currentTop = 0
    for (let i = 0; i < items.length; i++) {
      const itemHeight = itemHeights[i] || estimatedItemHeight
      currentTop += itemHeight
      
      if (currentTop > scrollTop + containerHeight) {
        end = Math.min(items.length, i + overscan)
        break
      }
    }

    return { start, end }
  }, [items.length, scrollTop, containerHeight, itemHeights, estimatedItemHeight, overscan])

  // Update item height
  const updateItemHeight = (index: number, height: number) => {
    setItemHeights(prev => {
      const newHeights = [...prev]
      newHeights[index] = height
      return newHeights
    })
  }

  // Get total height
  const totalHeight = useMemo(() => {
    return items.reduce((total, _, index) => {
      return total + (itemHeights[index] || estimatedItemHeight)
    }, 0)
  }, [items.length, itemHeights, estimatedItemHeight])

  // Get offset for visible items
  const getOffset = (index: number) => {
    let offset = 0
    for (let i = 0; i < index; i++) {
      offset += itemHeights[i] || estimatedItemHeight
    }
    return offset
  }

  return {
    containerRef,
    visibleRange,
    totalHeight,
    updateItemHeight,
    getOffset,
    setScrollTop
  }
}

// Virtual table component for large datasets
interface VirtualTableProps<T> {
  data: T[]
  columns: Array<{
    key: string
    title: string
    width: number
    render?: (value: any, item: T) => React.ReactNode
  }>
  height: number
  rowHeight?: number
  className?: string
}

export function VirtualTable<T>({
  data,
  columns,
  height,
  rowHeight = 50,
  className
}: VirtualTableProps<T>) {
  const renderRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = data[index]
    
    return (
      <div
        style={style}
        className="flex items-center border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
      >
        {columns.map((column, colIndex) => (
          <div
            key={column.key}
            style={{ width: column.width }}
            className="px-4 py-2 truncate"
          >
            {column.render ? column.render((item as any)[column.key], item) : (item as any)[column.key]}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Header */}
      <div className="flex items-center bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        {columns.map((column) => (
          <div
            key={column.key}
            style={{ width: column.width }}
            className="px-4 py-3 font-medium text-gray-900 dark:text-white"
          >
            {column.title}
          </div>
        ))}
      </div>
      
      {/* Virtual rows */}
      <List
        height={height - 50} // Subtract header height
        itemCount={data.length}
        itemSize={rowHeight}
        overscanCount={5}
      >
        {renderRow}
      </List>
    </div>
  )
}

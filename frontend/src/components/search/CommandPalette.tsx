'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Command, 
  ArrowRight, 
  Clock, 
  TrendingUp, 
  Target, 
  CreditCard,
  Plus,
  BarChart3,
  Settings,
  User,
  Home,
  FileText,
  Calculator,
  Filter,
  Download,
  Upload,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useSearch } from '@/hooks/useSearch'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

interface SearchResult {
  id: string
  title: string
  description: string
  category: 'navigation' | 'action' | 'transaction' | 'category' | 'goal' | 'budget' | 'report'
  icon: React.ComponentType<{ className?: string }>
  action: () => void
  keywords: string[]
  shortcut?: string
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  const { data: searchResults = [], isLoading } = useSearch(query)

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
      setQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, searchResults.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (searchResults[selectedIndex]) {
          searchResults[selectedIndex].action()
          onClose()
        }
        break
      case 'Escape':
        e.preventDefault()
        onClose()
        break
    }
  }, [isOpen, searchResults, selectedIndex, onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current && selectedIndex >= 0) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'navigation': return Home
      case 'action': return Plus
      case 'transaction': return CreditCard
      case 'category': return Target
      case 'goal': return Target
      case 'budget': return Calculator
      case 'report': return BarChart3
      default: return Search
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'navigation': return 'text-blue-600'
      case 'action': return 'text-green-600'
      case 'transaction': return 'text-purple-600'
      case 'category': return 'text-orange-600'
      case 'goal': return 'text-pink-600'
      case 'budget': return 'text-cyan-600'
      case 'report': return 'text-indigo-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Command Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl mx-4 z-50"
          >
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Header */}
              <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <Search className="w-5 h-5 text-gray-400 mr-3" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search commands, transactions, categories..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-lg placeholder-gray-400"
                />
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                    ↑↓
                  </kbd>
                  <span>navigate</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                    ↵
                  </kbd>
                  <span>select</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                    esc
                  </kbd>
                  <span>close</span>
                </div>
              </div>

              {/* Results */}
              <div className="max-h-96 overflow-y-auto" ref={resultsRef}>
                {isLoading ? (
                  <div className="px-4 py-8 text-center text-gray-500">
                    <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full mx-auto mb-2"></div>
                    Searching...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500">
                    <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>No results found</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Try searching for transactions, categories, or commands
                    </p>
                  </div>
                ) : (
                  <div className="py-2">
                    {searchResults.map((result, index) => {
                      const Icon = result.icon || getCategoryIcon(result.category)
                      const isSelected = index === selectedIndex
                      
                      return (
                        <motion.div
                          key={result.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={cn(
                            "flex items-center px-4 py-3 cursor-pointer transition-colors",
                            isSelected 
                              ? "bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-600" 
                              : "hover:bg-gray-50 dark:hover:bg-gray-800"
                          )}
                          onClick={() => {
                            result.action()
                            onClose()
                          }}
                        >
                          <Icon className={cn(
                            "w-5 h-5 mr-3 flex-shrink-0",
                            getCategoryColor(result.category)
                          )} />
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center">
                              <p className="font-medium text-gray-900 dark:text-white truncate">
                                {result.title}
                              </p>
                              {result.shortcut && (
                                <kbd className="ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-500">
                                  {result.shortcut}
                                </kbd>
                              )}
                            </div>
                            {result.description && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {result.description}
                              </p>
                            )}
                          </div>

                          <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span>Press</span>
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-700 rounded text-xs">⌘K</kbd>
                    <span>to open command palette</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>{searchResults.length} result{searchResults.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

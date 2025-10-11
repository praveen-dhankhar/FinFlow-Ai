'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Keyboard, 
  X, 
  Search, 
  Home, 
  CreditCard, 
  Target, 
  Calculator, 
  BarChart3, 
  TrendingUp, 
  Settings, 
  User,
  Plus,
  Download,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog'
import { Badge } from '@/components/ui/Badge'
import { Separator } from '@/components/ui/Separator'

interface KeyboardShortcutsHelpProps {
  trigger?: React.ReactNode
}

export function KeyboardShortcutsHelp({ trigger }: KeyboardShortcutsHelpProps) {
  const [isOpen, setIsOpen] = useState(false)

  const shortcuts = [
    {
      category: 'Search',
      icon: Search,
      shortcuts: [
        { keys: ['⌘', 'K'], description: 'Open command palette', action: 'search' },
        { keys: ['⌘', '⇧', 'K'], description: 'Open command palette (alternative)', action: 'search' },
        { keys: ['Esc'], description: 'Close command palette', action: 'search' }
      ]
    },
    {
      category: 'Navigation',
      icon: Home,
      shortcuts: [
        { keys: ['⌘', 'H'], description: 'Go to Dashboard', action: 'navigate' },
        { keys: ['⌘', 'T'], description: 'Go to Transactions', action: 'navigate' },
        { keys: ['⌘', 'C'], description: 'Go to Categories', action: 'navigate' },
        { keys: ['⌘', 'G'], description: 'Go to Goals', action: 'navigate' },
        { keys: ['⌘', 'B'], description: 'Go to Budgets', action: 'navigate' },
        { keys: ['⌘', 'A'], description: 'Go to Analytics', action: 'navigate' },
        { keys: ['⌘', 'F'], description: 'Go to Forecasts', action: 'navigate' },
        { keys: ['⌘', 'S'], description: 'Go to Settings', action: 'navigate' },
        { keys: ['⌘', 'P'], description: 'Go to Profile', action: 'navigate' }
      ]
    },
    {
      category: 'Quick Actions',
      icon: Plus,
      shortcuts: [
        { keys: ['⌘', 'N'], description: 'Add new transaction', action: 'action' },
        { keys: ['⌘', '⇧', 'N'], description: 'Add new category', action: 'action' },
        { keys: ['⌘', 'R'], description: 'Generate report', action: 'action' },
        { keys: ['⌘', 'E'], description: 'Export data', action: 'action' }
      ]
    },
    {
      category: 'Data Views',
      icon: BarChart3,
      shortcuts: [
        { keys: ['⌘', 'D'], description: 'View dashboard summary', action: 'data' },
        { keys: ['⌘', 'L'], description: 'View transaction list', action: 'data' },
        { keys: ['⌘', 'I'], description: 'View insights', action: 'data' }
      ]
    }
  ]

  const getActionColor = (action: string) => {
    switch (action) {
      case 'search': return 'text-blue-600'
      case 'navigate': return 'text-green-600'
      case 'action': return 'text-purple-600'
      case 'data': return 'text-orange-600'
      default: return 'text-gray-600'
    }
  }

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <Keyboard className="w-4 h-4 mr-2" />
      Shortcuts
    </Button>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Keyboard className="w-5 h-5 mr-2" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Master your workflow with these keyboard shortcuts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {shortcuts.map((category, categoryIndex) => {
            const Icon = category.icon
            
            return (
              <div key={categoryIndex} className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Icon className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold">{category.category}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {category.shortcuts.map((shortcut, shortcutIndex) => (
                    <motion.div
                      key={shortcutIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (categoryIndex * 0.1) + (shortcutIndex * 0.05) }}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {shortcut.description}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <div key={keyIndex} className="flex items-center space-x-1">
                            <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded border">
                              {key}
                            </kbd>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="text-gray-400 text-xs">+</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Command Palette
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Use <kbd className="px-1 py-0.5 text-xs bg-blue-200 dark:bg-blue-800 rounded">⌘K</kbd> to quickly search and navigate to any page or action.
              </p>
            </div>
            
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                Quick Navigation
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                Press <kbd className="px-1 py-0.5 text-xs bg-green-200 dark:bg-green-800 rounded">⌘</kbd> + any letter to jump to different sections.
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                Quick Actions
              </h4>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Use <kbd className="px-1 py-0.5 text-xs bg-purple-200 dark:bg-purple-800 rounded">⌘N</kbd> to quickly add new transactions or categories.
              </p>
            </div>
            
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-2">
                Data Views
              </h4>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Press <kbd className="px-1 py-0.5 text-xs bg-orange-200 dark:bg-orange-800 rounded">⌘D</kbd> to view dashboard summary or <kbd className="px-1 py-0.5 text-xs bg-orange-200 dark:bg-orange-800 rounded">⌘L</kbd> for transaction list.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => setIsOpen(false)}>
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

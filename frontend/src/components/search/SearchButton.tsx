'use client'

import { Search, Command } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useSearchContext } from './SearchProvider'
import { cn } from '@/lib/utils/cn'

interface SearchButtonProps {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  showShortcut?: boolean
  className?: string
}

export function SearchButton({ 
  variant = 'outline', 
  size = 'md',
  showShortcut = true,
  className 
}: SearchButtonProps) {
  const { openSearch } = useSearchContext()

  return (
    <Button
      variant={variant}
      size={size}
      onClick={openSearch}
      className={cn(
        "relative group",
        className
      )}
    >
      <Search className="w-4 h-4 mr-2" />
      <span>Search</span>
      {showShortcut && (
        <div className="ml-2 flex items-center space-x-1">
          <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 rounded">
            ⌘
          </kbd>
          <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 rounded">
            K
          </kbd>
        </div>
      )}
    </Button>
  )
}

export function SearchTrigger({ className }: { className?: string }) {
  const { openSearch } = useSearchContext()

  return (
    <button
      onClick={openSearch}
      className={cn(
        "flex items-center space-x-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors",
        className
      )}
    >
      <Search className="w-4 h-4" />
      <span>Search...</span>
      <div className="ml-auto flex items-center space-x-1">
        <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 rounded">
          ⌘K
        </kbd>
      </div>
    </button>
  )
}

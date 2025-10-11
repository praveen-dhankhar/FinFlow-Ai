'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SearchProvider } from './SearchProvider'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useSearchContext } from './SearchProvider'

interface GlobalSearchProviderProps {
  children: React.ReactNode
}

function SearchKeyboardHandler() {
  const { isOpen, openSearch, closeSearch } = useSearchContext()
  const router = useRouter()

  useKeyboardShortcuts({
    onOpenCommandPalette: openSearch,
    onCloseCommandPalette: closeSearch,
    isCommandPaletteOpen: isOpen
  })

  return null
}

export function GlobalSearchProvider({ children }: GlobalSearchProviderProps) {
  return (
    <SearchProvider>
      <SearchKeyboardHandler />
      {children}
    </SearchProvider>
  )
}

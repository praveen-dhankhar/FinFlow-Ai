'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { CommandPalette } from './CommandPalette'

interface SearchContextType {
  isOpen: boolean
  openSearch: () => void
  closeSearch: () => void
  toggleSearch: () => void
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

interface SearchProviderProps {
  children: ReactNode
}

export function SearchProvider({ children }: SearchProviderProps) {
  const [isOpen, setIsOpen] = useState(false)

  const openSearch = () => setIsOpen(true)
  const closeSearch = () => setIsOpen(false)
  const toggleSearch = () => setIsOpen(prev => !prev)

  return (
    <SearchContext.Provider value={{
      isOpen,
      openSearch,
      closeSearch,
      toggleSearch
    }}>
      {children}
      <CommandPalette isOpen={isOpen} onClose={closeSearch} />
    </SearchContext.Provider>
  )
}

export const useSearchContext = () => {
  const context = useContext(SearchContext)
  if (context === undefined) {
    throw new Error('useSearchContext must be used within a SearchProvider')
  }
  return context
}

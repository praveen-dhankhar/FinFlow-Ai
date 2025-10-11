'use client'

import { SearchTrigger, KeyboardShortcutsHelp } from '@/components/search'
import { useSearchContext } from '@/components/search/SearchProvider'

export function SearchIntegration() {
  const { openSearch } = useSearchContext()

  return (
    <div className="flex items-center space-x-2">
      <SearchTrigger />
      <KeyboardShortcutsHelp />
    </div>
  )
}

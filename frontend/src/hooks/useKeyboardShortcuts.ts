import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  action: () => void
  description: string
  category: 'navigation' | 'action' | 'search' | 'data'
}

interface UseKeyboardShortcutsProps {
  onOpenCommandPalette?: () => void
  onCloseCommandPalette?: () => void
  isCommandPaletteOpen?: boolean
}

export const useKeyboardShortcuts = ({
  onOpenCommandPalette,
  onCloseCommandPalette,
  isCommandPaletteOpen = false
}: UseKeyboardShortcutsProps = {}) => {
  const router = useRouter()

  const shortcuts: KeyboardShortcut[] = [
    // Command Palette
    {
      key: 'k',
      metaKey: true,
      action: () => {
        if (isCommandPaletteOpen) {
          onCloseCommandPalette?.()
        } else {
          onOpenCommandPalette?.()
        }
      },
      description: 'Open command palette',
      category: 'search'
    },
    {
      key: 'k',
      ctrlKey: true,
      action: () => {
        if (isCommandPaletteOpen) {
          onCloseCommandPalette?.()
        } else {
          onOpenCommandPalette?.()
        }
      },
      description: 'Open command palette',
      category: 'search'
    },

    // Navigation
    {
      key: 'h',
      metaKey: true,
      action: () => router.push('/dashboard'),
      description: 'Go to dashboard',
      category: 'navigation'
    },
    {
      key: 't',
      metaKey: true,
      action: () => router.push('/transactions'),
      description: 'Go to transactions',
      category: 'navigation'
    },
    {
      key: 'c',
      metaKey: true,
      action: () => router.push('/categories'),
      description: 'Go to categories',
      category: 'navigation'
    },
    {
      key: 'g',
      metaKey: true,
      action: () => router.push('/goals'),
      description: 'Go to goals',
      category: 'navigation'
    },
    {
      key: 'b',
      metaKey: true,
      action: () => router.push('/budgets'),
      description: 'Go to budgets',
      category: 'navigation'
    },
    {
      key: 'a',
      metaKey: true,
      action: () => router.push('/analytics'),
      description: 'Go to analytics',
      category: 'navigation'
    },
    {
      key: 'f',
      metaKey: true,
      action: () => router.push('/forecasts'),
      description: 'Go to forecasts',
      category: 'navigation'
    },
    {
      key: 's',
      metaKey: true,
      action: () => router.push('/settings'),
      description: 'Go to settings',
      category: 'navigation'
    },
    {
      key: 'p',
      metaKey: true,
      action: () => router.push('/profile'),
      description: 'Go to profile',
      category: 'navigation'
    },

    // Quick Actions
    {
      key: 'n',
      metaKey: true,
      action: () => router.push('/transactions?action=add'),
      description: 'Add new transaction',
      category: 'action'
    },
    {
      key: 'n',
      metaKey: true,
      shiftKey: true,
      action: () => router.push('/categories?action=add'),
      description: 'Add new category',
      category: 'action'
    },
    {
      key: 'r',
      metaKey: true,
      action: () => router.push('/analytics?action=report'),
      description: 'Generate report',
      category: 'action'
    },
    {
      key: 'e',
      metaKey: true,
      action: () => router.push('/transactions?action=export'),
      description: 'Export data',
      category: 'action'
    },

    // Data Operations
    {
      key: 'd',
      metaKey: true,
      action: () => router.push('/dashboard?view=summary'),
      description: 'View dashboard summary',
      category: 'data'
    },
    {
      key: 'l',
      metaKey: true,
      action: () => router.push('/transactions?view=list'),
      description: 'View transaction list',
      category: 'data'
    },
    {
      key: 'i',
      metaKey: true,
      action: () => router.push('/analytics?view=insights'),
      description: 'View insights',
      category: 'data'
    },

    // Escape key
    {
      key: 'Escape',
      action: () => {
        if (isCommandPaletteOpen) {
          onCloseCommandPalette?.()
        }
      },
      description: 'Close command palette',
      category: 'search'
    }
  ]

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement ||
      (event.target as HTMLElement)?.contentEditable === 'true'
    ) {
      return
    }

    const pressedShortcut = shortcuts.find(shortcut => {
      return (
        shortcut.key.toLowerCase() === event.key.toLowerCase() &&
        !!shortcut.ctrlKey === event.ctrlKey &&
        !!shortcut.metaKey === event.metaKey &&
        !!shortcut.shiftKey === event.shiftKey &&
        !!shortcut.altKey === event.altKey
      )
    })

    if (pressedShortcut) {
      event.preventDefault()
      pressedShortcut.action()
    }
  }, [shortcuts, isCommandPaletteOpen, onOpenCommandPalette, onCloseCommandPalette])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return {
    shortcuts,
    getShortcutsByCategory: (category: string) => 
      shortcuts.filter(shortcut => shortcut.category === category),
    getShortcutDescription: (key: string, modifiers?: string[]) => {
      const shortcut = shortcuts.find(s => 
        s.key === key && 
        (!modifiers || modifiers.every(mod => 
          (mod === 'ctrl' && s.ctrlKey) ||
          (mod === 'meta' && s.metaKey) ||
          (mod === 'shift' && s.shiftKey) ||
          (mod === 'alt' && s.altKey)
        ))
      )
      return shortcut?.description
    }
  }
}

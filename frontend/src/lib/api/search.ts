import { apiClient } from './client'

// Search Types
export interface SearchResult {
  id: string
  title: string
  description: string
  category: 'navigation' | 'action' | 'transaction' | 'category' | 'goal' | 'budget' | 'report'
  icon?: string
  url?: string
  keywords: string[]
  shortcut?: string
  metadata?: Record<string, any>
}

export interface SearchFilters {
  categories?: string[]
  types?: string[]
  dateRange?: {
    start: string
    end: string
  }
  amountRange?: {
    min: number
    max: number
  }
}

export interface SearchResponse {
  results: SearchResult[]
  total: number
  suggestions: string[]
  recentSearches: string[]
}

export interface QuickAction {
  id: string
  title: string
  description: string
  icon: string
  action: string
  shortcut?: string
  category: 'navigation' | 'action' | 'report'
}

// Search Service
export class SearchService {
  static async search(query: string, filters?: SearchFilters): Promise<SearchResponse> {
    const response = await apiClient.get('/api/search', {
      params: {
        q: query,
        ...filters
      }
    })
    return response.data
  }

  static async getQuickActions(): Promise<QuickAction[]> {
    const response = await apiClient.get('/api/search/quick-actions')
    return response.data
  }

  static async getRecentSearches(): Promise<string[]> {
    const response = await apiClient.get('/api/search/recent')
    return response.data
  }

  static async saveSearch(query: string): Promise<void> {
    await apiClient.post('/api/search/recent', { query })
  }

  static async clearRecentSearches(): Promise<void> {
    await apiClient.delete('/api/search/recent')
  }

  static async getSuggestions(query: string): Promise<string[]> {
    const response = await apiClient.get('/api/search/suggestions', {
      params: { q: query }
    })
    return response.data
  }

  static async getPopularSearches(): Promise<string[]> {
    const response = await apiClient.get('/api/search/popular')
    return response.data
  }

  static async searchTransactions(query: string, filters?: SearchFilters): Promise<SearchResult[]> {
    const response = await apiClient.get('/api/search/transactions', {
      params: {
        q: query,
        ...filters
      }
    })
    return response.data
  }

  static async searchCategories(query: string): Promise<SearchResult[]> {
    const response = await apiClient.get('/api/search/categories', {
      params: { q: query }
    })
    return response.data
  }

  static async searchGoals(query: string): Promise<SearchResult[]> {
    const response = await apiClient.get('/api/search/goals', {
      params: { q: query }
    })
    return response.data
  }

  static async searchBudgets(query: string): Promise<SearchResult[]> {
    const response = await apiClient.get('/api/search/budgets', {
      params: { q: query }
    })
    return response.data
  }

  static async searchReports(query: string): Promise<SearchResult[]> {
    const response = await apiClient.get('/api/search/reports', {
      params: { q: query }
    })
    return response.data
  }
}

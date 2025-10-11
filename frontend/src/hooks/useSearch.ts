import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { SearchService } from '@/lib/api/search'
import type { SearchFilters, SearchResult, QuickAction } from '@/lib/api/search'

// Main search hook
export const useSearch = (query: string, filters?: SearchFilters) => {
  return useQuery({
    queryKey: ['search', query, filters],
    queryFn: () => SearchService.search(query, filters),
    enabled: query.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data) => data.results
  })
}

// Quick actions hook
export const useQuickActions = () => {
  return useQuery({
    queryKey: ['search', 'quick-actions'],
    queryFn: SearchService.getQuickActions,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Recent searches hook
export const useRecentSearches = () => {
  return useQuery({
    queryKey: ['search', 'recent'],
    queryFn: SearchService.getRecentSearches,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Save search mutation
export const useSaveSearch = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: SearchService.saveSearch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search', 'recent'] })
    },
  })
}

// Clear recent searches mutation
export const useClearRecentSearches = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: SearchService.clearRecentSearches,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search', 'recent'] })
    },
  })
}

// Suggestions hook
export const useSearchSuggestions = (query: string) => {
  return useQuery({
    queryKey: ['search', 'suggestions', query],
    queryFn: () => SearchService.getSuggestions(query),
    enabled: query.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Popular searches hook
export const usePopularSearches = () => {
  return useQuery({
    queryKey: ['search', 'popular'],
    queryFn: SearchService.getPopularSearches,
    staleTime: 30 * 60 * 1000, // 30 minutes
  })
}

// Specific search hooks
export const useSearchTransactions = (query: string, filters?: SearchFilters) => {
  return useQuery({
    queryKey: ['search', 'transactions', query, filters],
    queryFn: () => SearchService.searchTransactions(query, filters),
    enabled: query.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useSearchCategories = (query: string) => {
  return useQuery({
    queryKey: ['search', 'categories', query],
    queryFn: () => SearchService.searchCategories(query),
    enabled: query.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useSearchGoals = (query: string) => {
  return useQuery({
    queryKey: ['search', 'goals', query],
    queryFn: () => SearchService.searchGoals(query),
    enabled: query.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useSearchBudgets = (query: string) => {
  return useQuery({
    queryKey: ['search', 'budgets', query],
    queryFn: () => SearchService.searchBudgets(query),
    enabled: query.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useSearchReports = (query: string) => {
  return useQuery({
    queryKey: ['search', 'reports', query],
    queryFn: () => SearchService.searchReports(query),
    enabled: query.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

import { QueryClient, DefaultOptions } from '@tanstack/react-query';
import { ApiError } from '@/types/auth';

// Default query options
const defaultQueryOptions: DefaultOptions = {
  queries: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (except 401 which is handled by axios interceptor)
      if (error && typeof error === 'object' && 'statusCode' in error) {
        const apiError = error as unknown as ApiError;
        if (apiError.statusCode >= 400 && apiError.statusCode < 500 && apiError.statusCode !== 401) {
          return false;
        }
      }
      
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    refetchOnWindowFocus: false, // Disable refetch on window focus
    refetchOnReconnect: true, // Refetch when network reconnects
    refetchOnMount: true, // Refetch when component mounts
  },
  mutations: {
    retry: (failureCount, error) => {
      // Don't retry mutations on 4xx errors
      if (error && typeof error === 'object' && 'statusCode' in error) {
        const apiError = error as unknown as ApiError;
        if (apiError.statusCode >= 400 && apiError.statusCode < 500) {
          return false;
        }
      }
      
      // Retry up to 2 times for mutations
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  },
};

// Global error handler
const globalErrorHandler = (error: unknown) => {
  console.error('React Query Error:', error);
  
  // Handle API errors
  if (error && typeof error === 'object' && 'statusCode' in error) {
    const apiError = error as ApiError;
    
    // Handle specific error codes
    switch (apiError.statusCode) {
      case 401:
        // Unauthorized - handled by axios interceptor
        break;
      case 403:
        console.warn('Access forbidden:', apiError.message);
        break;
      case 404:
        console.warn('Resource not found:', apiError.message);
        break;
      case 429:
        console.warn('Rate limit exceeded:', apiError.message);
        break;
      case 500:
        console.error('Server error:', apiError.message);
        break;
      default:
        console.error('API Error:', apiError.message);
    }
  }
};

// Create query client
export const queryClient = new QueryClient({
  defaultOptions: defaultQueryOptions,
  // Global error handling is now done through error boundaries
  // queryCache: {
  //   onError: globalErrorHandler,
  // },
  // mutationCache: {
  //   onError: globalErrorHandler,
  // },
});

// Query keys factory for consistent key management
export const queryKeys = {
  // Auth queries
  auth: {
    user: ['auth', 'user'] as const,
    profile: ['auth', 'profile'] as const,
  },
  
  // Dashboard queries
  dashboard: {
    data: ['dashboard', 'data'] as const,
    spendingCategories: ['dashboard', 'spending-categories'] as const,
    recentTransactions: ['dashboard', 'recent-transactions'] as const,
    forecast: ['dashboard', 'forecast'] as const,
    refresh: ['dashboard', 'refresh'] as const,
  },
  
  // Financial data queries
  financial: {
    all: ['financial'] as const,
    transactions: ['financial', 'transactions'] as const,
    transaction: (id: string) => ['financial', 'transactions', id] as const,
    categories: ['financial', 'categories'] as const,
    forecasts: ['financial', 'forecasts'] as const,
    forecast: (id: string) => ['financial', 'forecasts', id] as const,
  },
  
  // User queries
  users: {
    all: ['users'] as const,
    user: (id: string) => ['users', id] as const,
  },
  
    // Category queries
    categories: {
      all: ['categories'] as const,
      byId: (id: string) => ['categories', id] as const,
    },
    // Forecast queries
    forecasts: {
      all: ['forecasts'] as const,
      data: (filters?: any) => ['forecasts', 'data', filters] as const,
      scenarios: ['forecasts', 'scenarios'] as const,
      insights: (scenarioId?: string) => ['forecasts', 'insights', scenarioId] as const,
      summary: (scenarioId?: string) => ['forecasts', 'summary', scenarioId] as const,
    },
    // Analytics queries
    analytics: {
      all: ['analytics'] as const,
      spendingTrends: (filters?: any) => ['analytics', 'spending-trends', filters] as const,
      incomeAnalysis: (filters?: any) => ['analytics', 'income-analysis', filters] as const,
      savingsGoals: ['analytics', 'savings-goals'] as const,
      budgetPerformance: (filters?: any) => ['analytics', 'budget-performance', filters] as const,
      customReports: ['analytics', 'custom-reports'] as const,
      summary: (filters?: any) => ['analytics', 'summary', filters] as const,
      seasonalPatterns: (filters?: any) => ['analytics', 'seasonal-patterns', filters] as const,
    },
    // Goals queries
    goals: {
      all: (filters?: any) => ['goals', filters] as const,
      detail: (id: string) => ['goals', id] as const,
      progress: (goalId: string) => ['goals', goalId, 'progress'] as const,
      contributions: (goalId: string) => ['goals', goalId, 'contributions'] as const,
      categories: ['goals', 'categories'] as const,
      insights: ['goals', 'insights'] as const,
    },
    // Budgets queries
    budgets: {
      all: (filters?: any) => ['budgets', filters] as const,
      detail: (id: string) => ['budgets', id] as const,
      current: ['budgets', 'current'] as const,
      insights: (budgetId: string) => ['budgets', budgetId, 'insights'] as const,
      recommendations: (budgetId: string) => ['budgets', budgetId, 'recommendations'] as const,
      optimalAllocations: (totalAmount: number, categories: string[]) => 
        ['budgets', 'optimal-allocations', totalAmount, categories] as const,
    },
} as const;

// Utility functions for optimistic updates
export const optimisticUpdate = <T>(
  queryKey: readonly unknown[],
  updater: (oldData: T | undefined) => T
) => {
  return queryClient.setQueryData(queryKey, updater);
};

export const invalidateQueries = (queryKey: readonly unknown[]) => {
  return queryClient.invalidateQueries({ queryKey });
};

export const refetchQueries = (queryKey: readonly unknown[]) => {
  return queryClient.refetchQueries({ queryKey });
};

// Prefetch utilities
export const prefetchQuery = async <T>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<T>,
  options?: { staleTime?: number }
) => {
  return queryClient.prefetchQuery({
    queryKey,
    queryFn,
    staleTime: options?.staleTime || 5 * 60 * 1000,
  });
};

// Cache management utilities
export const clearCache = () => {
  queryClient.clear();
};

export const removeQueries = (queryKey: readonly unknown[]) => {
  queryClient.removeQueries({ queryKey });
};

// Dev tools configuration
export const enableDevTools = process.env.NODE_ENV === 'development';

export default queryClient;

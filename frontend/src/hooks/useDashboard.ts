import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardService, DashboardData, SpendingCategory, RecentTransaction, ForecastData } from '@/lib/api/dashboard';
import { queryKeys } from '@/lib/api/query-client';

// Dashboard data hook
export const useDashboardData = (enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.dashboard.data,
    queryFn: () => dashboardService.getDashboardData(),
    enabled,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
    refetchIntervalInBackground: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Spending categories hook
export const useSpendingCategories = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.spendingCategories,
    queryFn: () => dashboardService.getSpendingCategories(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

// Recent transactions hook
export const useRecentTransactions = (limit: number = 10) => {
  return useQuery({
    queryKey: [...queryKeys.dashboard.recentTransactions, limit],
    queryFn: () => dashboardService.getRecentTransactions(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
};

// Forecast data hook
export const useForecastData = (months: number = 3) => {
  return useQuery({
    queryKey: [...queryKeys.dashboard.forecast, months],
    queryFn: () => dashboardService.getForecastData(months),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};

// Refresh dashboard hook
export const useRefreshDashboard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => dashboardService.refreshDashboard(),
    onSuccess: (data) => {
      // Update all dashboard-related queries
      queryClient.setQueryData(queryKeys.dashboard.data, data);
      queryClient.setQueryData(queryKeys.dashboard.spendingCategories, data.spendingCategories);
      queryClient.setQueryData(queryKeys.dashboard.recentTransactions, data.recentTransactions);
      queryClient.setQueryData(queryKeys.dashboard.forecast, data.forecastData);
      
      // Invalidate to trigger refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.data });
    },
    onError: (error) => {
      console.error('Failed to refresh dashboard:', error);
    },
  });
};

// Export dashboard data hook
export const useExportDashboard = () => {
  return useMutation({
    mutationFn: (format: 'csv' | 'json' = 'csv') => dashboardService.exportDashboardData(format),
    onSuccess: (blob, format) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dashboard-data.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    onError: (error) => {
      console.error('Failed to export dashboard data:', error);
    },
  });
};

// Pull to refresh hook
export const usePullToRefresh = () => {
  const refreshMutation = useRefreshDashboard();

  const handlePullToRefresh = () => {
    refreshMutation.mutate();
  };

  return {
    handlePullToRefresh,
    isRefreshing: refreshMutation.isPending,
  };
};

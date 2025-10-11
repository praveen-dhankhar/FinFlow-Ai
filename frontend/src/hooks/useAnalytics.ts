import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  analyticsService, 
  SpendingTrend, 
  IncomeSource, 
  SavingsGoal, 
  BudgetPerformance, 
  CustomReport,
  AnalyticsSummary,
  SeasonalPattern,
  ReportFilters
} from '@/lib/api/analytics';
import { queryKeys } from '@/lib/api/query-client';
import { useToast } from '@/components/ui';

export const useSpendingTrends = (filters?: {
  startDate?: string;
  endDate?: string;
  categories?: string[];
  granularity?: 'daily' | 'weekly' | 'monthly';
}) => {
  return useQuery<SpendingTrend[], Error>({
    queryKey: queryKeys.analytics.spendingTrends(filters),
    queryFn: () => analyticsService.getSpendingTrends(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useIncomeAnalysis = (filters?: {
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery<{
    sources: IncomeSource[];
    summary: {
      totalIncome: number;
      averageMonthly: number;
      growthRate: number;
      stability: number;
    };
  }, Error>({
    queryKey: queryKeys.analytics.incomeAnalysis(filters),
    queryFn: () => analyticsService.getIncomeAnalysis(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useSavingsGoals = () => {
  return useQuery<SavingsGoal[], Error>({
    queryKey: queryKeys.analytics.savingsGoals,
    queryFn: analyticsService.getSavingsGoals,
    staleTime: 5 * 60 * 1000,
  });
};

export const useBudgetPerformance = (filters?: {
  startDate?: string;
  endDate?: string;
  categories?: string[];
}) => {
  return useQuery<BudgetPerformance[], Error>({
    queryKey: queryKeys.analytics.budgetPerformance(filters),
    queryFn: () => analyticsService.getBudgetPerformance(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCustomReports = () => {
  return useQuery<CustomReport[], Error>({
    queryKey: queryKeys.analytics.customReports,
    queryFn: analyticsService.getCustomReports,
    staleTime: 10 * 60 * 1000,
  });
};

export const useCreateCustomReport = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation<CustomReport, Error, Omit<CustomReport, 'id' | 'createdAt' | 'updatedAt'>>({
    mutationFn: analyticsService.createCustomReport,
    onSuccess: (newReport) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.customReports });
      addToast({
        title: 'Report Created',
        description: `${newReport.name} has been created successfully.`,
        variant: 'success',
      });
    },
    onError: (error) => {
      addToast({
        title: 'Failed to Create Report',
        description: error.message,
        variant: 'error',
      });
    },
  });
};

export const useUpdateCustomReport = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation<CustomReport, Error, { id: string; updates: Partial<CustomReport> }>({
    mutationFn: ({ id, updates }) => analyticsService.updateCustomReport(id, updates),
    onSuccess: (updatedReport) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.customReports });
      addToast({
        title: 'Report Updated',
        description: `${updatedReport.name} has been updated.`,
        variant: 'success',
      });
    },
    onError: (error) => {
      addToast({
        title: 'Failed to Update Report',
        description: error.message,
        variant: 'error',
      });
    },
  });
};

export const useDeleteCustomReport = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation<void, Error, string>({
    mutationFn: analyticsService.deleteCustomReport,
    onSuccess: (_, reportId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.customReports });
      addToast({
        title: 'Report Deleted',
        description: 'Report has been deleted successfully.',
        variant: 'success',
      });
    },
    onError: (error) => {
      addToast({
        title: 'Failed to Delete Report',
        description: error.message,
        variant: 'error',
      });
    },
  });
};

export const useAnalyticsSummary = (filters?: {
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery<AnalyticsSummary, Error>({
    queryKey: queryKeys.analytics.summary(filters),
    queryFn: () => analyticsService.getAnalyticsSummary(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useSeasonalPatterns = (filters?: {
  startDate?: string;
  endDate?: string;
  categories?: string[];
}) => {
  return useQuery<SeasonalPattern[], Error>({
    queryKey: queryKeys.analytics.seasonalPatterns(filters),
    queryFn: () => analyticsService.getSeasonalPatterns(filters),
    staleTime: 10 * 60 * 1000,
  });
};

export const useExportAnalytics = () => {
  const { addToast } = useToast();

  return useMutation<Blob, Error, { format: 'csv' | 'json' | 'pdf'; filters?: any }>({
    mutationFn: ({ format, filters }) => analyticsService.exportAnalytics(format, filters),
    onSuccess: (data, variables) => {
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_report.${variables.format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      addToast({
        title: 'Export Successful',
        description: `Analytics data exported as ${variables.format.toUpperCase()}.`,
        variant: 'success',
      });
    },
    onError: (error) => {
      addToast({
        title: 'Export Failed',
        description: error.message,
        variant: 'error',
      });
    },
  });
};

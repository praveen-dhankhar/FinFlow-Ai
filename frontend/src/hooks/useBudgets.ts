import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  budgetsService,
  Budget,
  BudgetInsight,
  BudgetRecommendation,
  BudgetFilters,
  CreateBudgetRequest,
  UpdateBudgetRequest,
  BudgetAllocation,
} from '@/lib/api/budgets';
import { queryKeys } from '@/lib/api/query-client';
import { useToast } from '@/components/ui';

export const useBudgets = (filters?: BudgetFilters) => {
  return useQuery<Budget[], Error>({
    queryKey: queryKeys.budgets.all(filters),
    queryFn: () => budgetsService.getBudgets(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useBudget = (id: string) => {
  return useQuery<Budget, Error>({
    queryKey: queryKeys.budgets.detail(id),
    queryFn: () => budgetsService.getBudgetById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCurrentBudget = () => {
  return useQuery<Budget | null, Error>({
    queryKey: queryKeys.budgets.current,
    queryFn: budgetsService.getCurrentBudget,
    staleTime: 2 * 60 * 1000,
  });
};

export const useBudgetInsights = (budgetId: string) => {
  return useQuery<BudgetInsight, Error>({
    queryKey: queryKeys.budgets.insights(budgetId),
    queryFn: () => budgetsService.getBudgetInsights(budgetId),
    enabled: !!budgetId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useBudgetRecommendations = (budgetId: string) => {
  return useQuery<BudgetRecommendation[], Error>({
    queryKey: queryKeys.budgets.recommendations(budgetId),
    queryFn: () => budgetsService.getBudgetRecommendations(budgetId),
    enabled: !!budgetId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useOptimalAllocations = (totalAmount: number, categories: string[]) => {
  return useQuery<BudgetAllocation[], Error>({
    queryKey: queryKeys.budgets.optimalAllocations(totalAmount, categories),
    queryFn: () => budgetsService.getOptimalAllocations(totalAmount, categories),
    enabled: totalAmount > 0 && categories.length > 0,
    staleTime: 10 * 60 * 1000,
  });
};

export const useCreateBudget = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation<Budget, Error, CreateBudgetRequest>({
    mutationFn: budgetsService.createBudget,
    onSuccess: (newBudget) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.current });
      addToast({
        title: 'Budget Created',
        description: `${newBudget.name} has been created successfully.`,
        variant: 'success',
      });
    },
    onError: (error) => {
      addToast({
        title: 'Failed to Create Budget',
        description: error.message,
        variant: 'error',
      });
    },
  });
};

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation<Budget, Error, { id: string; updates: UpdateBudgetRequest }>({
    mutationFn: ({ id, updates }) => budgetsService.updateBudget(id, updates),
    onSuccess: (updatedBudget) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.detail(updatedBudget.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.current });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.insights(updatedBudget.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.recommendations(updatedBudget.id) });
      addToast({
        title: 'Budget Updated',
        description: `${updatedBudget.name} has been updated successfully.`,
        variant: 'success',
      });
    },
    onError: (error) => {
      addToast({
        title: 'Failed to Update Budget',
        description: error.message,
        variant: 'error',
      });
    },
  });
};

export const useDeleteBudget = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation<void, Error, string>({
    mutationFn: budgetsService.deleteBudget,
    onSuccess: (_, budgetId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.current });
      addToast({
        title: 'Budget Deleted',
        description: 'Budget has been deleted successfully.',
        variant: 'success',
      });
    },
    onError: (error) => {
      addToast({
        title: 'Failed to Delete Budget',
        description: error.message,
        variant: 'error',
      });
    },
  });
};

export const useDuplicateBudget = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation<Budget, Error, { id: string; newPeriod: { startDate: string; endDate: string } }>({
    mutationFn: ({ id, newPeriod }) => budgetsService.duplicateBudget(id, newPeriod),
    onSuccess: (duplicatedBudget) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all() });
      addToast({
        title: 'Budget Duplicated',
        description: `${duplicatedBudget.name} has been duplicated successfully.`,
        variant: 'success',
      });
    },
    onError: (error) => {
      addToast({
        title: 'Failed to Duplicate Budget',
        description: error.message,
        variant: 'error',
      });
    },
  });
};

export const useArchiveBudget = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation<Budget, Error, string>({
    mutationFn: budgetsService.archiveBudget,
    onSuccess: (archivedBudget) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.current });
      addToast({
        title: 'Budget Archived',
        description: `${archivedBudget.name} has been archived successfully.`,
        variant: 'success',
      });
    },
    onError: (error) => {
      addToast({
        title: 'Failed to Archive Budget',
        description: error.message,
        variant: 'error',
      });
    },
  });
};

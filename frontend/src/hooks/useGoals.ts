import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  goalsService,
  Goal,
  GoalContribution,
  GoalProgress,
  GoalFilters,
  CreateGoalRequest,
  UpdateGoalRequest,
  AddContributionRequest,
} from '@/lib/api/goals';
import { queryKeys } from '@/lib/api/query-client';
import { useToast } from '@/components/ui';

export const useGoals = (filters?: GoalFilters) => {
  return useQuery<Goal[], Error>({
    queryKey: queryKeys.goals.all(filters),
    queryFn: () => goalsService.getGoals(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useGoal = (id: string) => {
  return useQuery<Goal, Error>({
    queryKey: queryKeys.goals.detail(id),
    queryFn: () => goalsService.getGoalById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useGoalProgress = (goalId: string) => {
  return useQuery<GoalProgress, Error>({
    queryKey: queryKeys.goals.progress(goalId),
    queryFn: () => goalsService.getGoalProgress(goalId),
    enabled: !!goalId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useGoalContributions = (goalId: string) => {
  return useQuery<GoalContribution[], Error>({
    queryKey: queryKeys.goals.contributions(goalId),
    queryFn: () => goalsService.getGoalContributions(goalId),
    enabled: !!goalId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useGoalCategories = () => {
  return useQuery<{ id: string; name: string; icon?: string; color?: string }[], Error>({
    queryKey: queryKeys.goals.categories,
    queryFn: goalsService.getGoalCategories,
    staleTime: 10 * 60 * 1000,
  });
};

export const useGoalInsights = () => {
  return useQuery<{
    totalGoals: number;
    activeGoals: number;
    completedGoals: number;
    totalSaved: number;
    totalTarget: number;
    averageProgress: number;
    onTrackGoals: number;
    atRiskGoals: number;
  }, Error>({
    queryKey: queryKeys.goals.insights,
    queryFn: goalsService.getGoalInsights,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateGoal = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation<Goal, Error, CreateGoalRequest>({
    mutationFn: goalsService.createGoal,
    onSuccess: (newGoal) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.insights });
      addToast({
        title: 'Goal Created',
        description: `${newGoal.name} has been created successfully.`,
        variant: 'success',
      });
    },
    onError: (error) => {
      addToast({
        title: 'Failed to Create Goal',
        description: error.message,
        variant: 'error',
      });
    },
  });
};

export const useUpdateGoal = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation<Goal, Error, { id: string; updates: UpdateGoalRequest }>({
    mutationFn: ({ id, updates }) => goalsService.updateGoal(id, updates),
    onSuccess: (updatedGoal) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.detail(updatedGoal.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.progress(updatedGoal.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.insights });
      addToast({
        title: 'Goal Updated',
        description: `${updatedGoal.name} has been updated successfully.`,
        variant: 'success',
      });
    },
    onError: (error) => {
      addToast({
        title: 'Failed to Update Goal',
        description: error.message,
        variant: 'error',
      });
    },
  });
};

export const useDeleteGoal = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation<void, Error, string>({
    mutationFn: goalsService.deleteGoal,
    onSuccess: (_, goalId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.insights });
      addToast({
        title: 'Goal Deleted',
        description: 'Goal has been deleted successfully.',
        variant: 'success',
      });
    },
    onError: (error) => {
      addToast({
        title: 'Failed to Delete Goal',
        description: error.message,
        variant: 'error',
      });
    },
  });
};

export const useAddContribution = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation<GoalContribution, Error, AddContributionRequest>({
    mutationFn: goalsService.addContribution,
    onSuccess: (contribution) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.detail(contribution.goalId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.progress(contribution.goalId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.contributions(contribution.goalId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.insights });
      addToast({
        title: 'Contribution Added',
        description: `$${contribution.amount.toLocaleString()} added to your goal.`,
        variant: 'success',
      });
    },
    onError: (error) => {
      addToast({
        title: 'Failed to Add Contribution',
        description: error.message,
        variant: 'error',
      });
    },
  });
};

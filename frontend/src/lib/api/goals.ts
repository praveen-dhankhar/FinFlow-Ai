import apiClient from './client';

export interface Goal {
  id: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // ISO date string
  category: string;
  categoryId: string;
  icon?: string;
  color?: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  autoSaveAmount?: number;
  autoSaveFrequency: 'weekly' | 'monthly' | 'quarterly';
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  completedAt?: string; // ISO date string
}

export interface GoalContribution {
  id: string;
  goalId: string;
  amount: number;
  date: string; // ISO date string
  source: 'manual' | 'auto-save' | 'transfer';
  description?: string;
  createdAt: string; // ISO date string
}

export interface GoalProgress {
  goalId: string;
  currentAmount: number;
  targetAmount: number;
  progressPercentage: number;
  daysRemaining: number;
  projectedCompletionDate?: string; // ISO date string
  isOnTrack: boolean;
  monthlyContributionNeeded: number;
  weeklyContributionNeeded: number;
}

export interface GoalFilters {
  status?: 'active' | 'completed' | 'paused' | 'cancelled';
  categoryId?: string;
  priority?: 'low' | 'medium' | 'high';
  dateRange?: {
    start: string; // YYYY-MM-DD
    end: string; // YYYY-MM-DD
  };
}

export interface CreateGoalRequest {
  name: string;
  description?: string;
  targetAmount: number;
  targetDate: string; // ISO date string
  category: string;
  categoryId: string;
  icon?: string;
  color?: string;
  priority: 'low' | 'medium' | 'high';
  autoSaveAmount?: number;
  autoSaveFrequency: 'weekly' | 'monthly' | 'quarterly';
}

export interface UpdateGoalRequest {
  name?: string;
  description?: string;
  targetAmount?: number;
  targetDate?: string;
  category?: string;
  categoryId?: string;
  icon?: string;
  color?: string;
  status?: 'active' | 'completed' | 'paused' | 'cancelled';
  priority?: 'low' | 'medium' | 'high';
  autoSaveAmount?: number;
  autoSaveFrequency?: 'weekly' | 'monthly' | 'quarterly';
}

export interface AddContributionRequest {
  goalId: string;
  amount: number;
  source: 'manual' | 'auto-save' | 'transfer';
  description?: string;
}

export const goalsService = {
  getGoals: async (filters?: GoalFilters): Promise<Goal[]> => {
    const response = await apiClient.get('/goals', { params: filters });
    return response.data;
  },

  getGoalById: async (id: string): Promise<Goal> => {
    const response = await apiClient.get(`/goals/${id}`);
    return response.data;
  },

  createGoal: async (goal: CreateGoalRequest): Promise<Goal> => {
    const response = await apiClient.post('/goals', goal);
    return response.data;
  },

  updateGoal: async (id: string, updates: UpdateGoalRequest): Promise<Goal> => {
    const response = await apiClient.put(`/goals/${id}`, updates);
    return response.data;
  },

  deleteGoal: async (id: string): Promise<void> => {
    await apiClient.delete(`/goals/${id}`);
  },

  getGoalProgress: async (goalId: string): Promise<GoalProgress> => {
    const response = await apiClient.get(`/goals/${goalId}/progress`);
    return response.data;
  },

  getGoalContributions: async (goalId: string): Promise<GoalContribution[]> => {
    const response = await apiClient.get(`/goals/${goalId}/contributions`);
    return response.data;
  },

  addContribution: async (contribution: AddContributionRequest): Promise<GoalContribution> => {
    const response = await apiClient.post('/goals/contributions', contribution);
    return response.data;
  },

  getGoalCategories: async (): Promise<{ id: string; name: string; icon?: string; color?: string }[]> => {
    const response = await apiClient.get('/goals/categories');
    return response.data;
  },

  getGoalInsights: async (): Promise<{
    totalGoals: number;
    activeGoals: number;
    completedGoals: number;
    totalSaved: number;
    totalTarget: number;
    averageProgress: number;
    onTrackGoals: number;
    atRiskGoals: number;
  }> => {
    const response = await apiClient.get('/goals/insights');
    return response.data;
  },
};

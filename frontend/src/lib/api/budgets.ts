import apiClient from './client';

export interface Budget {
  id: string;
  name: string;
  description?: string;
  period: 'monthly' | 'quarterly' | 'yearly';
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  totalAmount: number;
  categories: BudgetCategory[];
  status: 'draft' | 'active' | 'completed' | 'archived';
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface BudgetCategory {
  id: string;
  categoryId: string;
  categoryName: string;
  budgetedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentage: number; // percentage of total budget
  color?: string;
  icon?: string;
}

export interface BudgetRecommendation {
  id: string;
  type: 'optimization' | 'allocation' | 'savings' | 'spending';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  potentialSavings?: number;
  categoryId?: string;
  categoryName?: string;
  actionRequired: boolean;
  priority: number; // 1-10
}

export interface BudgetInsight {
  totalBudgeted: number;
  totalSpent: number;
  totalRemaining: number;
  overspentCategories: number;
  underSpentCategories: number;
  averageSpendingRate: number; // per day
  projectedOverspend: boolean;
  projectedOverspendAmount?: number;
  daysRemaining: number;
  recommendedAdjustments: BudgetRecommendation[];
}

export interface BudgetFilters {
  period?: 'monthly' | 'quarterly' | 'yearly';
  status?: 'draft' | 'active' | 'completed' | 'archived';
  dateRange?: {
    start: string; // YYYY-MM-DD
    end: string; // YYYY-MM-DD
  };
}

export interface CreateBudgetRequest {
  name: string;
  description?: string;
  period: 'monthly' | 'quarterly' | 'yearly';
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  totalAmount: number;
  categories: Omit<BudgetCategory, 'id' | 'spentAmount' | 'remainingAmount'>[];
}

export interface UpdateBudgetRequest {
  name?: string;
  description?: string;
  totalAmount?: number;
  categories?: Omit<BudgetCategory, 'id' | 'spentAmount' | 'remainingAmount'>[];
  status?: 'draft' | 'active' | 'completed' | 'archived';
}

export interface BudgetAllocation {
  categoryId: string;
  categoryName: string;
  currentAllocation: number;
  recommendedAllocation: number;
  difference: number;
  reason: string;
}

export const budgetsService = {
  getBudgets: async (filters?: BudgetFilters): Promise<Budget[]> => {
    const response = await apiClient.get('/budgets', { params: filters });
    return response.data;
  },

  getBudgetById: async (id: string): Promise<Budget> => {
    const response = await apiClient.get(`/budgets/${id}`);
    return response.data;
  },

  getCurrentBudget: async (): Promise<Budget | null> => {
    const response = await apiClient.get('/budgets/current');
    return response.data;
  },

  createBudget: async (budget: CreateBudgetRequest): Promise<Budget> => {
    const response = await apiClient.post('/budgets', budget);
    return response.data;
  },

  updateBudget: async (id: string, updates: UpdateBudgetRequest): Promise<Budget> => {
    const response = await apiClient.put(`/budgets/${id}`, updates);
    return response.data;
  },

  deleteBudget: async (id: string): Promise<void> => {
    await apiClient.delete(`/budgets/${id}`);
  },

  getBudgetInsights: async (budgetId: string): Promise<BudgetInsight> => {
    const response = await apiClient.get(`/budgets/${budgetId}/insights`);
    return response.data;
  },

  getBudgetRecommendations: async (budgetId: string): Promise<BudgetRecommendation[]> => {
    const response = await apiClient.get(`/budgets/${budgetId}/recommendations`);
    return response.data;
  },

  getOptimalAllocations: async (totalAmount: number, categories: string[]): Promise<BudgetAllocation[]> => {
    const response = await apiClient.post('/budgets/optimal-allocations', {
      totalAmount,
      categories,
    });
    return response.data;
  },

  duplicateBudget: async (id: string, newPeriod: { startDate: string; endDate: string }): Promise<Budget> => {
    const response = await apiClient.post(`/budgets/${id}/duplicate`, newPeriod);
    return response.data;
  },

  archiveBudget: async (id: string): Promise<Budget> => {
    const response = await apiClient.post(`/budgets/${id}/archive`);
    return response.data;
  },
};

import apiClient from './client';
import { ApiError } from '@/types/auth';

export interface SpendingTrend {
  date: string;
  amount: number;
  category: string;
  categoryId: string;
  isAnomaly?: boolean;
  anomalyReason?: string;
}

export interface IncomeSource {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  stability: 'high' | 'medium' | 'low';
  growthRate: number;
  lastUpdated: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  monthlyContribution: number;
  progress: number;
  status: 'on-track' | 'at-risk' | 'off-track';
  milestones: {
    id: string;
    amount: number;
    achieved: boolean;
    achievedDate?: string;
  }[];
}

export interface BudgetPerformance {
  categoryId: string;
  categoryName: string;
  budgetedAmount: number;
  actualAmount: number;
  variance: number;
  variancePercentage: number;
  status: 'under' | 'over' | 'on-target';
  trend: 'improving' | 'declining' | 'stable';
  recommendations: string[];
}

export interface CustomReport {
  id: string;
  name: string;
  description?: string;
  widgets: ReportWidget[];
  filters: ReportFilters;
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ReportWidget {
  id: string;
  type: 'chart' | 'table' | 'metric' | 'gauge';
  title: string;
  dataSource: string;
  config: Record<string, any>;
  position: { x: number; y: number; width: number; height: number };
}

export interface ReportFilters {
  dateRange: {
    start: string;
    end: string;
  };
  categories?: string[];
  accounts?: string[];
  tags?: string[];
}

export interface AnalyticsSummary {
  totalSpending: number;
  totalIncome: number;
  netSavings: number;
  savingsRate: number;
  topSpendingCategory: string;
  biggestVariance: number;
  anomalyCount: number;
  goalProgress: number;
}

export interface SeasonalPattern {
  category: string;
  pattern: 'increasing' | 'decreasing' | 'cyclical' | 'stable';
  seasonality: number; // 0-1 score
  peakMonths: number[];
  lowMonths: number[];
}

export const analyticsService = {
  getSpendingTrends: async (filters?: {
    startDate?: string;
    endDate?: string;
    categories?: string[];
    granularity?: 'daily' | 'weekly' | 'monthly';
  }): Promise<SpendingTrend[]> => {
    const response = await apiClient.get('/analytics/spending-trends', { params: filters });
    return response.data;
  },

  getIncomeAnalysis: async (filters?: {
    startDate?: string;
    endDate?: string;
  }): Promise<{
    sources: IncomeSource[];
    summary: {
      totalIncome: number;
      averageMonthly: number;
      growthRate: number;
      stability: number;
    };
  }> => {
    const response = await apiClient.get('/analytics/income', { params: filters });
    return response.data;
  },

  getSavingsGoals: async (): Promise<SavingsGoal[]> => {
    const response = await apiClient.get('/analytics/savings-goals');
    return response.data;
  },

  getBudgetPerformance: async (filters?: {
    startDate?: string;
    endDate?: string;
    categories?: string[];
  }): Promise<BudgetPerformance[]> => {
    const response = await apiClient.get('/analytics/budget-performance', { params: filters });
    return response.data;
  },

  getCustomReports: async (): Promise<CustomReport[]> => {
    const response = await apiClient.get('/analytics/reports');
    return response.data;
  },

  createCustomReport: async (report: Omit<CustomReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<CustomReport> => {
    const response = await apiClient.post('/analytics/reports', report);
    return response.data;
  },

  updateCustomReport: async (id: string, updates: Partial<CustomReport>): Promise<CustomReport> => {
    const response = await apiClient.put(`/analytics/reports/${id}`, updates);
    return response.data;
  },

  deleteCustomReport: async (id: string): Promise<void> => {
    await apiClient.delete(`/analytics/reports/${id}`);
  },

  getAnalyticsSummary: async (filters?: {
    startDate?: string;
    endDate?: string;
  }): Promise<AnalyticsSummary> => {
    const response = await apiClient.get('/analytics/summary', { params: filters });
    return response.data;
  },

  getSeasonalPatterns: async (filters?: {
    startDate?: string;
    endDate?: string;
    categories?: string[];
  }): Promise<SeasonalPattern[]> => {
    const response = await apiClient.get('/analytics/seasonal-patterns', { params: filters });
    return response.data;
  },

  exportAnalytics: async (format: 'csv' | 'json' | 'pdf', filters?: any): Promise<Blob> => {
    const response = await apiClient.post('/analytics/export', { format, filters }, {
      responseType: 'blob',
    });
    return new Blob([response.data], { type: response.headers['content-type'] });
  },
};

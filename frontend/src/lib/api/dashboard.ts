import { apiClient } from './client';

// Define ApiError locally since it's not exported from auth types
export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number,
    public timestamp: string,
    public path: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Dashboard data types
export interface DashboardStats {
  currentBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  previousMonthIncome: number;
  previousMonthExpenses: number;
  previousMonthSavingsRate: number;
}

export interface SpendingCategory {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  color: string;
  icon: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

export interface RecentTransaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  categoryIcon: string;
  categoryColor: string;
  type: 'income' | 'expense';
  date: string;
  relativeDate: string;
}

export interface ForecastData {
  date: string;
  predictedAmount: number;
  confidence: number;
  actualAmount?: number;
}

export interface DashboardData {
  stats: DashboardStats;
  spendingCategories: SpendingCategory[];
  recentTransactions: RecentTransaction[];
  forecastData: ForecastData[];
  lastUpdated: string;
}

// Dashboard API service
export const dashboardService = {
  // Get dashboard data
  getDashboardData: async (): Promise<DashboardData> => {
    try {
      const response = await apiClient.get('/api/dashboard');
      return response.data;
    } catch (error) {
      throw new ApiError(
        (error as any).message || 'Failed to fetch dashboard data',
        'DASHBOARD_FETCH_ERROR',
        500,
        new Date().toISOString(),
        '/api/dashboard'
      );
    }
  },

  // Get spending categories
  getSpendingCategories: async (): Promise<SpendingCategory[]> => {
    try {
      const response = await apiClient.get('/api/dashboard/spending-categories');
      return response.data;
    } catch (error) {
      throw new ApiError(
        (error as any).message || 'Failed to fetch spending categories',
        'SPENDING_CATEGORIES_FETCH_ERROR',
        500,
        new Date().toISOString(),
        '/api/dashboard/spending-categories'
      );
    }
  },

  // Get recent transactions
  getRecentTransactions: async (limit: number = 10): Promise<RecentTransaction[]> => {
    try {
      const response = await apiClient.get(`/api/dashboard/recent-transactions?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw new ApiError(
        (error as any).message || 'Failed to fetch recent transactions',
        'RECENT_TRANSACTIONS_FETCH_ERROR',
        500,
        new Date().toISOString(),
        '/api/dashboard/recent-transactions'
      );
    }
  },

  // Get forecast data
  getForecastData: async (months: number = 3): Promise<ForecastData[]> => {
    try {
      const response = await apiClient.get(`/api/dashboard/forecast?months=${months}`);
      return response.data;
    } catch (error) {
      throw new ApiError(
        (error as any).message || 'Failed to fetch forecast data',
        'FORECAST_FETCH_ERROR',
        500,
        new Date().toISOString(),
        '/api/dashboard/forecast'
      );
    }
  },

  // Refresh dashboard data
  refreshDashboard: async (): Promise<DashboardData> => {
    try {
      const response = await apiClient.post('/api/dashboard/refresh');
      return response.data;
    } catch (error) {
      throw new ApiError(
        (error as any).message || 'Failed to refresh dashboard data',
        'DASHBOARD_REFRESH_ERROR',
        500,
        new Date().toISOString(),
        '/api/dashboard/refresh'
      );
    }
  },

  // Export dashboard data
  exportDashboardData: async (format: 'csv' | 'json' = 'csv'): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/api/dashboard/export?format=${format}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw new ApiError(
        (error as any).message || 'Failed to export dashboard data',
        'DASHBOARD_EXPORT_ERROR',
        500,
        new Date().toISOString(),
        '/api/dashboard/export'
      );
    }
  },
};

// Mock data for development
export const mockDashboardData: DashboardData = {
  stats: {
    currentBalance: 15420.50,
    monthlyIncome: 8500.00,
    monthlyExpenses: 6230.75,
    savingsRate: 26.7,
    previousMonthIncome: 8200.00,
    previousMonthExpenses: 6800.00,
    previousMonthSavingsRate: 17.1,
  },
  spendingCategories: [
    {
      id: '1',
      name: 'Housing',
      amount: 2500.00,
      percentage: 40.1,
      color: '#3B82F6',
      icon: '🏠',
      trend: 'up',
      change: 5.2,
    },
    {
      id: '2',
      name: 'Food & Dining',
      amount: 1200.50,
      percentage: 19.2,
      color: '#10B981',
      icon: '🍽️',
      trend: 'down',
      change: -2.1,
    },
    {
      id: '3',
      name: 'Transportation',
      amount: 800.25,
      percentage: 12.8,
      color: '#F59E0B',
      icon: '🚗',
      trend: 'stable',
      change: 0.0,
    },
    {
      id: '4',
      name: 'Entertainment',
      amount: 450.00,
      percentage: 7.2,
      color: '#8B5CF6',
      icon: '🎬',
      trend: 'up',
      change: 12.5,
    },
    {
      id: '5',
      name: 'Shopping',
      amount: 680.00,
      percentage: 10.9,
      color: '#EF4444',
      icon: '🛍️',
      trend: 'down',
      change: -8.3,
    },
    {
      id: '6',
      name: 'Others',
      amount: 600.00,
      percentage: 9.6,
      color: '#6B7280',
      icon: '📦',
      trend: 'stable',
      change: 1.2,
    },
  ],
  recentTransactions: [
    {
      id: '1',
      description: 'Salary Deposit',
      amount: 8500.00,
      category: 'Income',
      categoryIcon: '💰',
      categoryColor: '#10B981',
      type: 'income',
      date: '2024-01-20T09:00:00Z',
      relativeDate: '2 hours ago',
    },
    {
      id: '2',
      description: 'Rent Payment',
      amount: -2500.00,
      category: 'Housing',
      categoryIcon: '🏠',
      categoryColor: '#3B82F6',
      type: 'expense',
      date: '2024-01-19T10:00:00Z',
      relativeDate: '1 day ago',
    },
    {
      id: '3',
      description: 'Grocery Shopping',
      amount: -156.75,
      category: 'Food & Dining',
      categoryIcon: '🍽️',
      categoryColor: '#10B981',
      type: 'expense',
      date: '2024-01-19T14:30:00Z',
      relativeDate: '1 day ago',
    },
    {
      id: '4',
      description: 'Gas Station',
      amount: -45.20,
      category: 'Transportation',
      categoryIcon: '🚗',
      categoryColor: '#F59E0B',
      type: 'expense',
      date: '2024-01-18T16:45:00Z',
      relativeDate: '2 days ago',
    },
    {
      id: '5',
      description: 'Netflix Subscription',
      amount: -15.99,
      category: 'Entertainment',
      categoryIcon: '🎬',
      categoryColor: '#8B5CF6',
      type: 'expense',
      date: '2024-01-18T00:00:00Z',
      relativeDate: '2 days ago',
    },
  ],
  forecastData: [
    {
      date: '2024-02-01',
      predictedAmount: 16200.00,
      confidence: 0.85,
    },
    {
      date: '2024-03-01',
      predictedAmount: 16800.00,
      confidence: 0.78,
    },
    {
      date: '2024-04-01',
      predictedAmount: 17500.00,
      confidence: 0.72,
    },
  ],
  lastUpdated: new Date().toISOString(),
};

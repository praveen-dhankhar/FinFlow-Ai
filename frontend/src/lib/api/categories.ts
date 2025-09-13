import { apiClient } from './client';

// Category types
export interface Category {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  budget?: number;
  parentId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  order: number;
  spending?: {
    currentMonth: number;
    lastMonth: number;
    yearToDate: number;
  };
  transactionCount?: number;
}

export interface CategoryInsights {
  topSpending: Array<{
    category: Category;
    amount: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  monthOverMonth: Array<{
    category: Category;
    currentMonth: number;
    lastMonth: number;
    change: number;
    changePercentage: number;
  }>;
  trending: Array<{
    category: Category;
    growth: number;
    period: string;
  }>;
  suggestions: Array<{
    type: 'budget' | 'spending' | 'optimization';
    message: string;
    category?: Category;
    action?: string;
  }>;
}

export interface CategoryFilters {
  search?: string;
  parentId?: string;
  isActive?: boolean;
  hasBudget?: boolean;
  color?: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  icon: string;
  color: string;
  budget?: number;
  parentId?: string;
  order?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  budget?: number;
  parentId?: string;
  isActive?: boolean;
  order?: number;
}

export interface ReorderCategoriesRequest {
  categoryIds: string[];
}

// Category API service
export const categoryService = {
  // Get all categories
  getCategories: async (filters?: CategoryFilters): Promise<Category[]> => {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }

      const response = await apiClient.get(`/api/categories?${params}`);
      return response.data;
    } catch (error) {
      throw new Error(
        (error as any).message || 'Failed to fetch categories'
      );
    }
  },

  // Get single category
  getCategory: async (id: string): Promise<Category> => {
    try {
      const response = await apiClient.get(`/api/categories/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        (error as any).message || 'Failed to fetch category'
      );
    }
  },

  // Create category
  createCategory: async (category: CreateCategoryRequest): Promise<Category> => {
    try {
      const response = await apiClient.post('/api/categories', category);
      return response.data;
    } catch (error) {
      throw new Error(
        (error as any).message || 'Failed to create category'
      );
    }
  },

  // Update category
  updateCategory: async (id: string, category: UpdateCategoryRequest): Promise<Category> => {
    try {
      const response = await apiClient.put(`/api/categories/${id}`, category);
      return response.data;
    } catch (error) {
      throw new Error(
        (error as any).message || 'Failed to update category'
      );
    }
  },

  // Delete category
  deleteCategory: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/categories/${id}`);
    } catch (error) {
      throw new Error(
        (error as any).message || 'Failed to delete category'
      );
    }
  },

  // Reorder categories
  reorderCategories: async (request: ReorderCategoriesRequest): Promise<void> => {
    try {
      await apiClient.post('/api/categories/reorder', request);
    } catch (error) {
      throw new Error(
        (error as any).message || 'Failed to reorder categories'
      );
    }
  },

  // Get category insights
  getCategoryInsights: async (): Promise<CategoryInsights> => {
    try {
      const response = await apiClient.get('/api/categories/insights');
      return response.data;
    } catch (error) {
      throw new Error(
        (error as any).message || 'Failed to fetch category insights'
      );
    }
  },

  // Get category spending data
  getCategorySpending: async (id: string, period: 'month' | 'year' = 'month') => {
    try {
      const response = await apiClient.get(`/api/categories/${id}/spending?period=${period}`);
      return response.data;
    } catch (error) {
      throw new Error(
        (error as any).message || 'Failed to fetch category spending'
      );
    }
  },
};

// Mock data for development
export const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Housing',
    description: 'Rent, mortgage, utilities, and home maintenance',
    icon: 'Home',
    color: '#3B82F6',
    budget: 2500,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    order: 1,
    spending: {
      currentMonth: 2400,
      lastMonth: 2500,
      yearToDate: 24000,
    },
    transactionCount: 12,
  },
  {
    id: '2',
    name: 'Food & Dining',
    description: 'Groceries, restaurants, and food delivery',
    icon: 'Utensils',
    color: '#10B981',
    budget: 800,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    order: 2,
    spending: {
      currentMonth: 650,
      lastMonth: 720,
      yearToDate: 7800,
    },
    transactionCount: 45,
  },
  {
    id: '3',
    name: 'Transportation',
    description: 'Gas, car maintenance, public transport',
    icon: 'Car',
    color: '#F59E0B',
    budget: 500,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    order: 3,
    spending: {
      currentMonth: 420,
      lastMonth: 480,
      yearToDate: 5400,
    },
    transactionCount: 23,
  },
  {
    id: '4',
    name: 'Entertainment',
    description: 'Movies, games, subscriptions, and hobbies',
    icon: 'Film',
    color: '#8B5CF6',
    budget: 300,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    order: 4,
    spending: {
      currentMonth: 280,
      lastMonth: 250,
      yearToDate: 3200,
    },
    transactionCount: 18,
  },
  {
    id: '5',
    name: 'Shopping',
    description: 'Clothing, electronics, and general shopping',
    icon: 'ShoppingBag',
    color: '#EF4444',
    budget: 400,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    order: 5,
    spending: {
      currentMonth: 350,
      lastMonth: 420,
      yearToDate: 4200,
    },
    transactionCount: 31,
  },
  {
    id: '6',
    name: 'Healthcare',
    description: 'Medical expenses, insurance, and wellness',
    icon: 'Heart',
    color: '#EC4899',
    budget: 200,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    order: 6,
    spending: {
      currentMonth: 150,
      lastMonth: 180,
      yearToDate: 2100,
    },
    transactionCount: 8,
  },
  {
    id: '7',
    name: 'Education',
    description: 'Courses, books, and educational materials',
    icon: 'BookOpen',
    color: '#06B6D4',
    budget: 100,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    order: 7,
    spending: {
      currentMonth: 80,
      lastMonth: 120,
      yearToDate: 1100,
    },
    transactionCount: 5,
  },
  {
    id: '8',
    name: 'Income',
    description: 'Salary, freelance, and other income sources',
    icon: 'DollarSign',
    color: '#10B981',
    budget: 0,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    order: 8,
    spending: {
      currentMonth: 8500,
      lastMonth: 8200,
      yearToDate: 102000,
    },
    transactionCount: 4,
  },
];

export const mockCategoryInsights: CategoryInsights = {
  topSpending: [
    {
      category: mockCategories[0], // Housing
      amount: 2400,
      percentage: 32.4,
      trend: 'down',
    },
    {
      category: mockCategories[1], // Food & Dining
      amount: 650,
      percentage: 8.8,
      trend: 'down',
    },
    {
      category: mockCategories[2], // Transportation
      amount: 420,
      percentage: 5.7,
      trend: 'down',
    },
  ],
  monthOverMonth: [
    {
      category: mockCategories[0], // Housing
      currentMonth: 2400,
      lastMonth: 2500,
      change: -100,
      changePercentage: -4.0,
    },
    {
      category: mockCategories[1], // Food & Dining
      currentMonth: 650,
      lastMonth: 720,
      change: -70,
      changePercentage: -9.7,
    },
    {
      category: mockCategories[3], // Entertainment
      currentMonth: 280,
      lastMonth: 250,
      change: 30,
      changePercentage: 12.0,
    },
  ],
  trending: [
    {
      category: mockCategories[3], // Entertainment
      growth: 12.0,
      period: 'month',
    },
    {
      category: mockCategories[6], // Education
      growth: -33.3,
      period: 'month',
    },
  ],
  suggestions: [
    {
      type: 'budget',
      message: 'You&apos;re under budget in Food & Dining this month. Consider increasing your budget for next month.',
      category: mockCategories[1],
      action: 'Adjust budget',
    },
    {
      type: 'spending',
      message: 'Entertainment spending increased by 12% this month. Review your subscriptions.',
      category: mockCategories[3],
      action: 'Review spending',
    },
    {
      type: 'optimization',
      message: 'Consider consolidating similar categories to better track your spending patterns.',
      action: 'Merge categories',
    },
  ],
};

// Color presets for category creation
export const colorPresets = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#F43F5E', // Rose
];

// Icon options for category creation
export const iconOptions = [
  'Home', 'Utensils', 'Car', 'Film', 'ShoppingBag', 'Heart',
  'BookOpen', 'DollarSign', 'CreditCard', 'PiggyBank', 'TrendingUp',
  'TrendingDown', 'Target', 'Award', 'Gift', 'Star', 'Zap',
  'Shield', 'Lock', 'Unlock', 'Settings', 'Bell', 'Mail',
  'Phone', 'Camera', 'Music', 'Gamepad2', 'Palette', 'Wrench',
  'Briefcase', 'GraduationCap', 'Plane', 'Train', 'Ship', 'Bike',
  'Coffee', 'Pizza', 'Cake', 'Apple', 'Beer', 'Wine',
  'Shirt', 'Shoe', 'Watch', 'Glasses', 'Headphones', 'Laptop',
  'Smartphone', 'Tablet', 'Monitor', 'Printer', 'Router', 'Wifi',
];

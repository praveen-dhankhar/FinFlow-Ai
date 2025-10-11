import { apiClient } from './client';

// Transaction types
export interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  categoryId: string;
  categoryIcon: string;
  categoryColor: string;
  type: 'income' | 'expense';
  date: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  notes?: string;
  recurring?: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  receiptUrl?: string;
  location?: string;
  account?: string;
}

export interface TransactionFilters {
  search?: string;
  categoryIds?: string[];
  type?: 'income' | 'expense' | 'all';
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  tags?: string[];
  recurring?: boolean;
}

export interface TransactionSort {
  field: 'date' | 'amount' | 'description' | 'category' | 'createdAt';
  direction: 'asc' | 'desc';
}

export interface PaginatedTransactions {
  data: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface BulkActionRequest {
  transactionIds: string[];
  action: 'delete' | 'changeCategory' | 'addTags' | 'removeTags';
  data?: {
    categoryId?: string;
    tags?: string[];
  };
}

export interface ImportTransaction {
  date: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  tags?: string[];
  notes?: string;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
  }>;
  warnings: Array<{
    row: number;
    field: string;
    message: string;
  }>;
}

// Transaction API service
export const transactionService = {
  // Get paginated transactions
  getTransactions: async (
    page: number = 1,
    limit: number = 20,
    filters?: TransactionFilters,
    sort?: TransactionSort
  ): Promise<PaginatedTransactions> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters?.search && { search: filters.search }),
        ...(filters?.type && filters.type !== 'all' && { type: filters.type }),
        ...(filters?.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters?.dateTo && { dateTo: filters.dateTo }),
        ...(filters?.amountMin !== undefined && { amountMin: filters.amountMin.toString() }),
        ...(filters?.amountMax !== undefined && { amountMax: filters.amountMax.toString() }),
        ...(filters?.recurring !== undefined && { recurring: filters.recurring.toString() }),
        ...(filters?.categoryIds && { categoryIds: filters.categoryIds.join(',') }),
        ...(filters?.tags && { tags: filters.tags.join(',') }),
        ...(sort && { sortBy: sort.field, sortDir: sort.direction }),
      });

      const response = await apiClient.get(`/api/transactions?${params}`);
      return response.data;
    } catch (error) {
      throw new Error(
        (error as any).message || 'Failed to fetch transactions'
      );
    }
  },

  // Get single transaction
  getTransaction: async (id: string): Promise<Transaction> => {
    try {
      const response = await apiClient.get(`/api/transactions/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        (error as any).message || 'Failed to fetch transaction'
      );
    }
  },

  // Create transaction
  createTransaction: async (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> => {
    try {
      const response = await apiClient.post('/api/transactions', transaction);
      return response.data;
    } catch (error) {
      throw new Error(
        (error as any).message || 'Failed to create transaction'
      );
    }
  },

  // Update transaction
  updateTransaction: async (id: string, transaction: Partial<Transaction>): Promise<Transaction> => {
    try {
      const response = await apiClient.put(`/api/transactions/${id}`, transaction);
      return response.data;
    } catch (error) {
      throw new Error(
        (error as any).message || 'Failed to update transaction'
      );
    }
  },

  // Delete transaction
  deleteTransaction: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/transactions/${id}`);
    } catch (error) {
      throw new Error(
        (error as any).message || 'Failed to delete transaction'
      );
    }
  },

  // Bulk operations
  bulkAction: async (request: BulkActionRequest): Promise<void> => {
    try {
      await apiClient.post('/api/transactions/bulk', request);
    } catch (error) {
      throw new Error(
        (error as any).message || 'Failed to perform bulk action'
      );
    }
  },

  // Export transactions
  exportTransactions: async (
    filters?: TransactionFilters,
    format: 'csv' | 'xlsx' = 'csv'
  ): Promise<Blob> => {
    try {
      const params = new URLSearchParams({
        format,
        ...(filters?.search && { search: filters.search }),
        ...(filters?.type && filters.type !== 'all' && { type: filters.type }),
        ...(filters?.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters?.dateTo && { dateTo: filters.dateTo }),
        ...(filters?.categoryIds && { categoryIds: filters.categoryIds.join(',') }),
      });

      const response = await apiClient.get(`/api/transactions/export?${params}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw new Error(
        (error as any).message || 'Failed to export transactions'
      );
    }
  },

  // Import transactions
  importTransactions: async (file: File): Promise<ImportResult> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post('/api/transactions/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        (error as any).message || 'Failed to import transactions'
      );
    }
  },

  // Get transaction statistics
  getTransactionStats: async (filters?: TransactionFilters) => {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              params.append(key, value.join(','));
            } else {
              params.append(key, value.toString());
            }
          }
        });
      }

      const response = await apiClient.get(`/api/transactions/stats?${params}`);
      return response.data;
    } catch (error) {
      throw new Error(
        (error as any).message || 'Failed to fetch transaction statistics'
      );
    }
  },
};

// Mock data for development
export const mockTransactions: Transaction[] = [
  {
    id: '1',
    description: 'Salary Deposit',
    amount: 8500.00,
    category: 'Income',
    categoryId: 'income-1',
    categoryIcon: '💰',
    categoryColor: '#10B981',
    type: 'income',
    date: '2024-01-20T09:00:00Z',
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-01-20T09:00:00Z',
    tags: ['salary', 'work'],
    recurring: true,
    recurringPattern: 'monthly',
  },
  {
    id: '2',
    description: 'Rent Payment',
    amount: -2500.00,
    category: 'Housing',
    categoryId: 'housing-1',
    categoryIcon: '🏠',
    categoryColor: '#3B82F6',
    type: 'expense',
    date: '2024-01-19T10:00:00Z',
    createdAt: '2024-01-19T10:00:00Z',
    updatedAt: '2024-01-19T10:00:00Z',
    tags: ['rent', 'housing'],
    recurring: true,
    recurringPattern: 'monthly',
  },
  {
    id: '3',
    description: 'Grocery Shopping',
    amount: -156.75,
    category: 'Food & Dining',
    categoryId: 'food-1',
    categoryIcon: '🍽️',
    categoryColor: '#10B981',
    type: 'expense',
    date: '2024-01-19T14:30:00Z',
    createdAt: '2024-01-19T14:30:00Z',
    updatedAt: '2024-01-19T14:30:00Z',
    tags: ['groceries', 'food'],
  },
  {
    id: '4',
    description: 'Gas Station',
    amount: -45.20,
    category: 'Transportation',
    categoryId: 'transport-1',
    categoryIcon: '🚗',
    categoryColor: '#F59E0B',
    type: 'expense',
    date: '2024-01-18T16:45:00Z',
    createdAt: '2024-01-18T16:45:00Z',
    updatedAt: '2024-01-18T16:45:00Z',
    tags: ['gas', 'transportation'],
  },
  {
    id: '5',
    description: 'Netflix Subscription',
    amount: -15.99,
    category: 'Entertainment',
    categoryId: 'entertainment-1',
    categoryIcon: '🎬',
    categoryColor: '#8B5CF6',
    type: 'expense',
    date: '2024-01-18T00:00:00Z',
    createdAt: '2024-01-18T00:00:00Z',
    updatedAt: '2024-01-18T00:00:00Z',
    tags: ['subscription', 'entertainment'],
    recurring: true,
    recurringPattern: 'monthly',
  },
  {
    id: '6',
    description: 'Coffee Shop',
    amount: -4.50,
    category: 'Food & Dining',
    categoryId: 'food-2',
    categoryIcon: '☕',
    categoryColor: '#10B981',
    type: 'expense',
    date: '2024-01-17T08:30:00Z',
    createdAt: '2024-01-17T08:30:00Z',
    updatedAt: '2024-01-17T08:30:00Z',
    tags: ['coffee', 'food'],
  },
  {
    id: '7',
    description: 'Freelance Payment',
    amount: 1200.00,
    category: 'Income',
    categoryId: 'income-2',
    categoryIcon: '💼',
    categoryColor: '#10B981',
    type: 'income',
    date: '2024-01-16T12:00:00Z',
    createdAt: '2024-01-16T12:00:00Z',
    updatedAt: '2024-01-16T12:00:00Z',
    tags: ['freelance', 'work'],
  },
  {
    id: '8',
    description: 'Electricity Bill',
    amount: -120.45,
    category: 'Utilities',
    categoryId: 'utilities-1',
    categoryIcon: '⚡',
    categoryColor: '#EF4444',
    type: 'expense',
    date: '2024-01-15T00:00:00Z',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    tags: ['utilities', 'bills'],
    recurring: true,
    recurringPattern: 'monthly',
  },
];

export const mockCategories = [
  { id: 'income-1', name: 'Income', icon: '💰', color: '#10B981' },
  { id: 'housing-1', name: 'Housing', icon: '🏠', color: '#3B82F6' },
  { id: 'food-1', name: 'Food & Dining', icon: '🍽️', color: '#10B981' },
  { id: 'food-2', name: 'Coffee & Drinks', icon: '☕', color: '#10B981' },
  { id: 'transport-1', name: 'Transportation', icon: '🚗', color: '#F59E0B' },
  { id: 'entertainment-1', name: 'Entertainment', icon: '🎬', color: '#8B5CF6' },
  { id: 'utilities-1', name: 'Utilities', icon: '⚡', color: '#EF4444' },
];

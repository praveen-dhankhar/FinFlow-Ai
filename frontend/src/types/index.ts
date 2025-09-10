// User types
export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserRegistrationDto {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

// Financial Data types
export interface FinancialData {
  id: number;
  userId: number;
  amount: number;
  category: string;
  description: string;
  date: string;
  type: 'INCOME' | 'EXPENSE';
  createdAt: string;
  updatedAt: string;
}

export interface FinancialDataCreateDto {
  amount: number;
  category: string;
  description: string;
  date: string;
  type: 'INCOME' | 'EXPENSE';
}

export interface FinancialDataUpdateDto {
  amount?: number;
  category?: string;
  description?: string;
  date?: string;
  type?: 'INCOME' | 'EXPENSE';
}

// Category types
export interface Category {
  id: number;
  name: string;
  description?: string;
  color?: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryCreateDto {
  name: string;
  description?: string;
  color?: string;
}

export interface CategoryUpdateDto {
  name?: string;
  description?: string;
  color?: string;
}

// Forecast types
export interface Forecast {
  id: number;
  userId: number;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  updatedAt: string;
}

export interface ForecastResult {
  id: number;
  forecastId: number;
  date: string;
  predictedAmount: number;
  confidence: number;
  createdAt: string;
}

export interface ForecastCreateDto {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
}

// Account types
export interface Account {
  id: number;
  userId: number;
  name: string;
  type: 'CHECKING' | 'SAVINGS' | 'CREDIT' | 'INVESTMENT';
  balance: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccountCreateDto {
  name: string;
  type: 'CHECKING' | 'SAVINGS' | 'CREDIT' | 'INVESTMENT';
  balance: number;
  currency: string;
}

// Budget types
export interface Budget {
  id: number;
  userId: number;
  name: string;
  amount: number;
  spent: number;
  period: 'MONTHLY' | 'YEARLY';
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetCreateDto {
  name: string;
  amount: number;
  period: 'MONTHLY' | 'YEARLY';
  startDate: string;
  endDate: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// Error types
export interface ApiError {
  message: string;
  status: number;
  timestamp: string;
  path: string;
}

// Chart data types
export interface ChartDataPoint {
  name: string;
  value: number;
  date?: string;
  color?: string;
}

export interface TimeSeriesData {
  date: string;
  amount: number;
  category?: string;
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

// Navigation types
export interface NavItem {
  name: string;
  href: string;
  icon?: string;
  current?: boolean;
}

// Theme types
export type Theme = 'light' | 'dark' | 'system';

// Loading states
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Generic hook return types
export interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

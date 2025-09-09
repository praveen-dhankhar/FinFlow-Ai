// API Response Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
  timestamp: string;
}

// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: number;
  user: User;
  firstName: string;
  lastName: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserRegistrationDto {
  username: string;
  email: string;
  password: string;
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

// Financial Data Types
export interface FinancialData {
  id: number;
  user: User;
  amount: number;
  description: string;
  category: Category;
  date: string;
  type: 'INCOME' | 'EXPENSE';
  createdAt: string;
  updatedAt: string;
}

export interface FinancialDataCreateDto {
  amount: number;
  description: string;
  categoryId: number;
  date: string;
  type: 'INCOME' | 'EXPENSE';
}

export interface FinancialDataDto {
  id: number;
  amount: number;
  description: string;
  category: Category;
  date: string;
  type: 'INCOME' | 'EXPENSE';
  createdAt: string;
  updatedAt: string;
}

// Category Types
export interface Category {
  id: number;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryCreateDto {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

// Forecast Types
export interface Forecast {
  id: number;
  user: User;
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
  forecast: Forecast;
  date: string;
  predictedAmount: number;
  confidence: number;
  createdAt: string;
}

// Chart Data Types
export interface ChartDataPoint {
  date: string;
  amount: number;
  label?: string;
}

export interface TimeSeriesData {
  date: string;
  income: number;
  expense: number;
  net: number;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

// Navigation Types
export interface NavItem {
  name: string;
  href: string;
  icon?: string;
  current?: boolean;
  children?: NavItem[];
}

// Theme Types
export type Theme = 'light' | 'dark' | 'system';

// Loading States
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Pagination
export interface PaginationParams {
  page: number;
  size: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

// Filter Types
export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface FinancialDataFilters {
  dateRange?: DateRange;
  categoryIds?: number[];
  type?: 'INCOME' | 'EXPENSE';
  minAmount?: number;
  maxAmount?: number;
}

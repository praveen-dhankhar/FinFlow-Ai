// API Client
export { apiClient, apiCall, retryRequest } from './client';
export type { AxiosRequestConfig, AxiosResponse, AxiosError } from './client';

// Auth Service
export { authService } from './auth';
export type { default as AuthService } from './auth';

// React Query
export { 
  queryClient, 
  queryKeys, 
  optimisticUpdate, 
  invalidateQueries, 
  refetchQueries,
  prefetchQuery,
  clearCache,
  removeQueries,
  enableDevTools
} from './query-client';

// Re-export types
export type {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  JWTToken,
  ApiError,
  AuthState,
  AuthActions,
} from '@/types/auth';

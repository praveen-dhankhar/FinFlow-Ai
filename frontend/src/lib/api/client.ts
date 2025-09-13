import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import Cookies from 'js-cookie';
import { ApiError } from '@/types/auth';

// Create axios instance
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor
  client.interceptors.request.use(
    (config) => {
      // Add auth token to requests
      const token = Cookies.get('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add request timestamp for debugging
      config.metadata = { startTime: new Date() };

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      // Log response time for debugging
      if (response.config.metadata?.startTime) {
        const endTime = new Date();
        const duration = endTime.getTime() - response.config.metadata.startTime.getTime();
        console.log(`API Request to ${response.config.url} took ${duration}ms`);
      }

      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

      // Handle 401 errors with token refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = Cookies.get('refreshToken');
          if (refreshToken) {
            const response = await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/auth/refresh`,
              { refreshToken }
            );

            const { accessToken, refreshToken: newRefreshToken } = response.data;
            
            // Update tokens in cookies
            Cookies.set('accessToken', accessToken, { 
              expires: 1, // 1 day
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict'
            });
            
            if (newRefreshToken) {
              Cookies.set('refreshToken', newRefreshToken, { 
                expires: 7, // 7 days
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
              });
            }

            // Retry original request with new token
            originalRequest.headers = {
              ...originalRequest.headers,
              Authorization: `Bearer ${accessToken}`,
            };

            return client(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
          
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          
          return Promise.reject(refreshError);
        }
      }

      // Transform error to consistent format
      const apiError: ApiError = {
        message: error.response?.data?.message || error.message || 'An unexpected error occurred',
        code: error.response?.data?.code || error.code || 'UNKNOWN_ERROR',
        statusCode: error.response?.status || 500,
        timestamp: new Date().toISOString(),
        path: error.config?.url || '',
        details: error.response?.data?.details,
      };

      return Promise.reject(apiError);
    }
  );

  return client;
};

// Retry logic with exponential backoff
export const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on 4xx errors (except 401 which is handled by interceptor)
      if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500 && error.statusCode !== 401) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

// Create and export the API client
export const apiClient = createApiClient();

// Utility function for making API calls with retry logic
export const apiCall = async <T>(
  requestFn: () => Promise<AxiosResponse<T>>,
  retries: number = 3
): Promise<T> => {
  const response = await retryRequest(requestFn, retries);
  return response.data;
};

// Export types for use in other files
export type { AxiosRequestConfig, AxiosResponse, AxiosError };

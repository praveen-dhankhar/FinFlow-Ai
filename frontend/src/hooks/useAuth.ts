import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { authService } from '@/lib/api/auth';
import { useAuthStore, useAuthActions, useAuthUser, useAuthStatus } from '@/stores/authStore';
import { queryKeys } from '@/lib/api/query-client';
import {
  LoginRequest,
  RegisterRequest,
  User,
  ApiError,
} from '@/types/auth';

// Login hook
export const useLogin = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { setUser, setTokens, setLoading, setError } = useAuthActions();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (data) => {
      setUser(data.user);
      setTokens(data.accessToken, data.refreshToken);
      
      // Invalidate and refetch user queries
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user });
      
      // Redirect to dashboard
      router.push('/dashboard');
    },
    onError: (error: ApiError) => {
      setError(error.message);
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

// Register hook
export const useRegister = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { setUser, setTokens, setLoading, setError } = useAuthActions();

  return useMutation({
    mutationFn: (userData: RegisterRequest) => authService.register(userData),
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (data) => {
      setUser(data.user);
      setTokens(data.accessToken, data.refreshToken);
      
      // Invalidate and refetch user queries
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user });
      
      // Redirect to dashboard
      router.push('/dashboard');
    },
    onError: (error: ApiError) => {
      setError(error.message);
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

// Logout hook
export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { clearAuth } = useAuthActions();

  return useMutation({
    mutationFn: () => authService.logout(),
    onMutate: () => {
      // Optimistically clear auth state
      clearAuth();
    },
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      
      // Redirect to login
      router.push('/login');
    },
    onError: (error: ApiError) => {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state
      clearAuth();
      queryClient.clear();
      router.push('/login');
    },
  });
};

// User profile hook
export const useUser = () => {
  const { setUser, setError } = useAuthActions();
  const storedUser = useAuthUser();

  const query = useQuery({
    queryKey: queryKeys.auth.user,
    queryFn: () => authService.getCurrentUser(),
    enabled: !!storedUser, // Only fetch if we have a stored user
    initialData: storedUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 401 errors
      if (error && typeof error === 'object' && 'statusCode' in error) {
        const apiError = error as unknown as ApiError;
        if (apiError.statusCode === 401) {
          return false;
        }
      }
      return failureCount < 3;
    },
  });

  // Handle success and error with useEffect
  useEffect(() => {
    if (query.data) {
      setUser(query.data);
    }
    if (query.error) {
      setError((query.error as unknown as ApiError).message);
    }
  }, [query.data, query.error, setUser, setError]);

  return query;
};

// Update profile hook
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { updateUser, setError } = useAuthActions();

  return useMutation({
    mutationFn: (updates: Partial<User>) => authService.updateProfile(updates),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      
      // Update cached user data
      queryClient.setQueryData(queryKeys.auth.user, updatedUser);
    },
    onError: (error: ApiError) => {
      setError(error.message);
    },
  });
};

// Change password hook
export const useChangePassword = () => {
  const { setError } = useAuthActions();

  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      authService.changePassword(currentPassword, newPassword),
    onError: (error: ApiError) => {
      setError(error.message);
    },
  });
};

// Password reset hooks
export const useRequestPasswordReset = () => {
  const { setError } = useAuthActions();

  return useMutation({
    mutationFn: (email: string) => authService.requestPasswordReset(email),
    onError: (error: ApiError) => {
      setError(error.message);
    },
  });
};

export const useResetPassword = () => {
  const { setError } = useAuthActions();

  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      authService.resetPassword(token, newPassword),
    onError: (error: ApiError) => {
      setError(error.message);
    },
  });
};

// Auth state hook
export const useAuthState = () => {
  const { isAuthenticated, isLoading, error } = useAuthStatus();
  const user = useAuthUser();
  const { initializeAuth, checkAuthStatus } = useAuthActions();

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Check auth status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      checkAuthStatus();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [checkAuthStatus]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
  };
};

// Auth guard hook
export const useAuthGuard = (redirectTo: string = '/login') => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStatus();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isAuthenticated, isLoading };
};

// Token refresh hook
export const useTokenRefresh = () => {
  const { refreshAuth } = useAuthActions();

  return useMutation({
    mutationFn: () => authService.refreshToken(),
    onSuccess: (data) => {
      // Update store with new tokens
      refreshAuth();
    },
    onError: (error: ApiError) => {
      console.error('Token refresh failed:', error);
      // Handle refresh failure (redirect to login, etc.)
    },
  });
};

// Utility hook for checking if user has specific role
export const useHasRole = (role: string) => {
  const user = useAuthUser();
  return user?.role === role;
};

// Utility hook for checking if user has any of the specified roles
export const useHasAnyRole = (roles: string[]) => {
  const user = useAuthUser();
  return user ? roles.includes(user.role) : false;
};

// Utility hook for checking if user is admin
export const useIsAdmin = () => {
  return useHasRole('ADMIN');
};

// Utility hook for checking if user is verified
export const useIsVerified = () => {
  const user = useAuthUser();
  return user?.isEmailVerified || false;
};

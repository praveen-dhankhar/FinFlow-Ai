import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthState, AuthActions, User } from '@/types/auth';
import { authService } from '@/lib/api/auth';

interface AuthStore extends AuthState, AuthActions {
  // Additional actions
  initializeAuth: () => Promise<void>;
  checkAuthStatus: () => boolean;
  refreshAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user: User | null) => {
        set({ 
          user, 
          isAuthenticated: !!user,
          error: null 
        });
      },

      setTokens: (accessToken: string, refreshToken: string) => {
        set({ 
          accessToken, 
          refreshToken,
          error: null 
        });
      },

      clearAuth: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        
        // Clear tokens from cookies
        authService.clearTokens();
        authService.clearUser();
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...updates };
          set({ user: updatedUser });
          
          // Update user in cookies
          authService.setUser(updatedUser);
        }
      },

      // Initialize auth state from stored tokens
      initializeAuth: async () => {
        set({ isLoading: true, error: null });

        try {
          const accessToken = authService.getAccessToken();
          const refreshToken = authService.getRefreshToken();
          const user = authService.getUser();

          if (accessToken && refreshToken && user) {
            // Check if token is expired
            if (authService.isTokenExpired()) {
              // Try to refresh token
              try {
                const refreshResponse = await authService.refreshToken();
                set({
                  user,
                  accessToken: refreshResponse.accessToken,
                  refreshToken: refreshResponse.refreshToken,
                  isAuthenticated: true,
                  isLoading: false,
                  error: null,
                });
              } catch (refreshError) {
                // Refresh failed, clear auth
                get().clearAuth();
                set({ isLoading: false });
              }
            } else {
              // Token is valid
              set({
                user,
                accessToken,
                refreshToken,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              });
            }
          } else {
            // No stored auth data
            set({
              user: null,
              accessToken: null,
              refreshToken: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          get().clearAuth();
          set({ 
            isLoading: false, 
            error: 'Failed to initialize authentication' 
          });
        }
      },

      // Check current auth status
      checkAuthStatus: () => {
        const { accessToken, refreshToken, user } = get();
        const isAuthenticated = !!(accessToken && refreshToken && user);
        
        if (isAuthenticated !== get().isAuthenticated) {
          set({ isAuthenticated });
        }
        
        return isAuthenticated;
      },

      // Refresh authentication
      refreshAuth: async () => {
        set({ isLoading: true, error: null });

        try {
          const refreshResponse = await authService.refreshToken();
          const user = authService.getUser();

          set({
            user,
            accessToken: refreshResponse.accessToken,
            refreshToken: refreshResponse.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error('Auth refresh error:', error);
          get().clearAuth();
          set({ 
            isLoading: false, 
            error: 'Failed to refresh authentication' 
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => ({
        getItem: (name: string) => {
          // Only persist essential data, tokens are handled by cookies
          const value = localStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: (name: string, value: any) => {
          // Only persist user data, not tokens
          const { user, isAuthenticated } = value;
          localStorage.setItem(name, JSON.stringify({ user, isAuthenticated }));
        },
        removeItem: (name: string) => {
          localStorage.removeItem(name);
        },
      })),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selectors for better performance
export const useAuthUser = () => useAuthStore((state) => state.user);
export const useAuthStatus = () => useAuthStore((state) => ({
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,
  error: state.error,
}));
export const useAuthActions = () => useAuthStore((state) => ({
  setUser: state.setUser,
  setTokens: state.setTokens,
  clearAuth: state.clearAuth,
  setLoading: state.setLoading,
  setError: state.setError,
  updateUser: state.updateUser,
  initializeAuth: state.initializeAuth,
  checkAuthStatus: state.checkAuthStatus,
  refreshAuth: state.refreshAuth,
}));

// Utility hooks
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useIsLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);

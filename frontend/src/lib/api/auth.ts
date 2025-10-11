import Cookies from 'js-cookie';
import { apiClient, apiCall } from './client';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  User,
  ApiError,
} from '@/types/auth';

class AuthService {
  private readonly ACCESS_TOKEN_KEY = 'accessToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private readonly USER_KEY = 'user';

  // Token management
  setTokens(accessToken: string, refreshToken: string): void {
    const accessTokenExpiry = new Date();
    accessTokenExpiry.setDate(accessTokenExpiry.getDate() + 1); // 1 day

    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); // 7 days

    Cookies.set(this.ACCESS_TOKEN_KEY, accessToken, {
      expires: accessTokenExpiry,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    Cookies.set(this.REFRESH_TOKEN_KEY, refreshToken, {
      expires: refreshTokenExpiry,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
  }

  getAccessToken(): string | null {
    return Cookies.get(this.ACCESS_TOKEN_KEY) || null;
  }

  getRefreshToken(): string | null {
    return Cookies.get(this.REFRESH_TOKEN_KEY) || null;
  }

  clearTokens(): void {
    Cookies.remove(this.ACCESS_TOKEN_KEY);
    Cookies.remove(this.REFRESH_TOKEN_KEY);
    Cookies.remove(this.USER_KEY);
  }

  // User management
  setUser(user: User): void {
    Cookies.set(this.USER_KEY, JSON.stringify(user), {
      expires: 7, // 7 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
  }

  getUser(): User | null {
    const userStr = Cookies.get(this.USER_KEY);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  clearUser(): void {
    Cookies.remove(this.USER_KEY);
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiCall<LoginResponse>(() =>
        apiClient.post('/auth/login', credentials)
      );

      // Store tokens and user data
      this.setTokens(response.accessToken, response.refreshToken);
      this.setUser(response.user);

      return response;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await apiCall<RegisterResponse>(() =>
        apiClient.post('/auth/register', userData)
      );

      // Store tokens and user data (auto-login after registration)
      this.setTokens(response.accessToken, response.refreshToken);
      this.setUser(response.user);

      return response;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = this.getRefreshToken();
      if (refreshToken) {
        await apiCall(() =>
          apiClient.post('/auth/logout', { refreshToken })
        );
      }
    } catch (error) {
      // Even if logout fails on server, clear local tokens
      console.warn('Logout request failed:', error);
    } finally {
      // Always clear local tokens and user data
      this.clearTokens();
      this.clearUser();
    }
  }

  async refreshToken(): Promise<RefreshTokenResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await apiCall<RefreshTokenResponse>(() =>
        apiClient.post('/auth/refresh', { refreshToken })
      );

      // Update stored tokens
      this.setTokens(response.accessToken, response.refreshToken);

      return response;
    } catch (error) {
      // If refresh fails, clear all auth data
      this.clearTokens();
      this.clearUser();
      throw this.handleAuthError(error);
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiCall<{ user: User }>(() =>
        apiClient.get('/auth/me')
      );

      // Update stored user data
      this.setUser(response.user);

      return response.user;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      const response = await apiCall<{ user: User }>(() =>
        apiClient.patch('/auth/profile', updates)
      );

      // Update stored user data
      this.setUser(response.user);

      return response.user;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await apiCall(() =>
        apiClient.post('/auth/change-password', {
          currentPassword,
          newPassword,
        })
      );
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    try {
      await apiCall(() =>
        apiClient.post('/auth/forgot-password', { email })
      );
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await apiCall(() =>
        apiClient.post('/auth/reset-password', {
          token,
          newPassword,
        })
      );
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Utility methods
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    const user = this.getUser();
    return !!(token && user);
  }

  isTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }

  getTokenExpirationTime(): number | null {
    const token = this.getAccessToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000; // Convert to milliseconds
    } catch {
      return null;
    }
  }

  private handleAuthError(error: any): ApiError {
    if (error.statusCode) {
      return error; // Already an ApiError
    }

    return {
      message: error.message || 'Authentication failed',
      code: 'AUTH_ERROR',
      statusCode: 500,
      timestamp: new Date().toISOString(),
      path: '/auth',
    };
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;

# API Client Infrastructure

A robust, type-safe API client infrastructure built with Axios, React Query, and Zustand for the Finance Forecast application.

## 🏗️ Architecture Overview

```
src/lib/api/
├── client.ts          # Axios instance with interceptors
├── auth.ts            # Authentication service
├── query-client.ts    # React Query configuration
└── index.ts           # Exports

src/hooks/
└── useAuth.ts         # Authentication hooks

src/stores/
└── authStore.ts       # Zustand auth state management

src/types/
└── auth.ts            # TypeScript interfaces
```

## 🚀 Features

### Axios Client (`client.ts`)
- **Base URL Configuration**: Environment-based API endpoint
- **Request/Response Interceptors**: Automatic token attachment and logging
- **Token Refresh Logic**: Automatic JWT refresh on 401 errors
- **Retry Logic**: Exponential backoff for failed requests
- **Error Transformation**: Consistent error handling across the app

### Authentication Service (`auth.ts`)
- **JWT Token Management**: Secure token storage in httpOnly cookies
- **Auto-login**: Automatic login after registration
- **Token Refresh**: Silent token refresh with fallback
- **User Profile Management**: CRUD operations for user data
- **Password Management**: Change password and reset functionality

### React Query Setup (`query-client.ts`)
- **Global Configuration**: Optimized defaults for queries and mutations
- **Error Handling**: Centralized error processing
- **Query Keys Factory**: Consistent key management
- **Cache Management**: Utilities for cache manipulation
- **Dev Tools**: Development-only React Query DevTools

### Zustand Store (`authStore.ts`)
- **Persistent State**: Auth state persisted in localStorage
- **Token Management**: Secure token handling
- **Auto-initialization**: Auth state restoration on app load
- **Optimistic Updates**: Immediate UI updates with rollback

### Custom Hooks (`useAuth.ts`)
- **useLogin**: Login with loading/error states
- **useRegister**: Registration with validation
- **useLogout**: Logout with cleanup
- **useUser**: User profile with auto-refetch
- **useAuthState**: Global auth state management
- **useAuthGuard**: Route protection
- **Role-based Hooks**: Admin and verification checks

## 📖 Usage Examples

### Basic Authentication

```typescript
import { useLogin, useAuthState } from '@/hooks/useAuth';

function LoginForm() {
  const { user, isAuthenticated, isLoading } = useAuthState();
  const loginMutation = useLogin();

  const handleLogin = async (credentials) => {
    try {
      await loginMutation.mutateAsync(credentials);
      // User is automatically logged in and redirected
    } catch (error) {
      // Error is automatically handled
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (isAuthenticated) return <div>Welcome, {user?.firstName}!</div>;

  return (
    <form onSubmit={handleLogin}>
      {/* Login form */}
    </form>
  );
}
```

### API Calls with React Query

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient, queryKeys } from '@/lib/api';

function TransactionsList() {
  const { data: transactions, isLoading } = useQuery({
    queryKey: queryKeys.financial.transactions,
    queryFn: () => apiClient.get('/transactions').then(res => res.data),
  });

  const addTransactionMutation = useMutation({
    mutationFn: (transaction) => apiClient.post('/transactions', transaction),
    onSuccess: () => {
      // Invalidate and refetch transactions
      queryClient.invalidateQueries({ queryKey: queryKeys.financial.transactions });
    },
  });

  return (
    <div>
      {isLoading ? 'Loading...' : transactions?.map(transaction => (
        <div key={transaction.id}>{transaction.description}</div>
      ))}
    </div>
  );
}
```

### Auth Guard for Protected Routes

```typescript
import { useAuthGuard } from '@/hooks/useAuth';

function ProtectedPage() {
  const { isAuthenticated, isLoading } = useAuthGuard('/login');

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return null; // Will redirect to login

  return <div>Protected content</div>;
}
```

### Role-based Access Control

```typescript
import { useIsAdmin, useHasRole } from '@/hooks/useAuth';

function AdminPanel() {
  const isAdmin = useIsAdmin();
  const isUser = useHasRole('USER');

  if (!isAdmin) {
    return <div>Access denied</div>;
  }

  return <div>Admin panel content</div>;
}
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NODE_ENV=development
```

### Token Storage

Tokens are stored in secure httpOnly cookies with the following configuration:
- **Access Token**: 1 day expiry
- **Refresh Token**: 7 days expiry
- **Security**: `secure` and `sameSite: 'strict'` in production

### React Query Configuration

```typescript
// Default options
{
  queries: {
    staleTime: 5 * 60 * 1000,    // 5 minutes
    cacheTime: 10 * 60 * 1000,   // 10 minutes
    retry: 3,                     // Retry failed requests
    refetchOnWindowFocus: false,  // Disable refetch on focus
  },
  mutations: {
    retry: 2,                     // Retry failed mutations
  }
}
```

## 🛡️ Security Features

### Token Management
- **Automatic Refresh**: Tokens are refreshed before expiration
- **Secure Storage**: Tokens stored in httpOnly cookies
- **Fallback Handling**: Graceful degradation on refresh failure

### Error Handling
- **Consistent Format**: All errors follow the same structure
- **Status Code Mapping**: Proper handling of different HTTP status codes
- **User-friendly Messages**: Transformed error messages for UI display

### Request Security
- **CSRF Protection**: SameSite cookie attribute
- **HTTPS Only**: Secure flag in production
- **Request Validation**: Input validation and sanitization

## 🧪 Testing

### Mock API Client

```typescript
import { vi } from 'vitest';
import { apiClient } from '@/lib/api';

// Mock the API client
vi.mock('@/lib/api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));
```

### Test Authentication

```typescript
import { renderHook } from '@testing-library/react';
import { useLogin } from '@/hooks/useAuth';

test('should login successfully', async () => {
  const { result } = renderHook(() => useLogin());
  
  await act(async () => {
    await result.current.mutateAsync({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  expect(result.current.isSuccess).toBe(true);
});
```

## 📊 Performance Optimizations

### Caching Strategy
- **Query Caching**: Intelligent cache invalidation
- **Optimistic Updates**: Immediate UI feedback
- **Background Refetch**: Keep data fresh without blocking UI

### Bundle Optimization
- **Tree Shaking**: Only import what you need
- **Code Splitting**: Lazy load authentication components
- **Memoization**: Prevent unnecessary re-renders

## 🔍 Debugging

### React Query DevTools
- **Development Only**: Automatically enabled in development
- **Query Inspector**: View all queries and their states
- **Cache Explorer**: Inspect cached data

### Logging
- **Request Logging**: All API requests are logged with timing
- **Error Logging**: Comprehensive error information
- **Performance Metrics**: Request duration tracking

## 🚀 Deployment

### Production Considerations
- **Environment Variables**: Set production API URL
- **HTTPS**: Ensure all requests use HTTPS
- **Cookie Security**: Secure and SameSite attributes
- **Error Monitoring**: Integrate with error tracking service

### Build Optimization
- **Tree Shaking**: Remove unused code
- **Minification**: Compress JavaScript bundles
- **Source Maps**: Enable for debugging in production

## 📚 API Reference

### Auth Service Methods

```typescript
// Login
authService.login(credentials: LoginRequest): Promise<LoginResponse>

// Register
authService.register(userData: RegisterRequest): Promise<RegisterResponse>

// Logout
authService.logout(): Promise<void>

// Refresh Token
authService.refreshToken(): Promise<RefreshTokenResponse>

// Get Current User
authService.getCurrentUser(): Promise<User>

// Update Profile
authService.updateProfile(updates: Partial<User>): Promise<User>

// Change Password
authService.changePassword(currentPassword: string, newPassword: string): Promise<void>
```

### React Query Utilities

```typescript
// Query Keys
queryKeys.auth.user
queryKeys.financial.transactions
queryKeys.financial.categories

// Cache Management
invalidateQueries(queryKey)
refetchQueries(queryKey)
clearCache()
removeQueries(queryKey)

// Optimistic Updates
optimisticUpdate(queryKey, updater)
```

## 🤝 Contributing

1. Follow TypeScript best practices
2. Add proper error handling
3. Include unit tests for new features
4. Update documentation
5. Follow the existing code style

## 📄 License

This API client infrastructure is part of the Finance Forecast application.

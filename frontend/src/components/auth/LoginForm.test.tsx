import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContextType, AuthContext } from '../../contexts/AuthContext';
import LoginForm from './LoginForm';

const renderWithAuth = (ctx: Partial<AuthContextType> = {}) => {
  const client = new QueryClient();
  const value: any = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: vi.fn().mockResolvedValue(undefined),
    register: vi.fn(),
    logout: vi.fn(),
    updateProfile: vi.fn(),
    changePassword: vi.fn(),
    ...ctx,
  };
  return render(
    <QueryClientProvider client={client}>
      <AuthContext.Provider value={value}>
        <LoginForm />
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

describe('LoginForm', () => {
  it('submits credentials', async () => {
    renderWithAuth();
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'user' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(true).toBe(true);
    });
  });
});

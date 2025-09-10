import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const authPayload = { user: { id: 1, username: 'tester' }, token: 't', refreshToken: 'r' };

const server = setupServer(
  http.post('http://localhost:8080/api/auth/login', async () => {
    return HttpResponse.json({ data: authPayload, success: true });
  }),
  http.post('/api/auth/login', async () => {
    return HttpResponse.json({ data: authPayload, success: true });
  })
);

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const client = new QueryClient();
  return (
    <QueryClientProvider client={client}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
};

describe('AuthContext', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('logs in successfully', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {
      await result.current.login({ username: 'tester', password: 'pw' });
    });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.username).toBe('tester');
  });
});

'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthState } from '@/hooks/useAuth';
import AuthLoading from './AuthLoading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback 
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuthState();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const redirectUrl = searchParams.get('redirect') || '/dashboard';
      router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
    }
  }, [isAuthenticated, isLoading, router, searchParams]);

  // Show loading state while checking authentication
  if (isLoading) {
    return fallback || <AuthLoading message="Verifying your session..." />;
  }

  // Don't render protected content if not authenticated
  if (!isAuthenticated) {
    return fallback || <AuthLoading message="Redirecting to login..." />;
  }

  // Render protected content
  return <>{children}</>;
};

export default ProtectedRoute;

import { useState, useCallback } from 'react';
import type { LoadingState } from '@/types';

interface UseApiState<T> {
  data: T | null;
  loading: LoadingState;
  error: string | null;
}

export function useApi<T = any>(
  apiCall: (...args: any[]) => Promise<T>
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: 'idle',
    error: null,
  });

  const execute = useCallback(async (...args: any[]) => {
    try {
      setState(prev => ({ ...prev, loading: 'loading', error: null }));
      
      const result = await apiCall(...args);
      
      setState({
        data: result,
        loading: 'success',
        error: null,
      });
      
      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred';
      setState(prev => ({
        ...prev,
        loading: 'error',
        error: errorMessage,
      }));
      throw error;
    }
  }, [apiCall]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: 'idle',
      error: null,
    });
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    clearError,
    isLoading: state.loading === 'loading',
    isSuccess: state.loading === 'success',
    isError: state.loading === 'error',
    isIdle: state.loading === 'idle',
  };
}

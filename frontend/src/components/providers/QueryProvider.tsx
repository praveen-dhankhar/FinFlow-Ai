'use client';

import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient, enableDevTools } from '@/lib/api/query-client';

interface QueryProviderProps {
  children: React.ReactNode;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {enableDevTools && (
        <ReactQueryDevtools 
          initialIsOpen={false}
          position="bottom"
        />
      )}
    </QueryClientProvider>
  );
};

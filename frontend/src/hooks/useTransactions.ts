import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionService, Transaction, TransactionFilters, TransactionSort, BulkActionRequest, ImportResult } from '@/lib/api/transactions';
import { queryKeys } from '@/lib/api/query-client';

// Get transactions hook
export const useTransactions = (
  page: number = 1,
  limit: number = 20,
  filters?: TransactionFilters,
  sort?: TransactionSort
) => {
  return useQuery({
    queryKey: [...queryKeys.financial.transactions, page, limit, filters, sort],
    queryFn: () => transactionService.getTransactions(page, limit, filters, sort),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
};

// Get single transaction hook
export const useTransaction = (id: string) => {
  return useQuery({
    queryKey: [...queryKeys.financial.transaction(id)],
    queryFn: () => transactionService.getTransaction(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

// Create transaction hook
export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) =>
      transactionService.createTransaction(transaction),
    onSuccess: () => {
      // Invalidate all transaction queries
      queryClient.invalidateQueries({ queryKey: queryKeys.financial.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.data });
    },
    onError: (error) => {
      console.error('Failed to create transaction:', error);
    },
  });
};

// Update transaction hook
export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Transaction> }) =>
      transactionService.updateTransaction(id, data),
    onSuccess: (updatedTransaction) => {
      // Update the specific transaction in cache
      queryClient.setQueryData(
        queryKeys.financial.transaction(updatedTransaction.id),
        updatedTransaction
      );
      // Invalidate transaction lists
      queryClient.invalidateQueries({ queryKey: queryKeys.financial.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.data });
    },
    onError: (error) => {
      console.error('Failed to update transaction:', error);
    },
  });
};

// Delete transaction hook
export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => transactionService.deleteTransaction(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.financial.transaction(deletedId) });
      // Invalidate transaction lists
      queryClient.invalidateQueries({ queryKey: queryKeys.financial.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.data });
    },
    onError: (error) => {
      console.error('Failed to delete transaction:', error);
    },
  });
};

// Bulk actions hook
export const useBulkAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: BulkActionRequest) => transactionService.bulkAction(request),
    onSuccess: () => {
      // Invalidate all transaction queries
      queryClient.invalidateQueries({ queryKey: queryKeys.financial.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.data });
    },
    onError: (error) => {
      console.error('Failed to perform bulk action:', error);
    },
  });
};

// Export transactions hook
export const useExportTransactions = () => {
  return useMutation({
    mutationFn: ({ filters, format }: { filters?: TransactionFilters; format?: 'csv' | 'xlsx' }) =>
      transactionService.exportTransactions(filters, format),
    onSuccess: (blob, { format = 'csv' }) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transactions.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    onError: (error) => {
      console.error('Failed to export transactions:', error);
    },
  });
};

// Import transactions hook
export const useImportTransactions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => transactionService.importTransactions(file),
    onSuccess: () => {
      // Invalidate all transaction queries
      queryClient.invalidateQueries({ queryKey: queryKeys.financial.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.data });
    },
    onError: (error) => {
      console.error('Failed to import transactions:', error);
    },
  });
};

// Transaction statistics hook
export const useTransactionStats = (filters?: TransactionFilters) => {
  return useQuery({
    queryKey: [...queryKeys.financial.transactions, 'stats', filters],
    queryFn: () => transactionService.getTransactionStats(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

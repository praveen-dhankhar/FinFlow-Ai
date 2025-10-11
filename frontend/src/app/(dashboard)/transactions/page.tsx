'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Filter, 
  Download, 
  Upload, 
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { 
  TransactionTable, 
  FilterSidebar, 
  AddTransactionModal, 
  EditTransactionModal, 
  BulkActions, 
  ImportTransactions 
} from '@/components/transactions';
import { Button, Input } from '@/components/ui';
import { 
  useTransactions, 
  useCreateTransaction, 
  useUpdateTransaction, 
  useDeleteTransaction, 
  useBulkAction, 
  useExportTransactions, 
  useImportTransactions 
} from '@/hooks/useTransactions';
import { 
  mockTransactions, 
  mockCategories, 
  Transaction, 
  TransactionFilters, 
  TransactionSort 
} from '@/lib/api/transactions';
import { cn } from '@/lib/utils';

const TransactionsPage: React.FC = () => {
  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [sort, setSort] = useState<TransactionSort>({ field: 'date', direction: 'desc' });
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Use mock data for now (replace with real API calls later)
  const { data: transactionsData, isLoading } = useTransactions(
    currentPage, 
    pageSize, 
    { ...filters, search: debouncedSearchTerm }, 
    sort
  );

  // Use mock data when not loading from API
  const data = transactionsData || {
    data: mockTransactions,
    pagination: {
      page: 1,
      limit: 20,
      total: mockTransactions.length,
      totalPages: Math.ceil(mockTransactions.length / 20),
      hasNext: false,
      hasPrev: false,
    }
  };

  // Hooks for mutations
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();
  const bulkActionMutation = useBulkAction();
  const exportMutation = useExportTransactions();
  const importMutation = useImportTransactions();

  // Filtered and sorted transactions
  const filteredTransactions = useMemo(() => {
    let filtered = data.data;

    // Apply search filter
    if (debouncedSearchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        transaction.category.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        transaction.tags?.some(tag => tag.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
      );
    }

    // Apply type filter
    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === filters.type);
    }

    // Apply category filter
    if (filters.categoryIds && filters.categoryIds.length > 0) {
      filtered = filtered.filter(transaction => 
        filters.categoryIds!.includes(transaction.categoryId)
      );
    }

    // Apply date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(transaction => 
        new Date(transaction.date) >= new Date(filters.dateFrom!)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(transaction => 
        new Date(transaction.date) <= new Date(filters.dateTo!)
      );
    }

    // Apply amount range filter
    if (filters.amountMin !== undefined) {
      filtered = filtered.filter(transaction => 
        Math.abs(transaction.amount) >= filters.amountMin!
      );
    }
    if (filters.amountMax !== undefined) {
      filtered = filtered.filter(transaction => 
        Math.abs(transaction.amount) <= filters.amountMax!
      );
    }

    // Apply recurring filter
    if (filters.recurring !== undefined) {
      filtered = filtered.filter(transaction => 
        transaction.recurring === filters.recurring
      );
    }

    return filtered;
  }, [data.data, debouncedSearchTerm, filters]);

  // Event handlers
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleSort = (newSort: TransactionSort) => {
    setSort(newSort);
  };

  const handleFiltersChange = (newFilters: TransactionFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleSelectTransaction = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedIds(filteredTransactions.map(t => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleCreateTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createMutation.mutateAsync(transaction);
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to create transaction:', error);
    }
  };

  const handleUpdateTransaction = async (id: string, data: Partial<Transaction>) => {
    try {
      await updateMutation.mutateAsync({ id, data });
      setEditingTransaction(null);
    } catch (error) {
      console.error('Failed to update transaction:', error);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      setEditingTransaction(null);
    } catch (error) {
      console.error('Failed to delete transaction:', error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkActionMutation.mutateAsync({
        transactionIds: selectedIds,
        action: 'delete',
      });
      setSelectedIds([]);
    } catch (error) {
      console.error('Failed to delete transactions:', error);
    }
  };

  const handleBulkChangeCategory = () => {
    // TODO: Implement bulk category change
    console.log('Bulk change category for:', selectedIds);
  };

  const handleBulkExport = async () => {
    try {
      await exportMutation.mutateAsync({
        filters: { ...filters, search: debouncedSearchTerm },
        format: 'csv',
      });
    } catch (error) {
      console.error('Failed to export transactions:', error);
    }
  };

  const handleImportTransactions = async (file: File) => {
    try {
      const result = await importMutation.mutateAsync(file);
      setShowImportModal(false);
      return result;
    } catch (error) {
      console.error('Failed to import transactions:', error);
      throw error;
    }
  };

  const handleViewTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleDeleteTransactionFromTable = (transaction: Transaction) => {
    handleDeleteTransaction(transaction.id);
  };

  const handleRowClick = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const totalPages = Math.ceil(filteredTransactions.length / pageSize);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Transactions
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {filteredTransactions.length} transactions found
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowImportModal(true)}
                className="flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>Import</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => exportMutation.mutate({ filters, format: 'csv' })}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </Button>
              <Button
                onClick={() => setShowAddModal(true)}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Transaction</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Search and Filters */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 lg:hidden"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                {Object.keys(filters).length > 0 && (
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2 py-1 rounded-full">
                    {Object.keys(filters).length}
                  </span>
                )}
              </Button>
            </div>

            {/* Transaction Table */}
            <TransactionTable
              transactions={paginatedTransactions}
              isLoading={isLoading}
              sort={sort}
              onSort={handleSort}
              selectedIds={selectedIds}
              onSelect={handleSelectTransaction}
              onSelectAll={handleSelectAll}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransactionFromTable}
              onView={handleViewTransaction}
              onRowClick={handleRowClick}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredTransactions.length)} of {filteredTransactions.length} results
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={cn(
                            "px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                            currentPage === page
                              ? "bg-blue-600 text-white"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          )}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Filter Sidebar */}
          <FilterSidebar
            isOpen={showFilters}
            onClose={() => setShowFilters(false)}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
            categories={mockCategories}
            className="lg:block"
          />
        </div>
      </div>

      {/* Modals */}
      <AddTransactionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreateTransaction}
        categories={mockCategories}
        isLoading={createMutation.isPending}
      />

      <EditTransactionModal
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        transaction={editingTransaction}
        onSubmit={handleUpdateTransaction}
        onDelete={handleDeleteTransaction}
        categories={mockCategories}
        isLoading={updateMutation.isPending || deleteMutation.isPending}
      />

      <ImportTransactions
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportTransactions}
        isLoading={importMutation.isPending}
      />

      {/* Bulk Actions */}
      <BulkActions
        selectedCount={selectedIds.length}
        onDelete={handleBulkDelete}
        onChangeCategory={handleBulkChangeCategory}
        onExport={handleBulkExport}
        onClearSelection={() => setSelectedIds([])}
      />
    </div>
  );
};

export default TransactionsPage;
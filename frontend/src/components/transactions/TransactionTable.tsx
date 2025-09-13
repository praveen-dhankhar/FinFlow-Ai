'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronUp, 
  ChevronDown, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Tag,
  Receipt
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui';
import { Transaction, TransactionSort } from '@/lib/api/transactions';

interface TransactionTableProps {
  transactions: Transaction[];
  isLoading?: boolean;
  sort?: TransactionSort;
  onSort?: (sort: TransactionSort) => void;
  selectedIds?: string[];
  onSelect?: (id: string) => void;
  onSelectAll?: (selected: boolean) => void;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
  onView?: (transaction: Transaction) => void;
  onRowClick?: (transaction: Transaction) => void;
}

const SortButton: React.FC<{
  field: TransactionSort['field'];
  currentSort?: TransactionSort;
  onSort: (sort: TransactionSort) => void;
  children: React.ReactNode;
}> = ({ field, currentSort, onSort, children }) => {
  const isActive = currentSort?.field === field;
  const direction = isActive ? currentSort.direction : 'asc';

  const handleClick = () => {
    onSort({
      field,
      direction: isActive && direction === 'asc' ? 'desc' : 'asc',
    });
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center space-x-1 hover:text-gray-900 dark:hover:text-white transition-colors"
    >
      <span>{children}</span>
      <div className="flex flex-col">
        <ChevronUp 
          className={cn(
            "h-3 w-3 -mb-1",
            isActive && direction === 'asc' 
              ? "text-blue-600 dark:text-blue-400" 
              : "text-gray-400"
          )} 
        />
        <ChevronDown 
          className={cn(
            "h-3 w-3",
            isActive && direction === 'desc' 
              ? "text-blue-600 dark:text-blue-400" 
              : "text-gray-400"
          )} 
        />
      </div>
    </button>
  );
};

const TransactionRow: React.FC<{
  transaction: Transaction;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
  onView: (transaction: Transaction) => void;
  onRowClick: (transaction: Transaction) => void;
}> = ({
  transaction,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onView,
  onRowClick,
}) => {
  const [showActions, setShowActions] = useState(false);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      signDisplay: 'always',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isIncome = transaction.type === 'income';

  return (
    <motion.tr
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group",
        isSelected && "bg-blue-50 dark:bg-blue-900/20"
      )}
      onClick={() => onRowClick(transaction)}
    >
      {/* Checkbox */}
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(transaction.id);
          }}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
      </td>

      {/* Date */}
      <td className="px-4 py-3">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-900 dark:text-white">
            {formatDate(transaction.date)}
          </span>
        </div>
      </td>

      {/* Description */}
      <td className="px-4 py-3">
        <div className="flex items-center space-x-3">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
            style={{ backgroundColor: transaction.categoryColor }}
          >
            {transaction.categoryIcon}
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {transaction.description}
            </div>
            {transaction.tags && transaction.tags.length > 0 && (
              <div className="flex items-center space-x-1 mt-1">
                <Tag className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {transaction.tags.slice(0, 2).join(', ')}
                  {transaction.tags.length > 2 && ` +${transaction.tags.length - 2}`}
                </span>
              </div>
            )}
          </div>
        </div>
      </td>

      {/* Category */}
      <td className="px-4 py-3">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {transaction.category}
        </span>
      </td>

      {/* Amount */}
      <td className="px-4 py-3">
        <div className="flex items-center space-x-2">
          {isIncome ? (
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          ) : (
            <ArrowDownLeft className="h-4 w-4 text-red-500" />
          )}
          <span className={cn(
            "font-semibold",
            isIncome 
              ? "text-green-600 dark:text-green-400" 
              : "text-red-600 dark:text-red-400"
          )}>
            {formatAmount(transaction.amount)}
          </span>
        </div>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center space-x-2">
          {/* Receipt indicator */}
          {transaction.receiptUrl && (
            <Receipt className="h-4 w-4 text-gray-400" />
          )}

          {/* Actions menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="h-4 w-4 text-gray-400" />
            </button>

            <AnimatePresence>
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onView(transaction);
                      setShowActions(false);
                    }}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(transaction);
                      setShowActions(false);
                    }}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(transaction);
                      setShowActions(false);
                    }}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </td>
    </motion.tr>
  );
};

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  isLoading = false,
  sort,
  onSort,
  selectedIds = [],
  onSelect,
  onSelectAll,
  onEdit,
  onDelete,
  onView,
  onRowClick,
}) => {
  const allSelected = transactions.length > 0 && selectedIds.length === transactions.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < transactions.length;

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">
                  <Skeleton className="h-4 w-4" />
                </th>
                <th className="px-4 py-3 text-left">
                  <Skeleton className="h-4 w-16" />
                </th>
                <th className="px-4 py-3 text-left">
                  <Skeleton className="h-4 w-24" />
                </th>
                <th className="px-4 py-3 text-left">
                  <Skeleton className="h-4 w-20" />
                </th>
                <th className="px-4 py-3 text-left">
                  <Skeleton className="h-4 w-16" />
                </th>
                <th className="px-4 py-3 text-left">
                  <Skeleton className="h-4 w-12" />
                </th>
              </tr>
            </thead>
            <tbody>
              {[...Array(10)].map((_, index) => (
                <tr key={index} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-4" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-8" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Receipt className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No transactions found
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Start by adding your first transaction
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected;
                  }}
                  onChange={(e) => onSelectAll?.(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </th>
              <th className="px-4 py-3 text-left">
                {onSort ? (
                  <SortButton field="date" currentSort={sort} onSort={onSort}>
                    Date
                  </SortButton>
                ) : (
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </span>
                )}
              </th>
              <th className="px-4 py-3 text-left">
                {onSort ? (
                  <SortButton field="description" currentSort={sort} onSort={onSort}>
                    Description
                  </SortButton>
                ) : (
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Description
                  </span>
                )}
              </th>
              <th className="px-4 py-3 text-left">
                {onSort ? (
                  <SortButton field="category" currentSort={sort} onSort={onSort}>
                    Category
                  </SortButton>
                ) : (
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Category
                  </span>
                )}
              </th>
              <th className="px-4 py-3 text-left">
                {onSort ? (
                  <SortButton field="amount" currentSort={sort} onSort={onSort}>
                    Amount
                  </SortButton>
                ) : (
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </span>
                )}
              </th>
              <th className="px-4 py-3 text-left">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {transactions.map((transaction) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                  isSelected={selectedIds.includes(transaction.id)}
                  onSelect={onSelect!}
                  onEdit={onEdit!}
                  onDelete={onDelete!}
                  onView={onView!}
                  onRowClick={onRowClick!}
                />
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;

'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  ChevronRight,
  Receipt
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui';
import { RecentTransaction } from '@/lib/api/dashboard';

interface TransactionItemProps {
  transaction: RecentTransaction;
  onEdit?: (transaction: RecentTransaction) => void;
  onDelete?: (transaction: RecentTransaction) => void;
  onView?: (transaction: RecentTransaction) => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onEdit,
  onDelete,
  onView,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    currentX.current = e.touches[0].clientX;
    const deltaX = currentX.current - startX.current;
    
    if (deltaX < 0) {
      setSwipeOffset(Math.max(deltaX, -120));
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    if (swipeOffset < -60) {
      setIsExpanded(true);
    }
    setSwipeOffset(0);
    setIsDragging(false);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      signDisplay: 'always',
    }).format(amount);
  };

  const isIncome = transaction.type === 'income';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden"
    >
      {/* Swipe actions */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, x: 120 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 120 }}
            className="absolute right-0 top-0 h-full flex items-center space-x-2 pr-4 bg-gray-100 dark:bg-gray-800 z-10"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onView?.(transaction)}
              className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            >
              <Eye className="h-4 w-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onEdit?.(transaction)}
              className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors"
            >
              <Edit className="h-4 w-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onDelete?.(transaction)}
              className="p-2 rounded-lg bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transaction card */}
      <motion.div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ 
          transform: `translateX(${swipeOffset}px)`,
          transition: swipeOffset === 0 ? 'transform 0.3s ease' : 'none',
        }}
        className="relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 cursor-pointer group"
        onClick={() => onView?.(transaction)}
      >
        <div className="p-4 flex items-center space-x-4">
          {/* Category icon */}
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg"
            style={{ backgroundColor: transaction.categoryColor }}
          >
            {transaction.categoryIcon}
          </div>

          {/* Transaction details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {transaction.description}
              </h3>
              <div className="flex items-center space-x-2">
                <span className={cn(
                  "text-sm font-semibold",
                  isIncome ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                )}>
                  {formatAmount(transaction.amount)}
                </span>
                {isIncome ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownLeft className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {transaction.category}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {transaction.relativeDate}
              </span>
            </div>
          </div>

          {/* More button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreHorizontal className="h-4 w-4 text-gray-400" />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

interface RecentTransactionsProps {
  transactions: RecentTransaction[];
  isLoading?: boolean;
  onLoadMore?: () => void;
  onEdit?: (transaction: RecentTransaction) => void;
  onDelete?: (transaction: RecentTransaction) => void;
  onView?: (transaction: RecentTransaction) => void;
  onViewAll?: () => void;
}

const EmptyState = ({ onViewAll }: { onViewAll?: () => void }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.2 }}
      className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4"
    >
      <Receipt className="h-8 w-8 text-gray-400" />
    </motion.div>
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
      No recent transactions
    </h3>
    <p className="text-gray-500 dark:text-gray-400 mb-4">
      Start tracking your expenses and income
    </p>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onViewAll}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      Add Transaction
    </motion.button>
  </div>
);

const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  isLoading = false,
  onLoadMore,
  onEdit,
  onDelete,
  onView,
  onViewAll,
}) => {
  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-white/20 dark:border-gray-700/50 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-8 w-20" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center space-x-4 p-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-white/20 dark:border-gray-700/50 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Recent Transactions
          </h2>
        </div>
        <EmptyState onViewAll={onViewAll} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-white/20 dark:border-gray-700/50 shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Recent Transactions
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onViewAll}
          className="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          <span>View all</span>
          <ChevronRight className="h-4 w-4" />
        </motion.button>
      </div>

      {/* Transactions list */}
      <div className="space-y-3">
        <AnimatePresence>
          {transactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <TransactionItem
                transaction={transaction}
                onEdit={onEdit}
                onDelete={onDelete}
                onView={onView}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Load more button */}
      {onLoadMore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLoadMore}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Load more transactions
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default RecentTransactions;

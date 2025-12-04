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
  Receipt,
  Search
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
      className="relative overflow-hidden group"
    >
      {/* Swipe actions */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, x: 120 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 120 }}
            className="absolute right-0 top-0 h-full flex items-center space-x-2 pr-4 z-10"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onView?.(transaction)}
              className="p-2 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors backdrop-blur-md"
            >
              <Eye className="h-4 w-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onEdit?.(transaction)}
              className="p-2 rounded-xl bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-colors backdrop-blur-md"
            >
              <Edit className="h-4 w-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onDelete?.(transaction)}
              className="p-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors backdrop-blur-md"
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
        className="relative p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-300 cursor-pointer"
        onClick={() => onView?.(transaction)}
      >
        <div className="flex items-center space-x-4">
          {/* Category icon */}
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${transaction.categoryColor}, ${transaction.categoryColor}80)`,
              boxShadow: `0 4px 12px ${transaction.categoryColor}40`
            }}
          >
            {transaction.categoryIcon}
          </div>

          {/* Transaction details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium text-white truncate group-hover:text-blue-400 transition-colors">
                {transaction.description}
              </h3>
              <div className="flex items-center space-x-2">
                <span className={cn(
                  "text-base font-bold",
                  isIncome ? "text-green-400" : "text-white"
                )}>
                  {formatAmount(transaction.amount)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/5">
                  {transaction.category}
                </span>
                <span className="text-xs text-gray-500">
                  {transaction.relativeDate}
                </span>
              </div>
              {isIncome ? (
                <div className="flex items-center text-green-400 text-xs bg-green-500/10 px-2 py-0.5 rounded-full">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  Income
                </div>
              ) : (
                <div className="flex items-center text-red-400 text-xs bg-red-500/10 px-2 py-0.5 rounded-full">
                  <ArrowDownLeft className="h-3 w-3 mr-1" />
                  Expense
                </div>
              )}
            </div>
          </div>

          {/* More button */}
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-2 rounded-lg text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreHorizontal className="h-5 w-5" />
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
      transition={{ delay: 0.2, type: "spring" }}
      className="w-16 h-16 glass flex items-center justify-center mb-4 rounded-2xl"
    >
      <Receipt className="h-8 w-8 text-gray-400" />
    </motion.div>
    <h3 className="text-lg font-medium text-white mb-2">
      No recent transactions
    </h3>
    <p className="text-gray-400 mb-6">
      Start tracking your expenses and income
    </p>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onViewAll}
      className="px-6 py-2.5 gradient-primary text-white rounded-xl font-medium shadow-lg hover:shadow-purple-500/25 transition-all"
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
      <div className="glass p-6 h-full">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 rounded-xl bg-white/5">
              <Skeleton className="h-12 w-12 rounded-2xl" />
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
      <div className="glass p-6 h-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
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
      className="glass p-6 h-full relative overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">
          Recent Transactions
        </h2>
        <motion.button
          whileHover={{ scale: 1.05, x: 5 }}
          whileTap={{ scale: 0.95 }}
          onClick={onViewAll}
          className="flex items-center space-x-1 text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium"
        >
          <span>View all</span>
          <ChevronRight className="h-4 w-4" />
        </motion.button>
      </div>

      {/* Transactions list */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence>
          {transactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
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
            className="px-6 py-2 text-sm text-gray-300 hover:text-white border border-white/10 rounded-xl hover:bg-white/5 transition-colors"
          >
            Load more transactions
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default RecentTransactions;

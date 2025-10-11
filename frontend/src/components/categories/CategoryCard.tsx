'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  TrendingUp, 
  TrendingDown,
  Minus,
  DollarSign,
  Target,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Category } from '@/lib/api/categories';
import * as LucideIcons from 'lucide-react';

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onViewDetails?: (category: Category) => void;
  className?: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onEdit,
  onDelete,
  onViewDetails,
  className,
}) => {
  const [showActions, setShowActions] = useState(false);

  // Get the icon component from lucide-react
  const IconComponent = (LucideIcons as any)[category.icon] || LucideIcons.Circle;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getBudgetProgress = () => {
    if (!category.budget || category.budget === 0) return 0;
    const currentSpending = category.spending?.currentMonth || 0;
    return Math.min((currentSpending / category.budget) * 100, 100);
  };

  const getBudgetStatus = () => {
    const progress = getBudgetProgress();
    if (progress >= 100) return 'over';
    if (progress >= 80) return 'warning';
    return 'good';
  };

  const getTrendIcon = () => {
    const currentMonth = category.spending?.currentMonth || 0;
    const lastMonth = category.spending?.lastMonth || 0;
    
    if (currentMonth > lastMonth) {
      return <TrendingUp className="h-3 w-3 text-red-500" />;
    } else if (currentMonth < lastMonth) {
      return <TrendingDown className="h-3 w-3 text-green-500" />;
    } else {
      return <Minus className="h-3 w-3 text-gray-400" />;
    }
  };

  const getTrendText = () => {
    const currentMonth = category.spending?.currentMonth || 0;
    const lastMonth = category.spending?.lastMonth || 0;
    
    if (lastMonth === 0) return 'No previous data';
    
    const change = currentMonth - lastMonth;
    const changePercentage = Math.abs((change / lastMonth) * 100);
    
    if (change > 0) {
      return `+${changePercentage.toFixed(1)}% vs last month`;
    } else if (change < 0) {
      return `-${changePercentage.toFixed(1)}% vs last month`;
    } else {
      return 'Same as last month';
    }
  };

  const budgetStatus = getBudgetStatus();
  const progress = getBudgetProgress();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={cn(
        "relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer group",
        className
      )}
      onClick={() => onViewDetails?.(category)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm"
            style={{ backgroundColor: category.color }}
          >
            <IconComponent className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
              {category.name}
            </h3>
            {category.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {category.description}
              </p>
            )}
          </div>
        </div>

        {/* Actions Menu */}
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

          {showActions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute right-0 top-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10 min-w-[120px]"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(category);
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
                  onDelete(category);
                  setShowActions(false);
                }}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Spending Information */}
      <div className="space-y-4">
        {/* Current Month Spending */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              This month
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(category.spending?.currentMonth || 0)}
            </span>
            {getTrendIcon()}
          </div>
        </div>

        {/* Budget Progress */}
        {category.budget && category.budget > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Budget
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {formatCurrency(category.spending?.currentMonth || 0)} / {formatCurrency(category.budget)}
                </span>
                {budgetStatus === 'over' && (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className={cn(
                  "h-2 rounded-full transition-colors",
                  budgetStatus === 'over' && "bg-red-500",
                  budgetStatus === 'warning' && "bg-yellow-500",
                  budgetStatus === 'good' && "bg-green-500"
                )}
              />
            </div>

            {/* Budget Status */}
            <div className="flex items-center justify-between">
              <span className={cn(
                "text-xs font-medium",
                budgetStatus === 'over' && "text-red-600 dark:text-red-400",
                budgetStatus === 'warning' && "text-yellow-600 dark:text-yellow-400",
                budgetStatus === 'good' && "text-green-600 dark:text-green-400"
              )}>
                {budgetStatus === 'over' && 'Over budget'}
                {budgetStatus === 'warning' && 'Near limit'}
                {budgetStatus === 'good' && 'On track'}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {progress.toFixed(0)}%
              </span>
            </div>
          </div>
        )}

        {/* Trend Information */}
        <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {getTrendText()}
            </span>
            {category.transactionCount && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {category.transactionCount} transactions
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      {!category.isActive && (
        <div className="absolute top-2 right-2">
          <div className="w-2 h-2 bg-gray-400 rounded-full" title="Inactive" />
        </div>
      )}
    </motion.div>
  );
};

export default CategoryCard;

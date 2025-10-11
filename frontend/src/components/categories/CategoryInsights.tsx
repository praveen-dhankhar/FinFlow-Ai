'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle, 
  CheckCircle, 
  Lightbulb,
  BarChart3,
  Target,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CategoryInsights as CategoryInsightsType } from '@/lib/api/categories';
import * as LucideIcons from 'lucide-react';

interface CategoryInsightsProps {
  insights: CategoryInsightsType;
  isLoading?: boolean;
  className?: string;
}

const InsightCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ title, icon, children, className }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn(
      "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm",
      className
    )}
  >
    <div className="flex items-center space-x-3 mb-4">
      {icon}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
    </div>
    {children}
  </motion.div>
);

const CategoryInsights: React.FC<CategoryInsightsProps> = ({
  insights,
  isLoading = false,
  className,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) {
      return <ArrowUpRight className="h-4 w-4 text-red-500" />;
    } else if (change < 0) {
      return <ArrowDownRight className="h-4 w-4 text-green-500" />;
    } else {
      return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getSuggestionIcon = (type: 'budget' | 'spending' | 'optimization') => {
    switch (type) {
      case 'budget':
        return <Target className="h-4 w-4 text-blue-500" />;
      case 'spending':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'optimization':
        return <Lightbulb className="h-4 w-4 text-purple-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded" />
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-32" />
            </div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24" />
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Top Spending Categories */}
      <InsightCard
        title="Top Spending Categories"
        icon={<BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
      >
        <div className="space-y-4">
          {insights.topSpending.map((item, index) => {
            const IconComponent = (LucideIcons as any)[item.category.icon] || LucideIcons.Circle;
            return (
              <motion.div
                key={item.category.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm"
                    style={{ backgroundColor: item.category.color }}
                  >
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {item.category.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.percentage.toFixed(1)}% of total spending
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(item.amount)}
                  </span>
                  {getTrendIcon(item.trend)}
                </div>
              </motion.div>
            );
          })}
        </div>
      </InsightCard>

      {/* Month-over-Month Comparison */}
      <InsightCard
        title="Month-over-Month Changes"
        icon={<TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />}
      >
        <div className="space-y-4">
          {insights.monthOverMonth.map((item, index) => {
            const IconComponent = (LucideIcons as any)[item.category.icon] || LucideIcons.Circle;
            return (
              <motion.div
                key={item.category.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm"
                    style={{ backgroundColor: item.category.color }}
                  >
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {item.category.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatCurrency(item.currentMonth)} vs {formatCurrency(item.lastMonth)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getChangeIcon(item.change)}
                  <span className={cn(
                    "text-sm font-medium",
                    item.change > 0 ? "text-red-600 dark:text-red-400" : 
                    item.change < 0 ? "text-green-600 dark:text-green-400" : 
                    "text-gray-600 dark:text-gray-400"
                  )}>
                    {item.change > 0 ? '+' : ''}{item.changePercentage.toFixed(1)}%
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </InsightCard>

      {/* Trending Categories */}
      <InsightCard
        title="Trending Categories"
        icon={<TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />}
      >
        <div className="space-y-4">
          {insights.trending.map((item, index) => {
            const IconComponent = (LucideIcons as any)[item.category.icon] || LucideIcons.Circle;
            return (
              <motion.div
                key={item.category.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm"
                    style={{ backgroundColor: item.category.color }}
                  >
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {item.category.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.period} growth
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={cn(
                    "text-sm font-medium",
                    item.growth > 0 ? "text-green-600 dark:text-green-400" : 
                    item.growth < 0 ? "text-red-600 dark:text-red-400" : 
                    "text-gray-600 dark:text-gray-400"
                  )}>
                    {item.growth > 0 ? '+' : ''}{item.growth.toFixed(1)}%
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </InsightCard>

      {/* Suggestions */}
      <InsightCard
        title="Smart Suggestions"
        icon={<Lightbulb className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />}
      >
        <div className="space-y-4">
          {insights.suggestions.map((suggestion, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex-shrink-0 mt-0.5">
                {getSuggestionIcon(suggestion.type)}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 dark:text-white">
                  {suggestion.message}
                </p>
                {suggestion.action && (
                  <button className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                    {suggestion.action}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </InsightCard>
    </div>
  );
};

export default CategoryInsights;

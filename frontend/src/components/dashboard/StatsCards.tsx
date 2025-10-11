'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui';
import { DashboardStats } from '@/lib/api/dashboard';

interface StatsCardProps {
  title: string;
  value: number;
  previousValue?: number;
  icon: React.ReactNode;
  color: string;
  format?: 'currency' | 'percentage' | 'number';
  trend?: 'up' | 'down' | 'stable';
  change?: number;
  sparkline?: number[];
  isLoading?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  previousValue,
  icon,
  color,
  format = 'currency',
  trend = 'stable',
  change = 0,
  sparkline,
  isLoading = false,
}) => {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }).format(val);
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'number':
        return new Intl.NumberFormat('en-US').format(val);
      default:
        return val.toString();
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case 'down':
        return <ArrowDownRight className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600 dark:text-green-400';
      case 'down':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative p-6 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-white/20 dark:border-gray-700/50 shadow-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-20" />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -4,
        transition: { duration: 0.2 }
      }}
      className="relative p-6 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-white/20 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group"
    >
      {/* Background gradient */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-5 group-hover:opacity-10 transition-opacity duration-300"
        style={{ background: `linear-gradient(135deg, ${color}20, ${color}40)` }}
      />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </h3>
        <div 
          className="p-2 rounded-lg"
          style={{ backgroundColor: `${color}20` }}
        >
          {icon}
        </div>
      </div>

      {/* Value */}
      <div className="mb-2">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-2xl font-bold text-gray-900 dark:text-white"
        >
          {formatValue(value)}
        </motion.div>
      </div>

      {/* Trend */}
      {previousValue !== undefined && change !== 0 && (
        <div className="flex items-center space-x-1">
          {getTrendIcon()}
          <span className={cn("text-sm font-medium", getTrendColor())}>
            {Math.abs(change).toFixed(1)}%
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            vs last month
          </span>
        </div>
      )}

      {/* Sparkline */}
      {sparkline && sparkline.length > 0 && (
        <div className="mt-4 h-8 flex items-end space-x-1">
          {sparkline.map((point, index) => (
            <motion.div
              key={index}
              initial={{ height: 0 }}
              animate={{ height: `${point}%` }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex-1 rounded-sm opacity-60 hover:opacity-100 transition-opacity"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

interface StatsCardsProps {
  stats: DashboardStats;
  isLoading?: boolean;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats, isLoading = false }) => {
  const cards = [
    {
      title: 'Current Balance',
      value: stats.currentBalance,
      icon: <DollarSign className="h-5 w-5" style={{ color: '#3B82F6' }} />,
      color: '#3B82F6',
      format: 'currency' as const,
      sparkline: [20, 35, 45, 60, 55, 70, 85, 90, 75, 80, 95, 100],
    },
    {
      title: 'Monthly Income',
      value: stats.monthlyIncome,
      previousValue: stats.previousMonthIncome,
      icon: <TrendingUp className="h-5 w-5" style={{ color: '#10B981' }} />,
      color: '#10B981',
      format: 'currency' as const,
      trend: (stats.monthlyIncome > stats.previousMonthIncome ? 'up' : 'down') as 'up' | 'down',
      change: stats.previousMonthIncome > 0 
        ? ((stats.monthlyIncome - stats.previousMonthIncome) / stats.previousMonthIncome) * 100 
        : 0,
      sparkline: [30, 40, 35, 50, 45, 60, 55, 70, 65, 80, 75, 90],
    },
    {
      title: 'Monthly Expenses',
      value: stats.monthlyExpenses,
      previousValue: stats.previousMonthExpenses,
      icon: <TrendingDown className="h-5 w-5" style={{ color: '#EF4444' }} />,
      color: '#EF4444',
      format: 'currency' as const,
      trend: (stats.monthlyExpenses < stats.previousMonthExpenses ? 'up' : 'down') as 'up' | 'down',
      change: stats.previousMonthExpenses > 0 
        ? ((stats.monthlyExpenses - stats.previousMonthExpenses) / stats.previousMonthExpenses) * 100 
        : 0,
      sparkline: [80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25],
    },
    {
      title: 'Savings Rate',
      value: stats.savingsRate,
      previousValue: stats.previousMonthSavingsRate,
      icon: <Target className="h-5 w-5" style={{ color: '#8B5CF6' }} />,
      color: '#8B5CF6',
      format: 'percentage' as const,
      trend: (stats.savingsRate > stats.previousMonthSavingsRate ? 'up' : 'down') as 'up' | 'down',
      change: stats.previousMonthSavingsRate > 0 
        ? ((stats.savingsRate - stats.previousMonthSavingsRate) / stats.previousMonthSavingsRate) * 100 
        : 0,
      sparkline: [15, 18, 20, 22, 25, 23, 26, 28, 30, 27, 29, 32],
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <StatsCard
            {...card}
            isLoading={isLoading}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default StatsCards;

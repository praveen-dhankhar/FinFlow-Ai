'use client';

import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui';
import { DashboardStats } from '@/lib/api/dashboard';

interface StatsCardProps {
  title: string;
  value: number;
  previousValue?: number;
  icon: React.ReactNode;
  gradient: string;
  format?: 'currency' | 'percentage' | 'number';
  trend?: 'up' | 'down' | 'stable';
  change?: number;
  sparkline?: number[];
  isLoading?: boolean;
}

const AnimatedCounter: React.FC<{ value: number; format: string }> = ({ value, format }) => {
  const spring = useSpring(0, { duration: 1500 });
  const display = useTransform(spring, (current) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(current);
      case 'percentage':
        return `${current.toFixed(1)}%`;
      case 'number':
        return new Intl.NumberFormat('en-US').format(Math.round(current));
      default:
        return current.toFixed(0);
    }
  });

  const [displayValue, setDisplayValue] = useState('0');

  useEffect(() => {
    spring.set(value);
    const unsubscribe = display.on('change', (latest) => setDisplayValue(latest));
    return () => unsubscribe();
  }, [value, spring, display]);

  return <>{displayValue}</>;
};

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  previousValue,
  icon,
  gradient,
  format = 'currency',
  trend = 'stable',
  change = 0,
  sparkline,
  isLoading = false,
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <ArrowUpRight className="h-4 w-4 text-green-400" />;
      case 'down':
        return <ArrowDownRight className="h-4 w-4 text-red-400" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-400';
      case 'down':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-6 rounded-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>
        <Skeleton className="h-10 w-32 mb-3" />
        <Skeleton className="h-4 w-24" />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -6,
        transition: { duration: 0.2 }
      }}
      className="group relative glass p-6 rounded-2xl hover-lift overflow-hidden"
    >
      {/* Gradient Background Overlay */}
      <div className={`absolute inset-0 ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />

      {/* Gradient Border Effect */}
      <div className={`absolute inset-0 ${gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300`} />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
            {title}
          </h3>
          <motion.div
            className={`p-3 ${gradient} rounded-xl shadow-lg`}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            {icon}
          </motion.div>
        </div>

        {/* Value */}
        <div className="mb-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-bold text-white mb-1"
          >
            <AnimatedCounter value={value} format={format} />
          </motion.div>
        </div>

        {/* Trend */}
        {previousValue !== undefined && change !== 0 && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 mb-4"
          >
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-lg",
              trend === 'up' ? 'bg-green-500/10' : 'bg-red-500/10'
            )}>
              {getTrendIcon()}
              <span className={cn("text-sm font-semibold", getTrendColor())}>
                {Math.abs(change).toFixed(1)}%
              </span>
            </div>
            <span className="text-xs text-gray-500">
              vs last month
            </span>
          </motion.div>
        )}

        {/* Sparkline */}
        {sparkline && sparkline.length > 0 && (
          <div className="mt-6 h-12 flex items-end gap-1">
            {sparkline.map((point, index) => (
              <motion.div
                key={index}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: `${point}%`, opacity: 0.6 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.05 }}
                whileHover={{ opacity: 1, scale: 1.1 }}
                className={`flex-1 ${gradient} rounded-t-sm`}
              />
            ))}
          </div>
        )}
      </div>
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
      icon: <DollarSign className="h-6 w-6 text-white" />,
      gradient: 'gradient-blue',
      format: 'currency' as const,
      sparkline: [20, 35, 45, 60, 55, 70, 85, 90, 75, 80, 95, 100],
    },
    {
      title: 'Monthly Income',
      value: stats.monthlyIncome,
      previousValue: stats.previousMonthIncome,
      icon: <TrendingUp className="h-6 w-6 text-white" />,
      gradient: 'gradient-success',
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
      icon: <TrendingDown className="h-6 w-6 text-white" />,
      gradient: 'gradient-pink',
      format: 'currency' as const,
      trend: (stats.monthlyExpenses < stats.previousMonthExpenses ? 'up' : 'down') as 'up' | 'down',
      change: stats.previousMonthExpenses > 0
        ? Math.abs(((stats.monthlyExpenses - stats.previousMonthExpenses) / stats.previousMonthExpenses) * 100)
        : 0,
      sparkline: [80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25],
    },
    {
      title: 'Savings Rate',
      value: stats.savingsRate,
      previousValue: stats.previousMonthSavingsRate,
      icon: <Target className="h-6 w-6 text-white" />,
      gradient: 'gradient-purple',
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

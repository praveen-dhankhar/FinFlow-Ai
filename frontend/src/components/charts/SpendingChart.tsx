'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Download, FileText, BarChart3, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui';
import { SpendingCategory } from '@/lib/api/dashboard';

interface SpendingChartProps {
  data: SpendingCategory[];
  isLoading?: boolean;
  onCategoryClick?: (category: SpendingCategory) => void;
  onExport?: (format: 'png' | 'csv') => void;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center space-x-2 mb-1">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: data.color }}
          />
          <span className="font-medium text-gray-900 dark:text-white">
            {data.name}
          </span>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <div>Amount: {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(data.amount)}</div>
          <div>Percentage: {data.percentage.toFixed(1)}%</div>
          <div className="flex items-center space-x-1 mt-1">
            <span className="text-xs">Trend:</span>
            <span className={cn(
              "text-xs font-medium",
              data.trend === 'up' ? 'text-red-500' : 
              data.trend === 'down' ? 'text-green-500' : 'text-gray-500'
            )}>
              {data.trend === 'up' ? '↗' : data.trend === 'down' ? '↘' : '→'} {Math.abs(data.change).toFixed(1)}%
            </span>
          </div>
        </div>
      </motion.div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center mt-4">
      {payload?.map((entry: any, index: number) => (
        <motion.div
          key={entry.value}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-2 py-1 rounded-lg transition-colors"
        >
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {entry.value}
          </span>
        </motion.div>
      ))}
    </div>
  );
};

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-64 text-center">
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.2 }}
      className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4"
    >
      <BarChart3 className="h-8 w-8 text-gray-400" />
    </motion.div>
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
      No spending data
    </h3>
    <p className="text-gray-500 dark:text-gray-400 mb-4">
      Start adding transactions to see your spending breakdown
    </p>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      Add Transaction
    </motion.button>
  </div>
);

const SpendingChart: React.FC<SpendingChartProps> = ({
  data,
  isLoading = false,
  onCategoryClick,
  onExport,
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const handleCategoryClick = useCallback((category: SpendingCategory) => {
    if (onCategoryClick) {
      onCategoryClick(category);
    }
  }, [onCategoryClick]);

  const handleExport = useCallback((format: 'png' | 'csv') => {
    if (onExport) {
      onExport(format);
    }
  }, [onExport]);

  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-white/20 dark:border-gray-700/50 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-32" />
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <Skeleton className="h-48 w-48 rounded-full" />
        </div>
        <div className="flex justify-center mt-4">
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-white/20 dark:border-gray-700/50 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Spending by Category
          </h2>
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              onClick={() => handleExport('png')}
            >
              <Download className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              onClick={() => handleExport('csv')}
            >
              <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </motion.button>
          </div>
        </div>
        <EmptyState />
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
          Spending by Category
        </h2>
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            onClick={() => handleExport('png')}
            title="Export as PNG"
          >
            <Download className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            onClick={() => handleExport('csv')}
            title="Export as CSV"
          >
            <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </motion.button>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={2}
              dataKey="amount"
              onMouseEnter={(data) => setHoveredCategory(data?.name)}
              onMouseLeave={() => setHoveredCategory(null)}
              onClick={handleCategoryClick}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke={hoveredCategory === entry.name ? entry.color : 'transparent'}
                  strokeWidth={hoveredCategory === entry.name ? 3 : 0}
                  style={{
                    filter: hoveredCategory === entry.name ? 'brightness(1.1)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {data.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Categories
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <CustomLegend payload={data.map(item => ({
        value: item.name,
        color: item.color,
      }))} />

      {/* Category details */}
      <AnimatePresence>
        {hoveredCategory && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            {(() => {
              const category = data.find(item => item.name === hoveredCategory);
              if (!category) return null;
              
              return (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {category.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(category.amount)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {category.percentage.toFixed(1)}% of total
                    </div>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SpendingChart;

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
        className="glass-strong p-4 border border-white/10 shadow-xl backdrop-blur-xl"
      >
        <div className="flex items-center space-x-3 mb-2">
          <div
            className="w-3 h-3 rounded-full shadow-lg"
            style={{ backgroundColor: data.color, boxShadow: `0 0 10px ${data.color}` }}
          />
          <span className="font-semibold text-white">
            {data.name}
          </span>
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-bold text-white">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(data.amount)}
          </div>
          <div className="text-sm text-gray-400">
            {data.percentage.toFixed(1)}% of total spending
          </div>
          <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-white/10">
            <span className="text-xs text-gray-400">Trend:</span>
            <span className={cn(
              "text-xs font-semibold px-2 py-0.5 rounded-full",
              data.trend === 'up' ? 'bg-red-500/20 text-red-400' :
                data.trend === 'down' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
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
    <div className="flex flex-wrap gap-3 justify-center mt-6">
      {payload?.map((entry: any, index: number) => (
        <motion.div
          key={entry.value}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center space-x-2 cursor-pointer hover:bg-white/5 px-3 py-1.5 rounded-full transition-colors border border-transparent hover:border-white/10"
        >
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color, boxShadow: `0 0 8px ${entry.color}40` }}
          />
          <span className="text-sm font-medium text-gray-300">
            {entry.value}
          </span>
        </motion.div>
      ))}
    </div>
  );
};

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-72 text-center">
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.2, type: "spring" }}
      className="w-20 h-20 glass flex items-center justify-center mb-6 rounded-2xl"
    >
      <BarChart3 className="h-10 w-10 text-gray-400" />
    </motion.div>
    <h3 className="text-xl font-semibold text-white mb-2">
      No spending data
    </h3>
    <p className="text-gray-400 mb-6 max-w-xs">
      Start adding transactions to see your spending breakdown visualized here
    </p>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="px-6 py-2.5 gradient-primary text-white rounded-xl font-medium shadow-lg hover:shadow-purple-500/25 transition-all"
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
      <div className="glass p-8 h-full">
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-8 w-48" />
          <div className="flex space-x-2">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-9 w-9 rounded-lg" />
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <Skeleton className="h-56 w-56 rounded-full" />
        </div>
        <div className="flex justify-center mt-6 gap-3">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="glass p-8 h-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            Spending by Category
          </h2>
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              onClick={() => handleExport('png')}
            >
              <Download className="h-4 w-4 text-gray-400" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              onClick={() => handleExport('csv')}
            >
              <FileText className="h-4 w-4 text-gray-400" />
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
      className="glass p-8 h-full relative overflow-hidden group"
    >
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -z-10 group-hover:bg-purple-500/10 transition-colors duration-500" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10 group-hover:bg-blue-500/10 transition-colors duration-500" />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">
            Spending Breakdown
          </h2>
          <p className="text-sm text-gray-400">
            Distribution by category
          </p>
        </div>
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 transition-colors"
            onClick={() => handleExport('png')}
            title="Export as PNG"
          >
            <Download className="h-4 w-4 text-gray-300" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 transition-colors"
            onClick={() => handleExport('csv')}
            title="Export as CSV"
          >
            <FileText className="h-4 w-4 text-gray-300" />
          </motion.button>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={130}
              paddingAngle={4}
              dataKey="amount"
              onMouseEnter={(data) => setHoveredCategory(data?.name)}
              onMouseLeave={() => setHoveredCategory(null)}
              onClick={handleCategoryClick}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke={hoveredCategory === entry.name ? 'rgba(255,255,255,0.5)' : 'transparent'}
                  strokeWidth={hoveredCategory === entry.name ? 4 : 0}
                  className="transition-all duration-300 cursor-pointer"
                  style={{
                    filter: hoveredCategory === entry.name ? 'brightness(1.2) drop-shadow(0 0 10px rgba(255,255,255,0.3))' : 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))',
                    transform: hoveredCategory === entry.name ? 'scale(1.05)' : 'scale(1)',
                    transformOrigin: 'center',
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            key={hoveredCategory || 'total'}
          >
            {hoveredCategory ? (
              <>
                <div className="text-3xl font-bold text-white mb-1">
                  {((data.find(d => d.name === hoveredCategory)?.percentage) || 0).toFixed(0)}%
                </div>
                <div className="text-sm font-medium text-gray-400">
                  {hoveredCategory}
                </div>
              </>
            ) : (
              <>
                <div className="text-3xl font-bold text-white mb-1">
                  {data.length}
                </div>
                <div className="text-sm font-medium text-gray-400">
                  Categories
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>

      {/* Legend */}
      <CustomLegend payload={data.map(item => ({
        value: item.name,
        color: item.color,
      }))} />
    </motion.div>
  );
};

export default SpendingChart;

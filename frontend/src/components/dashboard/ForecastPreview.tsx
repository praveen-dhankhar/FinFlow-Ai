'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Area,
  AreaChart,
  Tooltip,
} from 'recharts';
import { TrendingUp, BarChart3, ChevronRight, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui';
import { ForecastData } from '@/lib/api/dashboard';

interface ForecastPreviewProps {
  data: ForecastData[];
  isLoading?: boolean;
  onViewFull?: () => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="text-sm">
          <div className="font-medium text-gray-900 dark:text-white mb-1">
            {new Date(label).toLocaleDateString('en-US', {
              month: 'short',
              year: 'numeric',
            })}
          </div>
          <div className="text-blue-600 dark:text-blue-400">
            Predicted: {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(data.predictedAmount)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Confidence: {(data.confidence * 100).toFixed(0)}%
          </div>
        </div>
      </motion.div>
    );
  }
  return null;
};

const EmptyState = ({ onViewFull }: { onViewFull?: () => void }) => (
  <div className="flex flex-col items-center justify-center py-8 text-center">
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.2 }}
      className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3"
    >
      <BarChart3 className="h-6 w-6 text-gray-400" />
    </motion.div>
    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
      No forecast data
    </h3>
    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
      Add more transactions to generate forecasts
    </p>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onViewFull}
      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
    >
      View Forecasts
    </motion.button>
  </div>
);

const ForecastPreview: React.FC<ForecastPreviewProps> = ({
  data,
  isLoading = false,
  onViewFull,
}) => {
  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-white/20 dark:border-gray-700/50 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-32 w-full rounded-lg mb-4" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-white/20 dark:border-gray-700/50 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Forecast Preview
          </h2>
        </div>
        <EmptyState onViewFull={onViewFull} />
      </div>
    );
  }

  // Calculate trend
  const firstValue = data[0]?.predictedAmount || 0;
  const lastValue = data[data.length - 1]?.predictedAmount || 0;
  const trend = lastValue > firstValue ? 'up' : lastValue < firstValue ? 'down' : 'stable';
  const trendPercentage = firstValue > 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;

  // Calculate average confidence
  const avgConfidence = data.reduce((sum, item) => sum + item.confidence, 0) / data.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-white/20 dark:border-gray-700/50 shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Forecast Preview
          </h2>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onViewFull}
          className="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          <span>View full</span>
          <ChevronRight className="h-4 w-4" />
        </motion.button>
      </div>

      {/* Chart */}
      <div className="h-32 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="predictedAmount"
              stroke="#3B82F6"
              strokeWidth={2}
              fill="url(#forecastGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400">Trend</div>
            <div className={cn(
              "text-sm font-semibold flex items-center space-x-1",
              trend === 'up' ? "text-green-600 dark:text-green-400" :
              trend === 'down' ? "text-red-600 dark:text-red-400" :
              "text-gray-600 dark:text-gray-400"
            )}>
              <span>
                {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
              </span>
              <span>{Math.abs(trendPercentage).toFixed(1)}%</span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400">Confidence</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {(avgConfidence * 100).toFixed(0)}%
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500 dark:text-gray-400">Next 3 months</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(lastValue)}
          </div>
        </div>
      </div>

      {/* Confidence indicator */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
          <span>Model Confidence</span>
          <span>{(avgConfidence * 100).toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${avgConfidence * 100}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            className={cn(
              "h-2 rounded-full",
              avgConfidence > 0.8 ? "bg-green-500" :
              avgConfidence > 0.6 ? "bg-yellow-500" :
              "bg-red-500"
            )}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default ForecastPreview;

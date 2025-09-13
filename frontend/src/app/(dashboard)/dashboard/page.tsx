'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { useDashboardData, useRefreshDashboard, usePullToRefresh } from '@/hooks/useDashboard';
import { mockDashboardData } from '@/lib/api/dashboard';
import StatsCards from '@/components/dashboard/StatsCards';
import SpendingChart from '@/components/charts/SpendingChart';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import ForecastPreview from '@/components/dashboard/ForecastPreview';
import QuickActions from '@/components/dashboard/QuickActions';
import { Skeleton } from '@/components/ui';
import { cn } from '@/lib/utils';

const DashboardPage: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  // Use mock data for now (replace with real API calls later)
  const { data: dashboardData, isLoading, error, refetch } = useDashboardData(false);
  const refreshMutation = useRefreshDashboard();
  const { handlePullToRefresh, isRefreshing } = usePullToRefresh();

  // Use mock data when not loading from API
  const data = dashboardData || mockDashboardData;

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (isOnline) {
      const interval = setInterval(() => {
        refetch();
        setLastRefresh(new Date());
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isOnline, refetch]);

  // Pull to refresh
  useEffect(() => {
    let startY = 0;
    let currentY = 0;
    let isPulling = false;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      isPulling = window.scrollY === 0;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling) return;
      
      currentY = e.touches[0].clientY;
      const pullDistance = currentY - startY;
      
      if (pullDistance > 100) {
        handlePullToRefresh();
        isPulling = false;
      }
    };

    const handleTouchEnd = () => {
      isPulling = false;
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handlePullToRefresh]);

  const handleRefresh = () => {
    refreshMutation.mutate();
    setLastRefresh(new Date());
  };

  const handleCategoryClick = (category: any) => {
    console.log('Category clicked:', category);
    // Navigate to category details or filter transactions
  };

  const handleExportChart = (format: 'png' | 'csv') => {
    console.log('Export chart as:', format);
    // Implement chart export functionality
  };

  const handleTransactionAction = (action: string, transaction: any) => {
    console.log(`${action} transaction:`, transaction);
    // Implement transaction actions
  };

  const handleQuickAction = (action: string) => {
    console.log('Quick action:', action);
    // Implement quick actions
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Failed to load dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error.message || 'Something went wrong while loading your dashboard data.'}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => refetch()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Dashboard
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isOnline ? 'All systems operational' : 'You are offline'}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {/* Connection status */}
              <div className="flex items-center space-x-2">
                {isOnline ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>

              {/* Last refresh */}
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </div>

              {/* Refresh button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                disabled={refreshMutation.isPending || isRefreshing}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  refreshMutation.isPending || isRefreshing
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-400"
                    : "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/30"
                )}
              >
                <RefreshCw 
                  className={cn(
                    "h-4 w-4",
                    (refreshMutation.isPending || isRefreshing) && "animate-spin"
                  )} 
                />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <StatsCards 
              stats={data.stats} 
              isLoading={isLoading} 
            />
          </motion.div>

          {/* Charts and Transactions Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Spending Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <SpendingChart
                data={data.spendingCategories}
                isLoading={isLoading}
                onCategoryClick={handleCategoryClick}
                onExport={handleExportChart}
              />
            </motion.div>

            {/* Recent Transactions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <RecentTransactions
                transactions={data.recentTransactions}
                isLoading={isLoading}
                onEdit={(transaction) => handleTransactionAction('edit', transaction)}
                onDelete={(transaction) => handleTransactionAction('delete', transaction)}
                onView={(transaction) => handleTransactionAction('view', transaction)}
                onViewAll={() => console.log('View all transactions')}
              />
            </motion.div>
          </div>

          {/* Forecast Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <ForecastPreview
              data={data.forecastData}
              isLoading={isLoading}
              onViewFull={() => console.log('View full forecast')}
            />
          </motion.div>
        </div>
      </div>

      {/* Quick Actions FAB */}
      <QuickActions
        onAddTransaction={() => handleQuickAction('add-transaction')}
        onAddIncome={() => handleQuickAction('add-income')}
        onSetGoal={() => handleQuickAction('set-goal')}
        onExportData={() => handleQuickAction('export-data')}
      />

      {/* Pull to refresh indicator */}
      <AnimatePresence>
        {isRefreshing && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white py-2 text-center text-sm"
          >
            <RefreshCw className="h-4 w-4 animate-spin inline mr-2" />
            Refreshing dashboard...
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardPage;
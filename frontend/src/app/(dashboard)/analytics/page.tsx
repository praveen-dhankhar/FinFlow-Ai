'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Target, 
  PieChart, 
  FileText,
  Download,
  Settings,
  Filter,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { subMonths, addMonths, format } from 'date-fns';
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Skeleton,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui';
import { SpendingTrends } from '@/components/analytics/SpendingTrends';
import { IncomeAnalysis } from '@/components/analytics/IncomeAnalysis';
import { SavingsTracker } from '@/components/analytics/SavingsTracker';
import { BudgetPerformance } from '@/components/analytics/BudgetPerformance';
import { CustomReports } from '@/components/analytics/CustomReports';
import {
  useAnalyticsSummary,
  useSpendingTrends,
  useIncomeAnalysis,
  useSavingsGoals,
  useBudgetPerformance,
  useExportAnalytics,
} from '@/hooks/useAnalytics';
import { cn } from '@/lib/utils';

// Simple ErrorBoundary component
const ErrorBoundary: React.FC<{ 
  FallbackComponent: React.FC<{ error: Error; resetErrorBoundary: () => void }>;
  children: React.ReactNode;
}> = ({ FallbackComponent, children }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  if (hasError && error) {
    return <FallbackComponent error={error} resetErrorBoundary={() => setHasError(false)} />;
  }

  return <>{children}</>;
};

// Error Fallback Component
const ErrorFallback: React.FC<{ error: Error; resetErrorBoundary: () => void }> = ({
  error,
  resetErrorBoundary,
}) => (
  <Card className="h-[400px] flex items-center justify-center">
    <CardBody className="text-center space-y-4">
      <div className="text-red-500 text-6xl">⚠️</div>
      <div>
        <h3 className="text-lg font-semibold text-foreground">Something went wrong</h3>
        <p className="text-muted-foreground mt-2">{error.message}</p>
      </div>
      <Button onClick={resetErrorBoundary} variant="outline">
        Try again
      </Button>
    </CardBody>
  </Card>
);

export default function AnalyticsPage() {
  // State management
  const [startDate, setStartDate] = useState<Date>(subMonths(new Date(), 6));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [granularity, setGranularity] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [comparePeriod, setComparePeriod] = useState<boolean>(false);

  // API hooks
  const { data: summary, isLoading: summaryLoading } = useAnalyticsSummary({
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  });

  const { data: spendingTrends = [], isLoading: trendsLoading } = useSpendingTrends({
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    categories: selectedCategories.length > 0 ? selectedCategories : undefined,
    granularity,
  });

  const { data: incomeData, isLoading: incomeLoading } = useIncomeAnalysis({
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  });

  const { data: savingsGoals = [], isLoading: savingsLoading } = useSavingsGoals();

  const { data: budgetPerformance = [], isLoading: budgetLoading } = useBudgetPerformance({
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    categories: selectedCategories.length > 0 ? selectedCategories : undefined,
  });

  const exportAnalytics = useExportAnalytics();

  // Handlers
  const handleDateRangeChange = useCallback((newStartDate: Date, newEndDate: Date) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  }, []);

  const handleCategoryToggle = useCallback((categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  }, []);

  const handleExport = useCallback(async (format: 'csv' | 'json' | 'pdf') => {
    await exportAnalytics.mutateAsync({
      format,
      filters: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        categories: selectedCategories.length > 0 ? selectedCategories : undefined,
        granularity,
      },
    });
  }, [exportAnalytics, startDate, endDate, selectedCategories, granularity]);

  const handleRefresh = useCallback(() => {
    // Trigger refetch of all queries
    window.location.reload();
  }, []);

  // Loading state
  const isLoading = summaryLoading || trendsLoading || incomeLoading || savingsLoading || budgetLoading;

  // Memoized period comparison dates
  const comparisonDates = useMemo(() => {
    if (!comparePeriod) return null;
    const periodLength = endDate.getTime() - startDate.getTime();
    return {
      start: new Date(startDate.getTime() - periodLength),
      end: new Date(endDate.getTime() - periodLength),
    };
  }, [startDate, endDate, comparePeriod]);

  return (
    <div className="min-h-full bg-background">
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
              <p className="text-muted-foreground">
                Comprehensive insights into your financial patterns and performance
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
                <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                Refresh
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExport('csv')}>
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('json')}>
                    Export as JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('pdf')}>
                    Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          {/* Filter Bar */}
          <Card className="mb-6">
            <CardBody className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Filters:</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {format(startDate, 'MMM dd, yyyy')} - {format(endDate, 'MMM dd, yyyy')}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Granularity:</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        {granularity.charAt(0).toUpperCase() + granularity.slice(1)}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setGranularity('daily')}>
                        Daily
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setGranularity('weekly')}>
                        Weekly
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setGranularity('monthly')}>
                        Monthly
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant={comparePeriod ? "default" : "outline"}
                    size="sm"
                    onClick={() => setComparePeriod(!comparePeriod)}
                  >
                    Compare Period
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardBody className="p-6">
                {summaryLoading ? (
                  <Skeleton className="h-16 w-full" />
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Spending</p>
                      <p className="text-2xl font-bold text-foreground">
                        ${summary?.totalSpending?.toLocaleString() || '0'}
                      </p>
                    </div>
                    <div className="p-3 bg-red-100 rounded-full">
                      <TrendingUp className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-6">
                {summaryLoading ? (
                  <Skeleton className="h-16 w-full" />
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Income</p>
                      <p className="text-2xl font-bold text-foreground">
                        ${summary?.totalIncome?.toLocaleString() || '0'}
                      </p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-6">
                {summaryLoading ? (
                  <Skeleton className="h-16 w-full" />
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Net Savings</p>
                      <p className="text-2xl font-bold text-foreground">
                        ${summary?.netSavings?.toLocaleString() || '0'}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Target className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-6">
                {summaryLoading ? (
                  <Skeleton className="h-16 w-full" />
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Savings Rate</p>
                      <p className="text-2xl font-bold text-foreground">
                        {summary?.savingsRate?.toFixed(1) || '0'}%
                      </p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <PieChart className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="spending" className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Spending</span>
              </TabsTrigger>
              <TabsTrigger value="income" className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span>Income</span>
              </TabsTrigger>
              <TabsTrigger value="savings" className="flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>Savings</span>
              </TabsTrigger>
              <TabsTrigger value="budget" className="flex items-center space-x-2">
                <PieChart className="h-4 w-4" />
                <span>Budget</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                  <SpendingTrends
                    data={spendingTrends}
                    isLoading={trendsLoading}
                    startDate={startDate}
                    endDate={endDate}
                    comparisonDates={comparisonDates}
                  />
                </ErrorBoundary>
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                  <IncomeAnalysis
                    data={incomeData}
                    isLoading={incomeLoading}
                    startDate={startDate}
                    endDate={endDate}
                  />
                </ErrorBoundary>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                  <SavingsTracker
                    goals={savingsGoals}
                    isLoading={savingsLoading}
                    summary={summary}
                  />
                </ErrorBoundary>
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                  <BudgetPerformance
                    data={budgetPerformance}
                    isLoading={budgetLoading}
                    startDate={startDate}
                    endDate={endDate}
                  />
                </ErrorBoundary>
              </div>
            </TabsContent>

            <TabsContent value="spending" className="space-y-6">
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <SpendingTrends
                  data={spendingTrends}
                  isLoading={trendsLoading}
                  startDate={startDate}
                  endDate={endDate}
                  comparisonDates={comparisonDates}
                  showDetails={true}
                />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="income" className="space-y-6">
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <IncomeAnalysis
                  data={incomeData}
                  isLoading={incomeLoading}
                  startDate={startDate}
                  endDate={endDate}
                  showDetails={true}
                />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="savings" className="space-y-6">
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <SavingsTracker
                  goals={savingsGoals}
                  isLoading={savingsLoading}
                  summary={summary}
                  showDetails={true}
                />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="budget" className="space-y-6">
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <BudgetPerformance
                  data={budgetPerformance}
                  isLoading={budgetLoading}
                  startDate={startDate}
                  endDate={endDate}
                  showDetails={true}
                />
              </ErrorBoundary>
            </TabsContent>
          </Tabs>

          {/* Custom Reports Section */}
          <div className="mt-8">
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <CustomReports
                startDate={startDate}
                endDate={endDate}
                selectedCategories={selectedCategories}
              />
            </ErrorBoundary>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

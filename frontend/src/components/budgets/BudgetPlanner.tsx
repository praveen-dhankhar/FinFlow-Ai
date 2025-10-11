'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { format, differenceInDays } from 'date-fns';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import {
  DollarSign,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Target,
  Edit,
  Plus,
  Trash2,
  MoreVertical,
  Wallet,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Skeleton,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui';
import { Budget, BudgetCategory, BudgetInsight } from '@/lib/api/budgets';
import { cn } from '@/lib/utils';

interface BudgetPlannerProps {
  budget: Budget | null;
  insights?: BudgetInsight;
  onEditCategory?: (categoryId: string) => void;
  onAddCategory?: () => void;
  onDeleteCategory?: (categoryId: string) => void;
  onUpdateBudget?: (updates: any) => void;
  isLoading?: boolean;
}

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'];

const CustomTooltip: React.FC<{ active?: boolean; payload?: any[]; label?: string }> = ({ 
  active, 
  payload, 
  label 
}) => {
  if (active && payload && payload.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-3 bg-popover text-popover-foreground rounded-md shadow-lg border border-border text-sm min-w-[200px]"
      >
        <p className="font-semibold mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.dataKey}:</span>
            </div>
            <span className="font-medium">${entry.value?.toLocaleString()}</span>
          </div>
        ))}
      </motion.div>
    );
  }
  return null;
};

const BudgetPlanner: React.FC<BudgetPlannerProps> = ({
  budget,
  insights,
  onEditCategory,
  onAddCategory,
  onDeleteCategory,
  onUpdateBudget,
  isLoading = false,
}) => {
  const [viewMode, setViewMode] = useState<'overview' | 'categories' | 'chart'>('overview');

  // Process data for charts
  const chartData = useMemo(() => {
    if (!budget?.categories) return [];

    return budget.categories.map((category, index) => ({
      ...category,
      color: COLORS[index % COLORS.length],
      spentPercentage: category.budgetedAmount > 0 ? (category.spentAmount / category.budgetedAmount) * 100 : 0,
    }));
  }, [budget?.categories]);

  // Calculate budget metrics
  const budgetMetrics = useMemo(() => {
    if (!budget || !insights) return null;

    const daysRemaining = differenceInDays(new Date(budget.endDate), new Date());
    const totalDays = differenceInDays(new Date(budget.endDate), new Date(budget.startDate));
    const daysElapsed = totalDays - daysRemaining;
    const dailyBudget = budget.totalAmount / totalDays;
    const expectedSpent = dailyBudget * daysElapsed;
    const spendingRate = insights.totalSpent / Math.max(daysElapsed, 1);

    return {
      daysRemaining,
      totalDays,
      daysElapsed,
      dailyBudget,
      expectedSpent,
      spendingRate,
      projectedTotal: spendingRate * totalDays,
      isOnTrack: insights.totalSpent <= expectedSpent,
    };
  }, [budget, insights]);

  // Get status color
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'over':
        return 'text-red-600 bg-red-100';
      case 'under':
        return 'text-green-600 bg-green-100';
      case 'on-target':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }, []);

  if (isLoading) {
    return (
      <Card className="h-96">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardBody>
          <Skeleton className="h-80 w-full" />
        </CardBody>
      </Card>
    );
  }

  if (!budget) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <CardBody className="text-center space-y-4">
          <Wallet className="h-12 w-12 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No Budget Set</h3>
            <p className="text-muted-foreground mb-4">
              Create a budget to start tracking your spending and managing your finances.
            </p>
            <Button onClick={onAddCategory}>
              <Plus className="h-4 w-4 mr-2" />
              Create Budget
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Budget Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{budget.name}</h3>
            <p className="text-sm text-muted-foreground">
              {format(new Date(budget.startDate), 'MMM dd')} - {format(new Date(budget.endDate), 'MMM dd, yyyy')}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {viewMode === 'overview' && <Target className="h-4 w-4 mr-2" />}
                  {viewMode === 'categories' && <PieChartIcon className="h-4 w-4 mr-2" />}
                  {viewMode === 'chart' && <TrendingUp className="h-4 w-4 mr-2" />}
                  {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setViewMode('overview')}>
                  <Target className="h-4 w-4 mr-2" />
                  Overview
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode('categories')}>
                  <PieChartIcon className="h-4 w-4 mr-2" />
                  Categories
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode('chart')}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Chart
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          {/* Budget Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <DollarSign className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-sm text-muted-foreground">Total Budget</p>
              <p className="font-semibold">${budget.totalAmount.toLocaleString()}</p>
            </div>
            
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <TrendingDown className="h-4 w-4 text-red-500" />
              </div>
              <p className="text-sm text-muted-foreground">Spent</p>
              <p className="font-semibold">${insights?.totalSpent.toLocaleString() || '0'}</p>
            </div>
            
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className="font-semibold">${insights?.totalRemaining.toLocaleString() || '0'}</p>
            </div>
            
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Calendar className="h-4 w-4 text-purple-500" />
              </div>
              <p className="text-sm text-muted-foreground">Days Left</p>
              <p className="font-semibold">{budgetMetrics?.daysRemaining || 0}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Budget Progress</span>
              <span className="font-medium">
                {insights ? ((insights.totalSpent / budget.totalAmount) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div
                className="h-3 rounded-full transition-all duration-500"
                style={{ 
                  backgroundColor: insights && insights.totalSpent > budget.totalAmount ? '#EF4444' : '#3B82F6',
                  width: `${Math.min(insights ? (insights.totalSpent / budget.totalAmount) * 100 : 0, 100)}%`
                }}
                initial={{ width: 0 }}
                animate={{ 
                  width: `${Math.min(insights ? (insights.totalSpent / budget.totalAmount) * 100 : 0, 100)}%`
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Main Content */}
      {viewMode === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-foreground">Category Breakdown</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              {budget.categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color || '#3B82F6' }}
                    />
                    <div>
                      <p className="font-medium">{category.categoryName}</p>
                      <p className="text-sm text-muted-foreground">
                        ${category.spentAmount.toLocaleString()} of ${category.budgetedAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      category.spentAmount > category.budgetedAmount ? "text-red-600 bg-red-100" :
                      category.spentAmount > category.budgetedAmount * 0.9 ? "text-yellow-600 bg-yellow-100" :
                      "text-green-600 bg-green-100"
                    )}>
                      {category.spentAmount > category.budgetedAmount ? 'Over' :
                       category.spentAmount > category.budgetedAmount * 0.9 ? 'Near Limit' : 'Good'}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEditCategory?.(category.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onDeleteCategory?.(category.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
              <Button onClick={onAddCategory} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </CardBody>
          </Card>

          {/* Budget Insights */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-foreground">Budget Insights</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              {insights && (
                <>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Overspent Categories:</span>
                      <span className="font-medium text-red-600">{insights.overspentCategories}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Under-spent Categories:</span>
                      <span className="font-medium text-green-600">{insights.underSpentCategories}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Daily Spending Rate:</span>
                      <span className="font-medium">${insights.averageSpendingRate.toFixed(2)}</span>
                    </div>
                  </div>

                  {insights.projectedOverspend && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <div>
                          <p className="font-medium text-red-800">Projected Overspend</p>
                          <p className="text-sm text-red-700">
                            You&apos;re on track to exceed your budget by ${insights.projectedOverspendAmount?.toLocaleString()}.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {budgetMetrics && !budgetMetrics.isOnTrack && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <div>
                          <p className="font-medium text-yellow-800">Spending Ahead of Schedule</p>
                          <p className="text-sm text-yellow-700">
                            You've spent ${(insights.totalSpent - budgetMetrics.expectedSpent).toLocaleString()} more than expected.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {budgetMetrics && budgetMetrics.isOnTrack && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="font-medium text-green-800">On Track</p>
                          <p className="text-sm text-green-700">
                            You&apos;re spending within your budget expectations.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      {viewMode === 'categories' && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-foreground">Budget Distribution</h3>
          </CardHeader>
          <CardBody>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ categoryName, percentage }) => `${categoryName}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="budgetedAmount"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      )}

      {viewMode === 'chart' && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-foreground">Budget vs Actual</h3>
          </CardHeader>
          <CardBody>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis 
                    dataKey="categoryName" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="budgetedAmount" fill="hsl(var(--muted-foreground))" name="Budgeted" />
                  <Bar dataKey="spentAmount" fill="hsl(var(--primary))" name="Spent" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      )}
    </motion.div>
  );
};

export default BudgetPlanner;

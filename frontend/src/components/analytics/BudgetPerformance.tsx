'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, ComposedChart, Area, AreaChart
} from 'recharts';
import { format } from 'date-fns';
import { 
  PieChart as PieChartIcon, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Target,
  Lightbulb,
  Calendar,
  Activity
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Badge,
  Skeleton,
  Progress,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui';
import { BudgetPerformance as BudgetPerformanceType } from '@/lib/api/analytics';
import { cn } from '@/lib/utils';

interface BudgetPerformanceProps {
  data: BudgetPerformanceType[];
  isLoading: boolean;
  startDate: Date;
  endDate: Date;
  showDetails?: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

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
        {payload[0]?.payload?.recommendations && payload[0].payload.recommendations.length > 0 && (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
            <div className="flex items-center space-x-1 text-blue-700 mb-1">
              <Lightbulb className="h-3 w-3" />
              <span className="font-medium">Recommendations</span>
            </div>
            <ul className="text-blue-600 space-y-1">
              {payload[0].payload.recommendations.slice(0, 2).map((rec: string, i: number) => (
                <li key={i} className="text-xs">• {rec}</li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>
    );
  }
  return null;
};

const BudgetPerformance: React.FC<BudgetPerformanceProps> = ({
  data,
  isLoading,
  startDate,
  endDate,
  showDetails = false,
}) => {
  const [viewMode, setViewMode] = useState<'overview' | 'variance' | 'trends'>('overview');
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [sortBy, setSortBy] = useState<'variance' | 'amount' | 'category'>('variance');

  // Process data for charts
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const sortedData = [...data].sort((a, b) => {
      switch (sortBy) {
        case 'variance':
          return Math.abs(b.variance) - Math.abs(a.variance);
        case 'amount':
          return b.actualAmount - a.actualAmount;
        case 'category':
          return a.categoryName.localeCompare(b.categoryName);
        default:
          return 0;
      }
    });

    return sortedData.map((item, index) => ({
      ...item,
      color: COLORS[index % COLORS.length],
      varianceAbs: Math.abs(item.variance),
      efficiency: item.budgetedAmount > 0 ? (item.actualAmount / item.budgetedAmount) * 100 : 0,
    }));
  }, [data, sortBy]);

  // Calculate insights
  const insights = useMemo(() => {
    if (!data || data.length === 0) return null;

    const totalBudgeted = data.reduce((sum, item) => sum + item.budgetedAmount, 0);
    const totalActual = data.reduce((sum, item) => sum + item.actualAmount, 0);
    const totalVariance = totalActual - totalBudgeted;

    const overBudget = data.filter(item => item.status === 'over').length;
    const underBudget = data.filter(item => item.status === 'under').length;
    const onTarget = data.filter(item => item.status === 'on-target').length;

    const improving = data.filter(item => item.trend === 'improving').length;
    const declining = data.filter(item => item.trend === 'declining').length;
    const stable = data.filter(item => item.trend === 'stable').length;

    const biggestVariance = data.reduce((max, item) => 
      Math.abs(item.variance) > Math.abs(max.variance) ? item : max, data[0]
    );

    const averageEfficiency = data.reduce((sum, item) => 
      sum + (item.budgetedAmount > 0 ? (item.actualAmount / item.budgetedAmount) * 100 : 0), 0
    ) / data.length;

    return {
      totalBudgeted,
      totalActual,
      totalVariance,
      overBudget,
      underBudget,
      onTarget,
      improving,
      declining,
      stable,
      biggestVariance,
      averageEfficiency,
      totalCategories: data.length,
    };
  }, [data]);

  // Get status color
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'under': return 'text-green-600 bg-green-100';
      case 'over': return 'text-red-600 bg-red-100';
      case 'on-target': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }, []);

  // Get trend color
  const getTrendColor = useCallback((trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600';
      case 'declining': return 'text-red-600';
      case 'stable': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  }, []);

  // Get trend icon
  const getTrendIcon = useCallback((trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4" />;
      case 'declining': return <TrendingDown className="h-4 w-4" />;
      case 'stable': return <Activity className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
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

  if (!data || data.length === 0) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <CardBody className="text-center">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Budget Data</h3>
          <p className="text-muted-foreground">
            No budget performance data available for the selected period.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Budget Performance</h3>
            <p className="text-sm text-muted-foreground">
              Compare your actual spending against budgeted amounts
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {viewMode === 'overview' && <BarChart3 className="h-4 w-4 mr-2" />}
                  {viewMode === 'variance' && <TrendingUp className="h-4 w-4 mr-2" />}
                  {viewMode === 'trends' && <Activity className="h-4 w-4 mr-2" />}
                  {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setViewMode('overview')}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Overview
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode('variance')}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Variance
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode('trends')}>
                  <Activity className="h-4 w-4 mr-2" />
                  Trends
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Sort: {sortBy}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy('variance')}>
                  By Variance
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('amount')}>
                  By Amount
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('category')}>
                  By Category
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          {/* Summary Stats */}
          {insights && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <DollarSign className="h-4 w-4 text-blue-500" />
                </div>
                <p className="text-sm text-muted-foreground">Total Variance</p>
                <p className={cn(
                  "font-semibold",
                  insights.totalVariance > 0 ? "text-red-600" : "text-green-600"
                )}>
                  {insights.totalVariance > 0 ? '+' : ''}${insights.totalVariance.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {((insights.totalVariance / insights.totalBudgeted) * 100).toFixed(1)}%
                </p>
              </div>
              
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-sm text-muted-foreground">On Target</p>
                <p className="font-semibold">{insights.onTarget}</p>
                <p className="text-xs text-muted-foreground">
                  of {insights.totalCategories} categories
                </p>
              </div>
              
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </div>
                <p className="text-sm text-muted-foreground">Over Budget</p>
                <p className="font-semibold">{insights.overBudget}</p>
                <p className="text-xs text-muted-foreground">categories</p>
              </div>
              
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <Target className="h-4 w-4 text-purple-500" />
                </div>
                <p className="text-sm text-muted-foreground">Efficiency</p>
                <p className="font-semibold">{insights.averageEfficiency.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">average</p>
              </div>
            </div>
          )}

          {/* Chart Section */}
          <div className="h-80">
            {viewMode === 'overview' && (
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                  <ComposedChart data={chartData}>
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
                    <Bar dataKey="actualAmount" fill="hsl(var(--primary))" name="Actual" />
                  </ComposedChart>
                ) : chartType === 'line' ? (
                  <LineChart data={chartData}>
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
                    <Line 
                      type="monotone" 
                      dataKey="budgetedAmount" 
                      stroke="hsl(var(--muted-foreground))" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: "hsl(var(--muted-foreground))", strokeWidth: 2, r: 4 }}
                      name="Budgeted"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="actualAmount" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                      name="Actual"
                    />
                  </LineChart>
                ) : (
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ categoryName, variancePercentage }) => 
                        `${categoryName}: ${variancePercentage > 0 ? '+' : ''}${variancePercentage.toFixed(1)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="varianceAbs"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                )}
              </ResponsiveContainer>
            )}

            {viewMode === 'variance' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {chartData.map((item) => (
                    <div key={item.categoryId} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{item.categoryName}</h4>
                          <p className="text-sm text-muted-foreground">
                            Budget: ${item.budgetedAmount.toLocaleString()} | 
                            Actual: ${item.actualAmount.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(item.status)}>
                            {item.status.replace('-', ' ')}
                          </Badge>
                          <div className={cn("flex items-center", getTrendColor(item.trend))}>
                            {getTrendIcon(item.trend)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Variance:</span>
                          <span className={cn(
                            "font-medium",
                            item.variance > 0 ? "text-red-600" : "text-green-600"
                          )}>
                            {item.variance > 0 ? '+' : ''}${item.variance.toLocaleString()} 
                            ({item.variancePercentage > 0 ? '+' : ''}{item.variancePercentage.toFixed(1)}%)
                          </span>
                        </div>
                        <Progress 
                          value={item.efficiency} 
                          className="h-2"
                          indicatorClassName={cn(
                            item.efficiency > 100 ? "bg-red-500" : 
                            item.efficiency > 90 ? "bg-yellow-500" : "bg-green-500"
                          )}
                        />
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Efficiency:</span>
                          <span className="font-medium">{item.efficiency.toFixed(1)}%</span>
                        </div>
                      </div>

                      {item.recommendations && item.recommendations.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <h5 className="text-sm font-medium mb-2 flex items-center">
                            <Lightbulb className="h-4 w-4 mr-1" />
                            Recommendations
                          </h5>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {item.recommendations.slice(0, 2).map((rec, index) => (
                              <li key={index} className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {viewMode === 'trends' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                      Improving ({insights?.improving})
                    </h4>
                    <div className="space-y-2">
                      {chartData.filter(item => item.trend === 'improving').map((item) => (
                        <div key={item.categoryId} className="text-sm">
                          <div className="flex justify-between">
                            <span>{item.categoryName}</span>
                            <span className="text-green-600">
                              {item.variancePercentage > 0 ? '+' : ''}{item.variancePercentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3 flex items-center">
                      <TrendingDown className="h-4 w-4 mr-2 text-red-600" />
                      Declining ({insights?.declining})
                    </h4>
                    <div className="space-y-2">
                      {chartData.filter(item => item.trend === 'declining').map((item) => (
                        <div key={item.categoryId} className="text-sm">
                          <div className="flex justify-between">
                            <span>{item.categoryName}</span>
                            <span className="text-red-600">
                              {item.variancePercentage > 0 ? '+' : ''}{item.variancePercentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3 flex items-center">
                      <Activity className="h-4 w-4 mr-2 text-blue-600" />
                      Stable ({insights?.stable})
                    </h4>
                    <div className="space-y-2">
                      {chartData.filter(item => item.trend === 'stable').map((item) => (
                        <div key={item.categoryId} className="text-sm">
                          <div className="flex justify-between">
                            <span>{item.categoryName}</span>
                            <span className="text-blue-600">
                              {item.variancePercentage > 0 ? '+' : ''}{item.variancePercentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Alerts and Recommendations */}
          {insights && insights.overBudget > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800">Budget Overruns</h4>
                  <p className="text-sm text-red-700 mt-1">
                    {insights.overBudget} categories are over budget. Consider reviewing your spending 
                    patterns and adjusting your budget allocations.
                  </p>
                </div>
              </div>
            </div>
          )}

          {insights && insights.biggestVariance && Math.abs(insights.biggestVariance.variance) > 1000 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Largest Variance</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    {insights.biggestVariance.categoryName} has the largest variance of 
                    ${Math.abs(insights.biggestVariance.variance).toLocaleString()}. 
                    This category may need special attention.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
};

export { BudgetPerformance };

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Legend, Scatter, ScatterChart, ComposedChart, Area, AreaChart
} from 'recharts';
import { format, parseISO, subMonths, addMonths } from 'date-fns';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Filter,
  Calendar,
  BarChart3,
  Activity
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Badge,
  Skeleton,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Checkbox,
  Label,
} from '@/components/ui';
import { SpendingTrend, SeasonalPattern } from '@/lib/api/analytics';
import { cn } from '@/lib/utils';

interface SpendingTrendsProps {
  data: SpendingTrend[];
  isLoading: boolean;
  startDate: Date;
  endDate: Date;
  comparisonDates?: { start: Date; end: Date } | null;
  showDetails?: boolean;
}

interface ChartDataPoint {
  date: string;
  formattedDate: string;
  total: number;
  [key: string]: any; // For category-specific data
}

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
        <p className="font-semibold mb-2">{format(parseISO(label!), 'MMM dd, yyyy')}</p>
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
        {payload[0]?.payload?.isAnomaly && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
            <div className="flex items-center space-x-1 text-yellow-700">
              <AlertTriangle className="h-3 w-3" />
              <span className="font-medium">Anomaly Detected</span>
            </div>
            <p className="text-yellow-600 mt-1">{payload[0].payload.anomalyReason}</p>
          </div>
        )}
      </motion.div>
    );
  }
  return null;
};

const SpendingTrends: React.FC<SpendingTrendsProps> = ({
  data,
  isLoading,
  startDate,
  endDate,
  comparisonDates,
  showDetails = false,
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showAnomalies, setShowAnomalies] = useState(true);
  const [chartType, setChartType] = useState<'line' | 'area' | 'scatter'>('line');
  const [viewMode, setViewMode] = useState<'total' | 'categories'>('total');

  // Process data for charts
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Group by date
    const groupedData = data.reduce((acc, item) => {
      const dateKey = item.date;
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          formattedDate: format(parseISO(dateKey), 'MMM dd'),
          total: 0,
          isAnomaly: false,
          anomalyReason: '',
        };
      }
      
      acc[dateKey].total += item.amount;
      acc[dateKey][item.category] = (acc[dateKey][item.category] || 0) + item.amount;
      
      if (item.isAnomaly) {
        acc[dateKey].isAnomaly = true;
        acc[dateKey].anomalyReason = item.anomalyReason || 'Unusual spending pattern detected';
      }
      
      return acc;
    }, {} as Record<string, ChartDataPoint>);

    return Object.values(groupedData).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [data]);

  // Get unique categories
  const categories = useMemo(() => {
    const categorySet = new Set(data.map(item => item.category));
    return Array.from(categorySet);
  }, [data]);

  // Calculate trends and insights
  const insights = useMemo(() => {
    if (chartData.length < 2) return null;

    const firstPeriod = chartData.slice(0, Math.floor(chartData.length / 2));
    const secondPeriod = chartData.slice(Math.floor(chartData.length / 2));

    const firstAvg = firstPeriod.reduce((sum, item) => sum + item.total, 0) / firstPeriod.length;
    const secondAvg = secondPeriod.reduce((sum, item) => sum + item.total, 0) / secondPeriod.length;

    const trend = secondAvg > firstAvg ? 'increasing' : 'decreasing';
    const changePercent = ((secondAvg - firstAvg) / firstAvg) * 100;

    const anomalies = chartData.filter(item => item.isAnomaly).length;
    const totalSpending = chartData.reduce((sum, item) => sum + item.total, 0);

    return {
      trend,
      changePercent: Math.abs(changePercent),
      anomalies,
      totalSpending,
      averageDaily: totalSpending / chartData.length,
    };
  }, [chartData]);

  // Handle category selection
  const handleCategoryToggle = useCallback((category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  }, []);

  // Get colors for categories
  const getCategoryColor = useCallback((category: string) => {
    const colors = [
      '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00',
      '#ff00ff', '#00ffff', '#ff0000', '#0000ff', '#ffff00'
    ];
    return colors[categories.indexOf(category) % colors.length];
  }, [categories]);

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
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Spending Data</h3>
          <p className="text-muted-foreground">
            No spending data available for the selected period.
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
            <h3 className="text-lg font-semibold text-foreground">Spending Trends</h3>
            <p className="text-sm text-muted-foreground">
              Track your spending patterns and identify anomalies
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  {chartType.charAt(0).toUpperCase() + chartType.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setChartType('line')}>
                  Line Chart
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setChartType('area')}>
                  Area Chart
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setChartType('scatter')}>
                  Scatter Plot
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAnomalies(!showAnomalies)}
            >
              {showAnomalies ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          {/* Insights */}
          {insights && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  {insights.trend === 'increasing' ? (
                    <TrendingUp className="h-4 w-4 text-red-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Trend</p>
                <p className="font-semibold capitalize">{insights.trend}</p>
                <p className="text-xs text-muted-foreground">
                  {insights.changePercent.toFixed(1)}% change
                </p>
              </div>
              
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                </div>
                <p className="text-sm text-muted-foreground">Anomalies</p>
                <p className="font-semibold">{insights.anomalies}</p>
                <p className="text-xs text-muted-foreground">detected</p>
              </div>
              
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <Activity className="h-4 w-4 text-blue-500" />
                </div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="font-semibold">${insights.totalSpending.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">
                  ${insights.averageDaily.toFixed(0)}/day avg
                </p>
              </div>
              
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <Calendar className="h-4 w-4 text-purple-500" />
                </div>
                <p className="text-sm text-muted-foreground">Period</p>
                <p className="font-semibold">{chartData.length}</p>
                <p className="text-xs text-muted-foreground">data points</p>
              </div>
            </div>
          )}

          {/* Category Filters */}
          {showDetails && categories.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Filter Categories:</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => handleCategoryToggle(category)}
                    />
                    <Label 
                      htmlFor={`category-${category}`}
                      className="text-sm flex items-center space-x-1"
                    >
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: getCategoryColor(category) }}
                      />
                      <span>{category}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis
                    dataKey="formattedDate"
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
                    dataKey="total"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                    name="Total Spending"
                  />
                  
                  {showDetails && selectedCategories.map(category => (
                    <Line
                      key={category}
                      type="monotone"
                      dataKey={category}
                      stroke={getCategoryColor(category)}
                      strokeWidth={1}
                      dot={false}
                      name={category}
                    />
                  ))}
                  
                  {showAnomalies && (
                    <Scatter
                      dataKey="isAnomaly"
                      fill="hsl(var(--destructive))"
                      r={6}
                      name="Anomalies"
                    />
                  )}
                </ComposedChart>
              ) : chartType === 'area' ? (
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis
                    dataKey="formattedDate"
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
                  
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary) / 0.2)"
                    strokeWidth={2}
                    name="Total Spending"
                  />
                </AreaChart>
              ) : (
                <ScatterChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis
                    dataKey="formattedDate"
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
                  
                  <Scatter
                    dataKey="total"
                    fill="hsl(var(--primary))"
                    r={6}
                    name="Spending"
                  />
                </ScatterChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export { SpendingTrends };

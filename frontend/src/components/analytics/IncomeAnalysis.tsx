'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, BarChart, Bar, RadialBarChart, RadialBar
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  AlertTriangle,
  Target,
  Calendar,
  PieChart as PieChartIcon,
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
  Progress,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui';
import { IncomeSource } from '@/lib/api/analytics';
import { cn } from '@/lib/utils';

interface IncomeAnalysisProps {
  data?: {
    sources: IncomeSource[];
    summary: {
      totalIncome: number;
      averageMonthly: number;
      growthRate: number;
      stability: number;
    };
  };
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
        className="p-3 bg-popover text-popover-foreground rounded-md shadow-lg border border-border text-sm"
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

const IncomeAnalysis: React.FC<IncomeAnalysisProps> = ({
  data,
  isLoading,
  startDate,
  endDate,
  showDetails = false,
}) => {
  const [viewMode, setViewMode] = useState<'sources' | 'trends' | 'stability'>('sources');
  const [chartType, setChartType] = useState<'pie' | 'bar' | 'radial'>('pie');

  // Process data for charts
  const chartData = useMemo(() => {
    if (!data?.sources) return [];

    return data.sources.map((source, index) => ({
      name: source.name,
      value: source.amount,
      percentage: source.percentage,
      stability: source.stability,
      growthRate: source.growthRate,
      color: COLORS[index % COLORS.length],
    }));
  }, [data?.sources]);

  // Calculate insights
  const insights = useMemo(() => {
    if (!data) return null;

    const { sources, summary } = data;
    
    const primarySource = sources.reduce((max, source) => 
      source.amount > max.amount ? source : max, sources[0]
    );
    
    const stableSources = sources.filter(source => source.stability === 'high').length;
    const growingSources = sources.filter(source => source.growthRate > 0).length;
    
    const diversificationScore = sources.length > 1 ? 
      (1 - Math.max(...sources.map(s => s.percentage / 100))) * 100 : 0;

    return {
      primarySource,
      stableSources,
      growingSources,
      diversificationScore,
      totalSources: sources.length,
    };
  }, [data]);

  // Get stability color
  const getStabilityColor = useCallback((stability: string) => {
    switch (stability) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }, []);

  // Get growth color
  const getGrowthColor = useCallback((growthRate: number) => {
    if (growthRate > 5) return 'text-green-600';
    if (growthRate > 0) return 'text-yellow-600';
    return 'text-red-600';
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

  if (!data || !data.sources || data.sources.length === 0) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <CardBody className="text-center">
          <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Income Data</h3>
          <p className="text-muted-foreground">
            No income data available for the selected period.
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
            <h3 className="text-lg font-semibold text-foreground">Income Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Analyze your income sources, stability, and growth trends
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {viewMode === 'sources' && <PieChartIcon className="h-4 w-4 mr-2" />}
                  {viewMode === 'trends' && <BarChart3 className="h-4 w-4 mr-2" />}
                  {viewMode === 'stability' && <Shield className="h-4 w-4 mr-2" />}
                  {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setViewMode('sources')}>
                  <PieChartIcon className="h-4 w-4 mr-2" />
                  Sources
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode('trends')}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Trends
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode('stability')}>
                  <Shield className="h-4 w-4 mr-2" />
                  Stability
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <DollarSign className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-sm text-muted-foreground">Total Income</p>
              <p className="font-semibold">${data.summary.totalIncome.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">
                ${data.summary.averageMonthly.toLocaleString()}/month
              </p>
            </div>
            
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-center mb-1">
                {data.summary.growthRate > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">Growth Rate</p>
              <p className={cn("font-semibold", getGrowthColor(data.summary.growthRate))}>
                {data.summary.growthRate > 0 ? '+' : ''}{data.summary.growthRate.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">annual</p>
            </div>
            
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Shield className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-sm text-muted-foreground">Stability</p>
              <p className="font-semibold">{data.summary.stability.toFixed(0)}%</p>
              <p className="text-xs text-muted-foreground">score</p>
            </div>
            
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Activity className="h-4 w-4 text-purple-500" />
              </div>
              <p className="text-sm text-muted-foreground">Sources</p>
              <p className="font-semibold">{data.sources.length}</p>
              <p className="text-xs text-muted-foreground">active</p>
            </div>
          </div>

          {/* Chart Section */}
          <div className="h-80">
            {viewMode === 'sources' && (
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'pie' ? (
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                ) : chartType === 'bar' ? (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <XAxis 
                      dataKey="name" 
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
                    <Bar dataKey="value" fill="hsl(var(--primary))" />
                  </BarChart>
                ) : (
                  <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" data={chartData}>
                    <RadialBar dataKey="percentage" fill="hsl(var(--primary))" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </RadialBarChart>
                )}
              </ResponsiveContainer>
            )}

            {viewMode === 'trends' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.sources.map((source, index) => (
                    <div key={source.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{source.name}</h4>
                        <Badge className={getStabilityColor(source.stability)}>
                          {source.stability}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Amount:</span>
                          <span className="font-medium">${source.amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Growth:</span>
                          <span className={cn("font-medium", getGrowthColor(source.growthRate))}>
                            {source.growthRate > 0 ? '+' : ''}{source.growthRate.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={source.percentage} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {viewMode === 'stability' && insights && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3 flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      Stability Overview
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Stable Sources:</span>
                        <span className="font-medium">{insights.stableSources}/{insights.totalSources}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Growing Sources:</span>
                        <span className="font-medium">{insights.growingSources}/{insights.totalSources}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Diversification:</span>
                        <span className="font-medium">{insights.diversificationScore.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3 flex items-center">
                      <Target className="h-4 w-4 mr-2" />
                      Primary Source
                    </h4>
                    <div className="space-y-2">
                      <p className="font-semibold">{insights.primarySource.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ${insights.primarySource.amount.toLocaleString()} 
                        ({insights.primarySource.percentage.toFixed(1)}%)
                      </p>
                      <Badge className={getStabilityColor(insights.primarySource.stability)}>
                        {insights.primarySource.stability} stability
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {insights.diversificationScore < 50 && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-800">Diversification Alert</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          Your income is heavily concentrated in one source. Consider diversifying 
                          your income streams to reduce risk.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Source Details */}
          {showDetails && (
            <div className="space-y-2">
              <h4 className="font-medium">Income Sources</h4>
              <div className="space-y-2">
                {data.sources.map((source) => (
                  <div key={source.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: COLORS[data.sources.indexOf(source) % COLORS.length] }}
                      />
                      <div>
                        <p className="font-medium">{source.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Last updated: {format(parseISO(source.lastUpdated), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${source.amount.toLocaleString()}</p>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStabilityColor(source.stability)} variant="secondary">
                          {source.stability}
                        </Badge>
                        <span className={cn("text-sm", getGrowthColor(source.growthRate))}>
                          {source.growthRate > 0 ? '+' : ''}{source.growthRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
};

export { IncomeAnalysis };

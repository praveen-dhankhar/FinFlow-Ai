'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, RadialBarChart, RadialBar, Legend
} from 'recharts';
import { format, parseISO, differenceInDays, addDays } from 'date-fns';
import { 
  Target, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  AlertTriangle,
  Trophy,
  Star,
  Gift,
  Clock,
  PiggyBank,
  BarChart3,
  PieChart as PieChartIcon
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
import { SavingsGoal, AnalyticsSummary } from '@/lib/api/analytics';
import { cn } from '@/lib/utils';

interface SavingsTrackerProps {
  goals: SavingsGoal[];
  isLoading: boolean;
  summary?: AnalyticsSummary;
  showDetails?: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

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

const SavingsTracker: React.FC<SavingsTrackerProps> = ({
  goals,
  isLoading,
  summary,
  showDetails = false,
}) => {
  const [viewMode, setViewMode] = useState<'overview' | 'goals' | 'progress'>('overview');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'radial'>('line');

  // Process data for charts
  const chartData = useMemo(() => {
    if (!goals || goals.length === 0) return [];

    return goals.map((goal, index) => ({
      name: goal.name,
      current: goal.currentAmount,
      target: goal.targetAmount,
      progress: goal.progress,
      status: goal.status,
      color: COLORS[index % COLORS.length],
    }));
  }, [goals]);

  // Calculate insights
  const insights = useMemo(() => {
    if (!goals || goals.length === 0) return null;

    const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
    const totalCurrent = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    const overallProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

    const onTrackGoals = goals.filter(goal => goal.status === 'on-track').length;
    const atRiskGoals = goals.filter(goal => goal.status === 'at-risk').length;
    const offTrackGoals = goals.filter(goal => goal.status === 'off-track').length;

    const achievedMilestones = goals.reduce((sum, goal) => 
      sum + goal.milestones.filter(m => m.achieved).length, 0
    );
    const totalMilestones = goals.reduce((sum, goal) => 
      sum + goal.milestones.length, 0
    );

    const averageProgress = goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length;

    return {
      totalTarget,
      totalCurrent,
      overallProgress,
      onTrackGoals,
      atRiskGoals,
      offTrackGoals,
      achievedMilestones,
      totalMilestones,
      averageProgress,
      totalGoals: goals.length,
    };
  }, [goals]);

  // Get status color
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'on-track': return 'text-green-600 bg-green-100';
      case 'at-risk': return 'text-yellow-600 bg-yellow-100';
      case 'off-track': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }, []);

  // Get milestone icon
  const getMilestoneIcon = useCallback((milestone: any) => {
    if (milestone.achieved) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    if (milestone.amount <= (milestone.goal?.currentAmount || 0)) {
      return <Star className="h-4 w-4 text-yellow-600" />;
    }
    return <Clock className="h-4 w-4 text-gray-400" />;
  }, []);

  // Calculate time to goal
  const getTimeToGoal = useCallback((goal: SavingsGoal) => {
    const now = new Date();
    const targetDate = parseISO(goal.targetDate);
    const daysRemaining = differenceInDays(targetDate, now);
    
    if (daysRemaining <= 0) return 'Overdue';
    if (daysRemaining < 30) return `${daysRemaining} days`;
    if (daysRemaining < 365) return `${Math.floor(daysRemaining / 30)} months`;
    return `${Math.floor(daysRemaining / 365)} years`;
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

  if (!goals || goals.length === 0) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <CardBody className="text-center">
          <PiggyBank className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Savings Goals</h3>
          <p className="text-muted-foreground">
            Create your first savings goal to start tracking your progress.
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
            <h3 className="text-lg font-semibold text-foreground">Savings Tracker</h3>
            <p className="text-sm text-muted-foreground">
              Track your progress toward financial goals and celebrate milestones
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {viewMode === 'overview' && <BarChart3 className="h-4 w-4 mr-2" />}
                  {viewMode === 'goals' && <Target className="h-4 w-4 mr-2" />}
                  {viewMode === 'progress' && <TrendingUp className="h-4 w-4 mr-2" />}
                  {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setViewMode('overview')}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Overview
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode('goals')}>
                  <Target className="h-4 w-4 mr-2" />
                  Goals
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode('progress')}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Progress
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
                  <DollarSign className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-sm text-muted-foreground">Total Saved</p>
                <p className="font-semibold">${insights.totalCurrent.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">
                  of ${insights.totalTarget.toLocaleString()}
                </p>
              </div>
              
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <Target className="h-4 w-4 text-blue-500" />
                </div>
                <p className="text-sm text-muted-foreground">Overall Progress</p>
                <p className="font-semibold">{insights.overallProgress.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">complete</p>
              </div>
              
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-sm text-muted-foreground">On Track</p>
                <p className="font-semibold">{insights.onTrackGoals}</p>
                <p className="text-xs text-muted-foreground">goals</p>
              </div>
              
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                </div>
                <p className="text-sm text-muted-foreground">Milestones</p>
                <p className="font-semibold">{insights.achievedMilestones}</p>
                <p className="text-xs text-muted-foreground">
                  of {insights.totalMilestones}
                </p>
              </div>
            </div>
          )}

          {/* Chart Section */}
          <div className="h-80">
            {viewMode === 'overview' && (
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'line' ? (
                  <LineChart data={chartData}>
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
                    <Line 
                      type="monotone" 
                      dataKey="current" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                      name="Current Amount"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="target" 
                      stroke="hsl(var(--muted-foreground))" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: "hsl(var(--muted-foreground))", strokeWidth: 2, r: 4 }}
                      name="Target Amount"
                    />
                  </LineChart>
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
                    <Bar dataKey="current" fill="hsl(var(--primary))" name="Current Amount" />
                    <Bar dataKey="target" fill="hsl(var(--muted-foreground))" name="Target Amount" />
                  </BarChart>
                ) : (
                  <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" data={chartData}>
                    <RadialBar dataKey="progress" fill="hsl(var(--primary))" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </RadialBarChart>
                )}
              </ResponsiveContainer>
            )}

            {viewMode === 'goals' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {goals.map((goal) => (
                    <div key={goal.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{goal.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Target: ${goal.targetAmount.toLocaleString()} by {format(parseISO(goal.targetDate), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <Badge className={getStatusColor(goal.status)}>
                          {goal.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress:</span>
                          <span className="font-medium">
                            ${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}
                          </span>
                        </div>
                        <Progress value={goal.progress} className="h-2" />
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Time remaining:</span>
                          <span className="font-medium">{getTimeToGoal(goal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Monthly contribution:</span>
                          <span className="font-medium">${goal.monthlyContribution.toLocaleString()}</span>
                        </div>
                      </div>

                      {goal.milestones.length > 0 && (
                        <div className="mt-4 pt-3 border-t">
                          <h5 className="text-sm font-medium mb-2">Milestones</h5>
                          <div className="space-y-2">
                            {goal.milestones.map((milestone) => (
                              <div key={milestone.id} className="flex items-center justify-between text-sm">
                                <div className="flex items-center space-x-2">
                                  {getMilestoneIcon(milestone)}
                                  <span>${milestone.amount.toLocaleString()}</span>
                                </div>
                                {milestone.achieved && milestone.achievedDate && (
                                  <span className="text-muted-foreground">
                                    {format(parseISO(milestone.achievedDate), 'MMM dd')}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {viewMode === 'progress' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {goals.map((goal) => (
                    <div key={goal.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{goal.name}</h4>
                        <span className="text-sm font-medium">{goal.progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-3 mb-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>${goal.currentAmount.toLocaleString()}</span>
                        <span>${goal.targetAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recommendations */}
          {insights && insights.atRiskGoals > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Goals at Risk</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    {insights.atRiskGoals} of your goals are at risk of not being met on time. 
                    Consider increasing your monthly contributions or adjusting your target dates.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Milestone Celebrations */}
          {insights && insights.achievedMilestones > 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <Gift className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800">Milestone Achieved!</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Congratulations! You've achieved {insights.achievedMilestones} milestone{insights.achievedMilestones > 1 ? 's' : ''}. 
                    Keep up the great work toward your financial goals!
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

export { SavingsTracker };

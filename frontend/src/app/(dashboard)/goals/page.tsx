'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Target, Archive, Filter, Search, TrendingUp, AlertTriangle } from 'lucide-react';
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Input,
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
import GoalCard from '@/components/goals/GoalCard';
import AddGoalModal from '@/components/goals/AddGoalModal';
import {
  useGoals,
  useGoalCategories,
  useGoalInsights,
  useCreateGoal,
  useUpdateGoal,
  useDeleteGoal,
} from '@/hooks/useGoals';
import { Goal, GoalFilters } from '@/lib/api/goals';
import { cn } from '@/lib/utils';

export default function GoalsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'paused' | 'cancelled'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [activeTab, setActiveTab] = useState('active');

  // API hooks
  const { data: goals = [], isLoading: goalsLoading } = useGoals();
  const { data: categories = [], isLoading: categoriesLoading } = useGoalCategories();
  const { data: insights, isLoading: insightsLoading } = useGoalInsights();

  // Mutations
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();

  // Filter and search goals
  const filteredGoals = useMemo(() => {
    let filtered = goals;

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(goal => goal.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(goal => goal.priority === priorityFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(goal =>
        goal.name.toLowerCase().includes(query) ||
        goal.description?.toLowerCase().includes(query) ||
        goal.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [goals, statusFilter, priorityFilter, searchQuery]);

  // Group goals by status
  const goalsByStatus = useMemo(() => {
    const active = filteredGoals.filter(goal => goal.status === 'active');
    const completed = filteredGoals.filter(goal => goal.status === 'completed');
    const paused = filteredGoals.filter(goal => goal.status === 'paused');
    const cancelled = filteredGoals.filter(goal => goal.status === 'cancelled');

    return { active, completed, paused, cancelled };
  }, [filteredGoals]);

  // Handlers
  const handleCreateGoal = useCallback(async (goalData: any) => {
    await createGoal.mutateAsync(goalData);
  }, [createGoal]);

  const handleEditGoal = useCallback((goal: Goal) => {
    // TODO: Implement edit modal
    console.log('Edit goal:', goal);
  }, []);

  const handleDeleteGoal = useCallback(async (goalId: string) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      await deleteGoal.mutateAsync(goalId);
    }
  }, [deleteGoal]);

  const handleAddContribution = useCallback((goalId: string) => {
    // TODO: Implement add contribution modal
    console.log('Add contribution to goal:', goalId);
  }, []);

  const handleViewDetails = useCallback((goalId: string) => {
    // TODO: Implement goal details page/modal
    console.log('View goal details:', goalId);
  }, []);

  const isLoading = goalsLoading || categoriesLoading || insightsLoading;

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
              <h1 className="text-3xl font-bold text-foreground">Financial Goals</h1>
              <p className="text-muted-foreground">
                Track your progress and achieve your financial dreams
              </p>
            </div>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Goal
            </Button>
          </div>

          {/* Quick Stats */}
          {insights && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Total Goals</h3>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardBody>
                  <div className="text-2xl font-bold">{insights.totalGoals}</div>
                  <p className="text-xs text-muted-foreground">
                    {insights.activeGoals} active
                  </p>
                </CardBody>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Total Saved</h3>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardBody>
                  <div className="text-2xl font-bold">
                    ${insights.totalSaved.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    of ${insights.totalTarget.toLocaleString()} target
                  </p>
                </CardBody>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Average Progress</h3>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardBody>
                  <div className="text-2xl font-bold">
                    {insights.averageProgress.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    across all goals
                  </p>
                </CardBody>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">On Track</h3>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardBody>
                  <div className="text-2xl font-bold text-green-600">
                    {insights.onTrackGoals}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {insights.atRiskGoals} at risk
                  </p>
                </CardBody>
              </Card>
            </div>
          )}

          {/* Filters */}
          <Card className="mb-6">
            <CardBody className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <Search className="h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search goals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Status: {statusFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                    All Status
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('active')}>
                    Active
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('completed')}>
                    Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('paused')}>
                    Paused
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('cancelled')}>
                    Cancelled
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Priority: {priorityFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setPriorityFilter('all')}>
                    All Priorities
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPriorityFilter('high')}>
                    High
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPriorityFilter('medium')}>
                    Medium
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPriorityFilter('low')}>
                    Low
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardBody>
          </Card>

          {/* Goals Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="active" className="flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>Active ({goalsByStatus.active.length})</span>
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Completed ({goalsByStatus.completed.length})</span>
              </TabsTrigger>
              <TabsTrigger value="paused" className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4" />
                <span>Paused ({goalsByStatus.paused.length})</span>
              </TabsTrigger>
              <TabsTrigger value="archived" className="flex items-center space-x-2">
                <Archive className="h-4 w-4" />
                <span>Archived ({goalsByStatus.cancelled.length})</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-6">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-80 w-full" />
                  ))}
                </div>
              ) : goalsByStatus.active.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {goalsByStatus.active.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onEdit={handleEditGoal}
                      onDelete={handleDeleteGoal}
                      onAddContribution={handleAddContribution}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              ) : (
                <Card className="h-64 flex items-center justify-center">
                  <CardBody className="text-center space-y-4">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto" />
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">No Active Goals</h3>
                      <p className="text-muted-foreground mb-4">
                        Start your financial journey by creating your first goal.
                      </p>
                      <Button onClick={() => setIsAddModalOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Goal
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-6">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-80 w-full" />
                  ))}
                </div>
              ) : goalsByStatus.completed.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {goalsByStatus.completed.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onEdit={handleEditGoal}
                      onDelete={handleDeleteGoal}
                      onAddContribution={handleAddContribution}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              ) : (
                <Card className="h-64 flex items-center justify-center">
                  <CardBody className="text-center space-y-4">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto" />
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">No Completed Goals</h3>
                      <p className="text-muted-foreground">
                        Complete your first goal to see it here.
                      </p>
                    </div>
                  </CardBody>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="paused" className="space-y-6">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-80 w-full" />
                  ))}
                </div>
              ) : goalsByStatus.paused.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {goalsByStatus.paused.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onEdit={handleEditGoal}
                      onDelete={handleDeleteGoal}
                      onAddContribution={handleAddContribution}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              ) : (
                <Card className="h-64 flex items-center justify-center">
                  <CardBody className="text-center space-y-4">
                    <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto" />
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">No Paused Goals</h3>
                      <p className="text-muted-foreground">
                        All your goals are active and on track.
                      </p>
                    </div>
                  </CardBody>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="archived" className="space-y-6">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 1 }).map((_, i) => (
                    <Skeleton key={i} className="h-80 w-full" />
                  ))}
                </div>
              ) : goalsByStatus.cancelled.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {goalsByStatus.cancelled.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onEdit={handleEditGoal}
                      onDelete={handleDeleteGoal}
                      onAddContribution={handleAddContribution}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              ) : (
                <Card className="h-64 flex items-center justify-center">
                  <CardBody className="text-center space-y-4">
                    <Archive className="h-12 w-12 text-muted-foreground mx-auto" />
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">No Archived Goals</h3>
                      <p className="text-muted-foreground">
                        Cancelled goals will appear here.
                      </p>
                    </div>
                  </CardBody>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Add Goal Modal */}
          <AddGoalModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onSubmit={handleCreateGoal}
            categories={categories}
            isLoading={categoriesLoading}
          />
        </motion.div>
      </main>
    </div>
  );
}

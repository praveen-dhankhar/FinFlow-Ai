'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, differenceInDays, addDays } from 'date-fns';
import {
  Target,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  Pause,
  X,
  Edit,
  Trash2,
  Plus,
  MoreVertical,
  AlertTriangle,
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
import { Goal, GoalProgress } from '@/lib/api/goals';
import { cn } from '@/lib/utils';

interface GoalCardProps {
  goal: Goal;
  progress?: GoalProgress;
  onEdit?: (goal: Goal) => void;
  onDelete?: (goalId: string) => void;
  onAddContribution?: (goalId: string) => void;
  onViewDetails?: (goalId: string) => void;
  isLoading?: boolean;
}

const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  progress,
  onEdit,
  onDelete,
  onAddContribution,
  onViewDetails,
  isLoading = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Calculate progress metrics
  const progressData = useMemo(() => {
    if (!progress) {
      const progressPercentage = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
      const daysRemaining = differenceInDays(new Date(goal.targetDate), new Date());
      const isOnTrack = daysRemaining > 0 && progressPercentage > 0;
      
      return {
        progressPercentage: Math.min(progressPercentage, 100),
        daysRemaining: Math.max(daysRemaining, 0),
        isOnTrack,
        monthlyContributionNeeded: daysRemaining > 0 ? (goal.targetAmount - goal.currentAmount) / Math.max(daysRemaining / 30, 1) : 0,
        weeklyContributionNeeded: daysRemaining > 0 ? (goal.targetAmount - goal.currentAmount) / Math.max(daysRemaining / 7, 1) : 0,
      };
    }

    return {
      progressPercentage: progress.progressPercentage,
      daysRemaining: progress.daysRemaining,
      isOnTrack: progress.isOnTrack,
      monthlyContributionNeeded: progress.monthlyContributionNeeded,
      weeklyContributionNeeded: progress.weeklyContributionNeeded,
    };
  }, [goal, progress]);

  // Get status color and icon
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return { color: 'text-green-600 bg-green-100', icon: CheckCircle };
      case 'paused':
        return { color: 'text-yellow-600 bg-yellow-100', icon: Pause };
      case 'cancelled':
        return { color: 'text-red-600 bg-red-100', icon: X };
      default:
        return { color: 'text-blue-600 bg-blue-100', icon: Target };
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      default:
        return 'text-green-600';
    }
  };

  const statusInfo = getStatusInfo(goal.status);
  const StatusIcon = statusInfo.icon;

  if (isLoading) {
    return (
      <Card className="h-80">
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardBody className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className={cn(
        "h-80 transition-all duration-200 cursor-pointer",
        isHovered && "shadow-lg border-primary/20"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: goal.color || '#3B82F6' }}
              >
                {goal.icon ? (
                  <span className="text-white text-lg">{goal.icon}</span>
                ) : (
                  <StatusIcon className="h-5 w-5 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">{goal.name}</h3>
                <p className="text-sm text-muted-foreground">{goal.category}</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <span className={cn(
                "px-2 py-1 rounded-full text-xs font-medium",
                statusInfo.color
              )}>
                {goal.status}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onViewDetails?.(goal.id)}>
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit?.(goal)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAddContribution?.(goal.id)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Contribution
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete?.(goal.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardBody className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progressData.progressPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="h-2 rounded-full transition-all duration-500"
                style={{ 
                  backgroundColor: goal.color || '#3B82F6',
                  width: `${progressData.progressPercentage}%`
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progressData.progressPercentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>${goal.currentAmount.toLocaleString()}</span>
              <span>${goal.targetAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 bg-muted rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Calendar className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-xs text-muted-foreground">Days Left</p>
              <p className="font-semibold text-sm">
                {progressData.daysRemaining}
              </p>
            </div>
            
            <div className="text-center p-2 bg-muted rounded-lg">
              <div className="flex items-center justify-center mb-1">
                {progressData.isOnTrack ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className={cn(
                "font-semibold text-sm",
                progressData.isOnTrack ? "text-green-600" : "text-red-600"
              )}>
                {progressData.isOnTrack ? 'On Track' : 'At Risk'}
              </p>
            </div>
          </div>

          {/* Contribution Info */}
          {goal.status === 'active' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Weekly needed:</span>
                <span className="font-medium">
                  ${progressData.weeklyContributionNeeded.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Monthly needed:</span>
                <span className="font-medium">
                  ${progressData.monthlyContributionNeeded.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Alerts */}
          {!progressData.isOnTrack && goal.status === 'active' && (
            <div className="flex items-center space-x-2 p-2 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <p className="text-xs text-red-700">
                Increase contributions to stay on track
              </p>
            </div>
          )}

          {/* Target Date */}
          <div className="flex items-center justify-between text-sm pt-2 border-t">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Target:</span>
            </div>
            <span className="font-medium">
              {format(new Date(goal.targetDate), 'MMM dd, yyyy')}
            </span>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default GoalCard;

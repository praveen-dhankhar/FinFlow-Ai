'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addMonths, addWeeks, addDays } from 'date-fns';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  X,
  Target,
  Calendar,
  DollarSign,
  Palette,
  Smile,
  Calculator,
  AlertCircle,
} from 'lucide-react';
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Input,
  Label,
  Skeleton,
} from '@/components/ui';
import { CreateGoalRequest } from '@/lib/api/goals';
import { cn } from '@/lib/utils';

// Form validation schema
const goalSchema = z.object({
  name: z.string().min(1, 'Goal name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  targetAmount: z.number().min(1, 'Target amount must be greater than 0'),
  targetDate: z.string().min(1, 'Target date is required'),
  category: z.string().min(1, 'Category is required'),
  categoryId: z.string().min(1, 'Category ID is required'),
  priority: z.enum(['low', 'medium', 'high']),
  autoSaveAmount: z.number().min(0).optional(),
  autoSaveFrequency: z.enum(['weekly', 'monthly', 'quarterly']),
});

type GoalFormData = z.infer<typeof goalSchema>;

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (goal: CreateGoalRequest) => void;
  categories: { id: string; name: string; icon?: string; color?: string }[];
  isLoading?: boolean;
}

const GOAL_ICONS = [
  '🏠', '🚗', '✈️', '🎓', '💍', '🏖️', '💻', '📱', '🎮', '🎵',
  '📚', '🏃', '🍕', '🛍️', '💊', '🎨', '🎪', '🏆', '💰', '🎯'
];

const GOAL_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

const AddGoalModal: React.FC<AddGoalModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  categories,
  isLoading = false,
}) => {
  const [selectedIcon, setSelectedIcon] = useState('🎯');
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: '',
      description: '',
      targetAmount: 0,
      targetDate: format(addMonths(new Date(), 6), 'yyyy-MM-dd'),
      category: '',
      categoryId: '',
      priority: 'medium',
      autoSaveAmount: 0,
      autoSaveFrequency: 'monthly',
    },
  });

  const watchedTargetAmount = watch('targetAmount');
  const watchedTargetDate = watch('targetDate');
  const watchedAutoSaveFrequency = watch('autoSaveFrequency');

  // Calculate auto-save amount
  const autoSaveCalculation = useMemo(() => {
    if (!watchedTargetAmount || !watchedTargetDate) return null;

    const targetDate = new Date(watchedTargetDate);
    const today = new Date();
    const daysRemaining = Math.max(1, Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

    const weeklyAmount = watchedTargetAmount / Math.max(1, Math.ceil(daysRemaining / 7));
    const monthlyAmount = watchedTargetAmount / Math.max(1, Math.ceil(daysRemaining / 30));
    const quarterlyAmount = watchedTargetAmount / Math.max(1, Math.ceil(daysRemaining / 90));

    return {
      weekly: Math.ceil(weeklyAmount),
      monthly: Math.ceil(monthlyAmount),
      quarterly: Math.ceil(quarterlyAmount),
    };
  }, [watchedTargetAmount, watchedTargetDate]);

  // Update auto-save amount when calculation changes
  useEffect(() => {
    if (autoSaveCalculation) {
      const amount = autoSaveCalculation[watchedAutoSaveFrequency];
      setValue('autoSaveAmount', amount);
    }
  }, [autoSaveCalculation, watchedAutoSaveFrequency, setValue]);

  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      setSelectedCategory(categoryId);
      setValue('category', category.name);
      setValue('categoryId', category.id);
    }
  };

  // Handle form submission
  const handleFormSubmit = (data: GoalFormData) => {
    const goalData: CreateGoalRequest = {
      ...data,
      icon: selectedIcon,
      color: selectedColor,
    };
    onSubmit(goalData);
    handleClose();
  };

  // Handle modal close
  const handleClose = () => {
    reset();
    setSelectedIcon('🎯');
    setSelectedColor('#3B82F6');
    setSelectedCategory('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="border-0 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Create New Goal</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardBody className="space-y-6">
              <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Basic Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Goal Name *</Label>
                      <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            id="name"
                            placeholder="e.g., Emergency Fund"
                            className={cn(errors.name && "border-red-500")}
                          />
                        )}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-600">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      {isLoading ? (
                        <Skeleton className="h-10 w-full" />
                      ) : (
                        <select
                          value={selectedCategory}
                          onChange={(e) => handleCategorySelect(e.target.value)}
                          className="w-full px-3 py-2 border border-input rounded-md bg-background"
                        >
                          <option value="">Select a category</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      )}
                      {errors.categoryId && (
                        <p className="text-sm text-red-600">{errors.categoryId.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Controller
                      name="description"
                      control={control}
                      render={({ field }) => (
                        <textarea
                          {...field}
                          id="description"
                          rows={3}
                          placeholder="Describe your goal..."
                          className="w-full px-3 py-2 border border-input rounded-md bg-background resize-none"
                        />
                      )}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-600">{errors.description.message}</p>
                    )}
                  </div>
                </div>

                {/* Financial Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Financial Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="targetAmount">Target Amount *</Label>
                      <Controller
                        name="targetAmount"
                        control={control}
                        render={({ field }) => (
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              {...field}
                              type="number"
                              id="targetAmount"
                              placeholder="10000"
                              className={cn("pl-10", errors.targetAmount && "border-red-500")}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        )}
                      />
                      {errors.targetAmount && (
                        <p className="text-sm text-red-600">{errors.targetAmount.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="targetDate">Target Date *</Label>
                      <Controller
                        name="targetDate"
                        control={control}
                        render={({ field }) => (
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              {...field}
                              type="date"
                              id="targetDate"
                              className={cn("pl-10", errors.targetDate && "border-red-500")}
                            />
                          </div>
                        )}
                      />
                      {errors.targetDate && (
                        <p className="text-sm text-red-600">{errors.targetDate.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Auto-save Calculator */}
                  {autoSaveCalculation && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-3">
                        <Calculator className="h-4 w-4 text-blue-600" />
                        <h4 className="font-medium text-blue-800">Auto-save Calculator</h4>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="text-center">
                          <p className="text-blue-700">Weekly</p>
                          <p className="font-semibold">${autoSaveCalculation.weekly.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-blue-700">Monthly</p>
                          <p className="font-semibold">${autoSaveCalculation.monthly.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-blue-700">Quarterly</p>
                          <p className="font-semibold">${autoSaveCalculation.quarterly.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Auto-save Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Auto-save Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="autoSaveFrequency">Frequency</Label>
                      <Controller
                        name="autoSaveFrequency"
                        control={control}
                        render={({ field }) => (
                          <select
                            {...field}
                            className="w-full px-3 py-2 border border-input rounded-md bg-background"
                          >
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                          </select>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="autoSaveAmount">Amount</Label>
                      <Controller
                        name="autoSaveAmount"
                        control={control}
                        render={({ field }) => (
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              {...field}
                              type="number"
                              id="autoSaveAmount"
                              placeholder="0"
                              className="pl-10"
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Priority and Customization */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Priority & Customization</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Controller
                        name="priority"
                        control={control}
                        render={({ field }) => (
                          <div className="flex space-x-2">
                            {(['low', 'medium', 'high'] as const).map((priority) => (
                              <button
                                key={priority}
                                type="button"
                                onClick={() => field.onChange(priority)}
                                className={cn(
                                  "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                                  field.value === priority
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                                )}
                              >
                                {priority.charAt(0).toUpperCase() + priority.slice(1)}
                              </button>
                            ))}
                          </div>
                        )}
                      />
                    </div>

                    {/* Icon Selection */}
                    <div className="space-y-2">
                      <Label>Icon</Label>
                      <div className="grid grid-cols-10 gap-2">
                        {GOAL_ICONS.map((icon) => (
                          <button
                            key={icon}
                            type="button"
                            onClick={() => setSelectedIcon(icon)}
                            className={cn(
                              "w-10 h-10 rounded-lg border-2 flex items-center justify-center text-lg transition-colors",
                              selectedIcon === icon
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/50"
                            )}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Color Selection */}
                    <div className="space-y-2">
                      <Label>Color</Label>
                      <div className="flex space-x-2">
                        {GOAL_COLORS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setSelectedColor(color)}
                            className={cn(
                              "w-8 h-8 rounded-full border-2 transition-transform",
                              selectedColor === color
                                ? "border-foreground scale-110"
                                : "border-border hover:scale-105"
                            )}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Goal'}
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddGoalModal;

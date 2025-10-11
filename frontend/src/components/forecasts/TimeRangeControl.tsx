'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  CalendarDays, 
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { format, subMonths, subYears, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, addDays } from 'date-fns';
import {
  Card,
  CardBody,
  Button,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Calendar as CalendarComponent,
  ToggleGroup,
  ToggleGroupItem,
  Badge,
} from '@/components/ui';
import { cn } from '@/lib/utils';

export type TimeGranularity = 'daily' | 'weekly' | 'monthly';
export type PresetRange = '1M' | '3M' | '6M' | '1Y' | '2Y' | '5Y' | 'ALL';

interface TimeRangeControlProps {
  startDate: Date;
  endDate: Date;
  granularity: TimeGranularity;
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
  onGranularityChange: (granularity: TimeGranularity) => void;
  className?: string;
}

interface PresetRangeOption {
  label: string;
  value: PresetRange;
  getDates: () => { start: Date; end: Date };
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const TimeRangeControl: React.FC<TimeRangeControlProps> = ({
  startDate,
  endDate,
  granularity,
  onDateRangeChange,
  onGranularityChange,
  className,
}) => {
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(startDate);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(endDate);

  const presetRanges: PresetRangeOption[] = [
    {
      label: '1 Month',
      value: '1M',
      getDates: () => ({
        start: subMonths(new Date(), 1),
        end: new Date(),
      }),
      icon: Clock,
      description: 'Last 30 days',
    },
    {
      label: '3 Months',
      value: '3M',
      getDates: () => ({
        start: subMonths(new Date(), 3),
        end: new Date(),
      }),
      icon: TrendingUp,
      description: 'Quarterly view',
    },
    {
      label: '6 Months',
      value: '6M',
      getDates: () => ({
        start: subMonths(new Date(), 6),
        end: new Date(),
      }),
      icon: Calendar,
      description: 'Half-year view',
    },
    {
      label: '1 Year',
      value: '1Y',
      getDates: () => ({
        start: subYears(new Date(), 1),
        end: new Date(),
      }),
      icon: CalendarDays,
      description: 'Annual view',
    },
    {
      label: '2 Years',
      value: '2Y',
      getDates: () => ({
        start: subYears(new Date(), 2),
        end: new Date(),
      }),
      icon: CalendarRange,
      description: 'Two-year view',
    },
    {
      label: '5 Years',
      value: '5Y',
      getDates: () => ({
        start: subYears(new Date(), 5),
        end: new Date(),
      }),
      icon: CalendarRange,
      description: 'Long-term view',
    },
    {
      label: 'All Time',
      value: 'ALL',
      getDates: () => ({
        start: subYears(new Date(), 10), // Assume 10 years of data
        end: new Date(),
      }),
      icon: CalendarRange,
      description: 'Complete history',
    },
  ];

  const granularityOptions = [
    { value: 'daily' as const, label: 'Daily', description: 'Day-by-day data points' },
    { value: 'weekly' as const, label: 'Weekly', description: 'Weekly aggregated data' },
    { value: 'monthly' as const, label: 'Monthly', description: 'Monthly summaries' },
  ];

  const getCurrentPreset = useCallback(() => {
    return presetRanges.find(preset => {
      const { start, end } = preset.getDates();
      return (
        Math.abs(start.getTime() - startDate.getTime()) < 24 * 60 * 60 * 1000 && // Within 1 day
        Math.abs(end.getTime() - endDate.getTime()) < 24 * 60 * 60 * 1000
      );
    });
  }, [startDate, endDate, presetRanges]);

  const handlePresetChange = useCallback((value: PresetRange) => {
    if (value === 'ALL') {
      // Handle custom range
      setIsCustomOpen(true);
      return;
    }

    const preset = presetRanges.find(p => p.value === value);
    if (preset) {
      const { start, end } = preset.getDates();
      onDateRangeChange(start, end);
    }
  }, [presetRanges, onDateRangeChange]);

  const handleCustomDateApply = useCallback(() => {
    if (customStartDate && customEndDate) {
      onDateRangeChange(customStartDate, customEndDate);
      setIsCustomOpen(false);
    }
  }, [customStartDate, customEndDate, onDateRangeChange]);

  const handleCustomDateCancel = useCallback(() => {
    setCustomStartDate(startDate);
    setCustomEndDate(endDate);
    setIsCustomOpen(false);
  }, [startDate, endDate]);

  const handleNavigate = useCallback((direction: 'prev' | 'next') => {
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (direction === 'prev') {
      const newStart = subDays(startDate, daysDiff);
      const newEnd = subDays(endDate, daysDiff);
      onDateRangeChange(newStart, newEnd);
    } else {
      const newStart = addDays(startDate, daysDiff);
      const newEnd = addDays(endDate, daysDiff);
      onDateRangeChange(newStart, newEnd);
    }
  }, [startDate, endDate, onDateRangeChange]);

  const handleReset = useCallback(() => {
    const now = new Date();
    onDateRangeChange(now, now);
  }, [onDateRangeChange]);

  const formatDateRange = useCallback((start: Date, end: Date) => {
    const startFormatted = format(start, 'MMM dd, yyyy');
    const endFormatted = format(end, 'MMM dd, yyyy');
    return `${startFormatted} - ${endFormatted}`;
  }, []);

  const getDaysDifference = useCallback(() => {
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  }, [startDate, endDate]);

  const currentPreset = getCurrentPreset();
  const isCustomRange = !currentPreset;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("space-y-4", className)}
    >
      <Card>
        <CardBody className="p-4">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h4 className="text-sm font-medium text-foreground">Time Range</h4>
                  <p className="text-xs text-muted-foreground">
                    {formatDateRange(startDate, endDate)} ({getDaysDifference()} days)
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNavigate('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNavigate('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Preset Ranges */}
            <div className="space-y-2">
              <h5 className="text-xs font-medium text-foreground">Quick Ranges</h5>
              <div className="flex flex-wrap gap-2">
                {presetRanges.map((preset) => {
                  const IconComponent = preset.icon;
                  const isActive = currentPreset?.value === preset.value;
                  
                  return (
                    <Button
                      key={preset.value}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePresetChange(preset.value)}
                      className="text-xs"
                    >
                      <IconComponent className="h-3 w-3 mr-1" />
                      {preset.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Custom Range */}
            {isCustomRange && (
              <div className="flex items-center space-x-2">
                <Popover open={isCustomOpen} onOpenChange={setIsCustomOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="text-xs">
                      <CalendarRange className="h-3 w-3 mr-1" />
                      Custom Range
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-4 space-y-4">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-foreground">Select Date Range</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs text-muted-foreground">Start Date</label>
                            <CalendarComponent
                              mode="single"
                              selected={customStartDate}
                              onSelect={setCustomStartDate}
                              initialFocus
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs text-muted-foreground">End Date</label>
                            <CalendarComponent
                              mode="single"
                              selected={customEndDate}
                              onSelect={setCustomEndDate}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-end space-x-2 pt-4 border-t">
                        <Button variant="outline" size="sm" onClick={handleCustomDateCancel}>
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleCustomDateApply}
                          disabled={!customStartDate || !customEndDate}
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                
                {isCustomRange && (
                  <Badge variant="secondary" className="text-xs">
                    Custom
                  </Badge>
                )}
              </div>
            )}

            {/* Granularity Selector */}
            <div className="space-y-2">
              <h5 className="text-xs font-medium text-foreground">Data Granularity</h5>
              <ToggleGroup
                type="single"
                value={granularity}
                onValueChange={(value: TimeGranularity) => value && onGranularityChange(value)}
                className="justify-start"
              >
                {granularityOptions.map((option) => (
                  <ToggleGroupItem
                    key={option.value}
                    value={option.value}
                    className="text-xs"
                  >
                    {option.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <p className="text-xs text-muted-foreground">
                {granularityOptions.find(opt => opt.value === granularity)?.description}
              </p>
            </div>

            {/* Range Info */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
              <div className="flex items-center space-x-4">
                <span>Duration: {getDaysDifference()} days</span>
                <span>Granularity: {granularity}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>Use ← → to navigate</span>
                <span>•</span>
                <span>Click presets for quick selection</span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default TimeRangeControl;

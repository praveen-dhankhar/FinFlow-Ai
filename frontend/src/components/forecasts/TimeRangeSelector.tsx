'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, TrendingUp, CalendarDays } from 'lucide-react';
import { format, subMonths, subYears, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
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
} from '@/components/ui';
import { cn } from '@/lib/utils';

interface TimeRangeSelectorProps {
  startDate?: Date;
  endDate?: Date;
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
  className?: string;
}

interface PresetRange {
  label: string;
  value: string;
  getDates: () => { start: Date; end: Date };
  icon: React.ComponentType<{ className?: string }>;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  startDate = subMonths(new Date(), 6),
  endDate = new Date(),
  onDateRangeChange,
  className,
}) => {
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(startDate);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(endDate);

  const presetRanges: PresetRange[] = [
    {
      label: 'Last 3 Months',
      value: '3m',
      getDates: () => ({
        start: subMonths(new Date(), 3),
        end: new Date(),
      }),
      icon: Clock,
    },
    {
      label: 'Last 6 Months',
      value: '6m',
      getDates: () => ({
        start: subMonths(new Date(), 6),
        end: new Date(),
      }),
      icon: TrendingUp,
    },
    {
      label: 'Last Year',
      value: '1y',
      getDates: () => ({
        start: subYears(new Date(), 1),
        end: new Date(),
      }),
      icon: Calendar,
    },
    {
      label: 'This Month',
      value: 'current-month',
      getDates: () => ({
        start: startOfMonth(new Date()),
        end: endOfMonth(new Date()),
      }),
      icon: CalendarDays,
    },
    {
      label: 'This Year',
      value: 'current-year',
      getDates: () => ({
        start: startOfYear(new Date()),
        end: endOfYear(new Date()),
      }),
      icon: CalendarDays,
    },
  ];

  const getCurrentPreset = useCallback(() => {
    return presetRanges.find(preset => {
      const { start, end } = preset.getDates();
      return (
        start.getTime() === startDate.getTime() &&
        end.getTime() === endDate.getTime()
      );
    });
  }, [startDate, endDate, presetRanges]);

  const handlePresetChange = useCallback((value: string) => {
    if (value === 'custom') {
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

  const formatDateRange = useCallback((start: Date, end: Date) => {
    const startFormatted = format(start, 'MMM dd, yyyy');
    const endFormatted = format(end, 'MMM dd, yyyy');
    return `${startFormatted} - ${endFormatted}`;
  }, []);

  const currentPreset = getCurrentPreset();
  const isCustomRange = !currentPreset;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("space-y-2", className)}
    >
      <Card>
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <h4 className="text-sm font-medium text-foreground">Time Range</h4>
                <p className="text-xs text-muted-foreground">
                  {formatDateRange(startDate, endDate)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Select
                value={isCustomRange ? 'custom' : currentPreset?.value}
                onValueChange={handlePresetChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  {presetRanges.map((preset) => {
                    const IconComponent = preset.icon;
                    return (
                      <SelectItem key={preset.value} value={preset.value}>
                        <div className="flex items-center space-x-2">
                          <IconComponent className="h-4 w-4" />
                          <span>{preset.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                  <SelectItem value="custom">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Custom Range</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {isCustomRange && (
                <Popover open={isCustomOpen} onOpenChange={setIsCustomOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      Custom
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
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
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Quick Actions */}
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const newStart = new Date(startDate);
            newStart.setDate(newStart.getDate() - 30);
            onDateRangeChange(newStart, endDate);
          }}
        >
          ← 30 days
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const newEnd = new Date(endDate);
            newEnd.setDate(newEnd.getDate() + 30);
            onDateRangeChange(startDate, newEnd);
          }}
        >
          30 days →
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const now = new Date();
            onDateRangeChange(now, now);
          }}
        >
          Today
        </Button>
      </div>
    </motion.div>
  );
};

export default TimeRangeSelector;

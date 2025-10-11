'use client';

import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';
import { format, parseISO, subMonths, addMonths } from 'date-fns';
import { ZoomIn, ZoomOut, RotateCcw, Download, TrendingUp, TrendingDown } from 'lucide-react';
import { Button, Card, CardBody, Skeleton, Tooltip as UITooltip } from '@/components/ui';
import { ForecastDataPoint } from '@/lib/api/forecasts';
import { cn } from '@/lib/utils';
import { usePerformanceMonitor } from '@/utils/performance-monitor';

interface ForecastChartProps {
  data: ForecastDataPoint[];
  isLoading?: boolean;
  onExport?: (format: 'csv' | 'json' | 'pdf') => void;
  className?: string;
  showAnnotations?: boolean;
  multipleSeries?: boolean;
  selectedSeries?: string[];
  onSeriesToggle?: (seriesId: string) => void;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const ChartTooltip: React.FC<ChartTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || !label) return null;

  const data = payload[0]?.payload;
  const isHistorical = data?.actual !== undefined;
  const date = format(parseISO(label), 'MMM dd, yyyy');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-background border border-border rounded-lg shadow-lg p-4 min-w-[200px]"
    >
      <div className="space-y-2">
        <p className="font-semibold text-foreground">{date}</p>
        
        {isHistorical && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Actual:</span>
            <span className="font-medium text-foreground">
              ${data.actual?.toLocaleString()}
            </span>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Predicted:</span>
          <span className="font-medium text-foreground">
            ${data.predicted?.toLocaleString()}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Confidence:</span>
          <span className="font-medium text-foreground">
            ${data.confidenceLower?.toLocaleString()} - ${data.confidenceUpper?.toLocaleString()}
          </span>
        </div>
        
        {isHistorical && (
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Variance:</span>
              <span className={cn(
                "font-medium flex items-center",
                data.actual > data.predicted ? "text-green-600" : "text-red-600"
              )}>
                {data.actual > data.predicted ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {Math.abs(((data.actual - data.predicted) / data.predicted) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const ForecastChart: React.FC<ForecastChartProps> = ({
  data,
  isLoading = false,
  onExport,
  className,
  showAnnotations = true,
  multipleSeries = false,
  selectedSeries = ['actual', 'predicted'],
  onSeriesToggle,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState(0);
  const chartRef = useRef<HTMLDivElement>(null);
  const { measureRender } = usePerformanceMonitor();

  // Memoize processed data for performance
  const processedData = useMemo(() => {
    return measureRender('forecast-chart-data-processing', () => {
      return data.map(point => ({
        ...point,
        date: point.date,
        actual: point.actual,
        predicted: point.predicted,
        confidenceLower: point.confidenceLower,
        confidenceUpper: point.confidenceUpper,
        // Add formatted date for display
        formattedDate: format(parseISO(point.date), 'MMM dd'),
      }));
    });
  }, [data, measureRender]);

  // Calculate chart domain for zoom and pan
  const chartDomain = useMemo(() => {
    const totalPoints = processedData.length;
    const visiblePoints = Math.max(10, Math.floor(totalPoints / zoomLevel));
    const startIndex = Math.max(0, Math.min(panOffset, totalPoints - visiblePoints));
    const endIndex = Math.min(totalPoints, startIndex + visiblePoints);
    
    return {
      start: startIndex,
      end: endIndex,
      data: processedData.slice(startIndex, endIndex),
    };
  }, [processedData, zoomLevel, panOffset]);

  // Find current date for reference line
  const currentDate = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return processedData.findIndex(point => point.date === today);
  }, [processedData]);

  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev * 1.5, 5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev / 1.5, 1));
  }, []);

  const handleReset = useCallback(() => {
    setZoomLevel(1);
    setPanOffset(0);
  }, []);

  const handlePan = useCallback((direction: 'left' | 'right') => {
    const step = Math.max(1, Math.floor(processedData.length / 20));
    setPanOffset(prev => {
      const newOffset = direction === 'left' ? prev + step : prev - step;
      return Math.max(0, Math.min(newOffset, processedData.length - Math.floor(processedData.length / zoomLevel)));
    });
  }, [processedData.length, zoomLevel]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      switch (e.key) {
        case '+':
        case '=':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
          e.preventDefault();
          handleZoomOut();
          break;
        case '0':
          e.preventDefault();
          handleReset();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePan('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          handlePan('right');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleZoomIn, handleZoomOut, handleReset, handlePan]);

  if (isLoading) {
    return (
      <Card className={cn("h-[500px]", className)}>
        <CardBody className="p-6">
          <Skeleton className="h-full w-full" />
        </CardBody>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn("space-y-4", className)}
    >
      {/* Chart Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <UITooltip content="Zoom In (+)">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 5}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </UITooltip>
          
          <UITooltip content="Zoom Out (-)">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 1}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
          </UITooltip>
          
          <UITooltip content="Reset View (0)">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </UITooltip>
          
          <div className="text-sm text-muted-foreground ml-4">
            Zoom: {zoomLevel.toFixed(1)}x
          </div>
        </div>

        {/* Series Toggle */}
        {multipleSeries && onSeriesToggle && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Series:</span>
            {['actual', 'predicted', 'confidence'].map((series) => (
              <Button
                key={series}
                variant={selectedSeries.includes(series) ? "default" : "outline"}
                size="sm"
                onClick={() => onSeriesToggle(series)}
                className="text-xs"
              >
                {series.charAt(0).toUpperCase() + series.slice(1)}
              </Button>
            ))}
          </div>
        )}

        <div className="flex items-center space-x-2">
          <UITooltip content="Pan Left (←)">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePan('left')}
              disabled={panOffset >= processedData.length - Math.floor(processedData.length / zoomLevel)}
            >
              ←
            </Button>
          </UITooltip>
          
          <UITooltip content="Pan Right (→)">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePan('right')}
              disabled={panOffset <= 0}
            >
              →
            </Button>
          </UITooltip>
          
          {onExport && (
            <UITooltip content="Export Chart">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport('csv')}
              >
                <Download className="h-4 w-4" />
              </Button>
            </UITooltip>
          )}
        </div>
      </div>

      {/* Chart */}
      <Card>
        <CardBody className="p-6">
          <div ref={chartRef} className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartDomain.data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                
                <XAxis
                  dataKey="formattedDate"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                
                <Tooltip content={<ChartTooltip />} />
                <Legend />
                
                {/* Confidence Interval Area */}
                <Area
                  type="monotone"
                  dataKey="confidenceUpper"
                  stroke="none"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.1}
                  name="Confidence Interval"
                />
                <Area
                  type="monotone"
                  dataKey="confidenceLower"
                  stroke="none"
                  fill="hsl(var(--background))"
                  fillOpacity={1}
                />
                
                {/* Historical Data Line */}
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="hsl(var(--foreground))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--foreground))", strokeWidth: 2, r: 4 }}
                  connectNulls={false}
                  name="Historical"
                />
                
                {/* Predicted Data Line */}
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                  name="Forecast"
                />
                
                {/* Current Date Reference Line */}
                {currentDate >= chartDomain.start && currentDate < chartDomain.end && (
                  <ReferenceLine
                    x={chartDomain.data[currentDate - chartDomain.start]?.formattedDate}
                    stroke="hsl(var(--destructive))"
                    strokeDasharray="2 2"
                    label={{ value: "Today", position: "top" }}
                  />
                )}

                {/* Annotations for Significant Events */}
                {showAnnotations && (
                  <>
                    {/* Example: Major expense event */}
                    <ReferenceLine
                      x="Jan 15"
                      stroke="hsl(var(--orange))"
                      strokeDasharray="3 3"
                      label={{ value: "Major Expense", position: "top" }}
                    />
                    {/* Example: Income increase */}
                    <ReferenceLine
                      x="Mar 01"
                      stroke="hsl(var(--green))"
                      strokeDasharray="3 3"
                      label={{ value: "Income Increase", position: "bottom" }}
                    />
                  </>
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>

      {/* Chart Info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-0.5 bg-foreground"></div>
            <span>Historical</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-0.5 bg-primary border-dashed border border-primary"></div>
            <span>Forecast</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary opacity-10 rounded"></div>
            <span>Confidence Interval</span>
          </div>
        </div>
        
        <div className="text-xs">
          Use + / - to zoom, ← / → to pan, 0 to reset
        </div>
      </div>
    </motion.div>
  );
};

export default ForecastChart;

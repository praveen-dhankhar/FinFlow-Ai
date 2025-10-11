'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Download, Settings, BarChart3, TrendingUp, Calendar, Lightbulb } from 'lucide-react';
import { subMonths, addMonths } from 'date-fns';
import { ErrorBoundary } from 'react-error-boundary';
import {
  Button,
  Card,
  CardHeader,
  CardBody,
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
import { ForecastChart, ScenarioPlanning, ForecastInsights, TimeRangeSelector, ModelSelector, ScenarioPlanner, TimeRangeControl } from '@/components/forecasts';
import {
  useForecastData,
  useScenarios,
  useCreateScenario,
  useUpdateScenario,
  useDeleteScenario,
  useForecastInsights,
  useForecastSummary,
  useExportForecast,
} from '@/hooks/useForecasts';
import { ForecastScenario } from '@/lib/api/forecasts';
import { cn } from '@/lib/utils';
import { usePerformanceMonitor } from '@/utils/performance-monitor';

// Error Fallback Component
const ErrorFallback: React.FC<{ error: Error; resetErrorBoundary: () => void }> = ({
  error,
  resetErrorBoundary,
}) => (
  <Card className="h-[400px] flex items-center justify-center">
    <CardBody className="text-center space-y-4">
      <div className="text-red-500 text-6xl">⚠️</div>
      <div>
        <h3 className="text-lg font-semibold text-foreground">Something went wrong</h3>
        <p className="text-muted-foreground mt-2">{error.message}</p>
      </div>
      <Button onClick={resetErrorBoundary} variant="outline">
        Try again
      </Button>
    </CardBody>
  </Card>
);

export default function ForecastsPage() {
  const { measureRender } = usePerformanceMonitor();
  
  // State management
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('');
  const [startDate, setStartDate] = useState<Date>(subMonths(new Date(), 6));
  const [endDate, setEndDate] = useState<Date>(addMonths(new Date(), 12));
  const [activeTab, setActiveTab] = useState('chart');
  const [selectedModelId, setSelectedModelId] = useState<string>('linear-regression');
  const [granularity, setGranularity] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [selectedSeries, setSelectedSeries] = useState<string[]>(['actual', 'predicted']);

  // API hooks
  const { data: scenarios = [], isLoading: scenariosLoading } = useScenarios();
  const { data: forecastData = [], isLoading: forecastLoading } = useForecastData({
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    scenarioId: selectedScenarioId || undefined,
  });
  const { data: insights = [], isLoading: insightsLoading } = useForecastInsights(selectedScenarioId);
  const { data: summary, isLoading: summaryLoading } = useForecastSummary(selectedScenarioId);

  // Mutations
  const createScenario = useCreateScenario();
  const updateScenario = useUpdateScenario();
  const deleteScenario = useDeleteScenario();
  const exportForecast = useExportForecast();

  // Set default scenario when scenarios load
  React.useEffect(() => {
    if (scenarios.length > 0 && !selectedScenarioId) {
      const defaultScenario = scenarios.find(s => s.isDefault) || scenarios[0];
      setSelectedScenarioId(defaultScenario.id);
    }
  }, [scenarios, selectedScenarioId]);

  // Memoized handlers for performance
  const handleScenarioSelect = useCallback((scenarioId: string) => {
    setSelectedScenarioId(scenarioId);
  }, []);

  const handleScenarioCreate = useCallback(async (scenario: Omit<ForecastScenario, 'id' | 'createdAt' | 'updatedAt'>) => {
    await createScenario.mutateAsync(scenario);
  }, [createScenario]);

  const handleScenarioUpdate = useCallback(async (id: string, updates: Partial<Omit<ForecastScenario, 'id' | 'createdAt'>>) => {
    await updateScenario.mutateAsync({ id, updates });
  }, [updateScenario]);

  const handleScenarioDelete = useCallback(async (id: string) => {
    await deleteScenario.mutateAsync(id);
  }, [deleteScenario]);

  const handleScenarioDuplicate = useCallback(async (scenario: ForecastScenario) => {
    const duplicatedScenario = {
      name: `${scenario.name} (Copy)`,
      description: scenario.description,
      incomeAdjustment: scenario.incomeAdjustment,
      expenseAdjustment: scenario.expenseAdjustment,
      isDefault: false,
    };
    await createScenario.mutateAsync(duplicatedScenario);
  }, [createScenario]);

  const handleDateRangeChange = useCallback((newStartDate: Date, newEndDate: Date) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  }, []);

  const handleExport = useCallback(async (format: 'csv' | 'json' | 'pdf') => {
    await exportForecast.mutateAsync({
      format,
      filters: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        scenarioId: selectedScenarioId || undefined,
      },
    });
  }, [exportForecast, startDate, endDate, selectedScenarioId]);

  const handleGranularityChange = useCallback((newGranularity: 'daily' | 'weekly' | 'monthly') => {
    setGranularity(newGranularity);
  }, []);

  const handleSeriesToggle = useCallback((seriesId: string) => {
    setSelectedSeries(prev => 
      prev.includes(seriesId) 
        ? prev.filter(id => id !== seriesId)
        : [...prev, seriesId]
    );
  }, []);

  const handleModelSelect = useCallback((modelId: string) => {
    setSelectedModelId(modelId);
  }, []);

  const handleCompareModels = useCallback((modelIds: string[]) => {
    console.log('Comparing models:', modelIds);
    // In a real app, this would trigger model comparison
  }, []);

  // Loading state
  const isLoading = forecastLoading || scenariosLoading || insightsLoading || summaryLoading;

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
              <h1 className="text-3xl font-bold text-foreground">Financial Forecasts</h1>
              <p className="text-muted-foreground">
                Predict and plan your financial future with AI-powered insights
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExport('csv')}>
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('json')}>
                    Export as JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('pdf')}>
                    Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          {/* Time Range Control */}
          <div className="mb-6">
            <TimeRangeControl
              startDate={startDate}
              endDate={endDate}
              granularity={granularity}
              onDateRangeChange={handleDateRangeChange}
              onGranularityChange={handleGranularityChange}
            />
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Chart Area - Takes up 3 columns */}
            <div className="lg:col-span-3">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="chart" className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>Chart View</span>
                  </TabsTrigger>
                  <TabsTrigger value="insights" className="flex items-center space-x-2">
                    <Lightbulb className="h-4 w-4" />
                    <span>Insights</span>
                  </TabsTrigger>
                  <TabsTrigger value="scenarios" className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>Scenarios</span>
                  </TabsTrigger>
                  <TabsTrigger value="models" className="flex items-center space-x-2">
                    <Brain className="h-4 w-4" />
                    <span>Models</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="chart" className="space-y-4">
                  <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <ForecastChart
                      data={forecastData}
                      isLoading={isLoading}
                      onExport={handleExport}
                      showAnnotations={true}
                      multipleSeries={true}
                      selectedSeries={selectedSeries}
                      onSeriesToggle={handleSeriesToggle}
                    />
                  </ErrorBoundary>
                </TabsContent>

                <TabsContent value="insights" className="space-y-4">
                  <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <ForecastInsights
                      insights={insights}
                      summary={summary}
                      isLoading={isLoading}
                    />
                  </ErrorBoundary>
                </TabsContent>

                <TabsContent value="scenarios" className="space-y-4">
                  <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <ScenarioPlanner
                      scenarios={scenarios}
                      selectedScenarioId={selectedScenarioId}
                      onScenarioSelect={handleScenarioSelect}
                      onScenarioCreate={handleScenarioCreate}
                      onScenarioUpdate={handleScenarioUpdate}
                      onScenarioDelete={handleScenarioDelete}
                      onScenarioDuplicate={handleScenarioDuplicate}
                      isLoading={scenariosLoading}
                    />
                  </ErrorBoundary>
                </TabsContent>

                <TabsContent value="models" className="space-y-4">
                  <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <ModelSelector
                      selectedModelId={selectedModelId}
                      onModelSelect={handleModelSelect}
                      onCompareModels={handleCompareModels}
                    />
                  </ErrorBoundary>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar - Takes up 1 column */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-foreground">Quick Stats</h3>
                </CardHeader>
                <CardBody className="space-y-4">
                  {isLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ) : (
                    <>
                      <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-2xl font-bold text-green-600">
                          ${summary?.totalPredictedIncome?.toLocaleString() || '0'}
                        </div>
                        <div className="text-sm text-green-700">Predicted Income</div>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="text-2xl font-bold text-red-600">
                          ${summary?.totalPredictedExpenses?.toLocaleString() || '0'}
                        </div>
                        <div className="text-sm text-red-700">Predicted Expenses</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-2xl font-bold text-blue-600">
                          ${summary?.netWorthProjection?.toLocaleString() || '0'}
                        </div>
                        <div className="text-sm text-blue-700">Net Worth</div>
                      </div>
                    </>
                  )}
                </CardBody>
              </Card>

              {/* Selected Scenario Info */}
              {selectedScenarioId && (
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-foreground">Current Scenario</h3>
                  </CardHeader>
                  <CardBody>
                    {isLoading ? (
                      <Skeleton className="h-20 w-full" />
                    ) : (
                      (() => {
                        const scenario = scenarios.find(s => s.id === selectedScenarioId);
                        if (!scenario) return null;
                        
                        return (
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-medium text-foreground">{scenario.name}</h4>
                              {scenario.description && (
                                <p className="text-sm text-muted-foreground">{scenario.description}</p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Income:</span>
                                <span className={cn(
                                  "font-medium",
                                  scenario.incomeAdjustment > 0 ? "text-green-600" : 
                                  scenario.incomeAdjustment < 0 ? "text-red-600" : "text-muted-foreground"
                                )}>
                                  {scenario.incomeAdjustment > 0 ? '+' : ''}{scenario.incomeAdjustment}%
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Expenses:</span>
                                <span className={cn(
                                  "font-medium",
                                  scenario.expenseAdjustment > 0 ? "text-red-600" : 
                                  scenario.expenseAdjustment < 0 ? "text-green-600" : "text-muted-foreground"
                                )}>
                                  {scenario.expenseAdjustment > 0 ? '+' : ''}{scenario.expenseAdjustment}%
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })()
                    )}
                  </CardBody>
                </Card>
              )}

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-foreground">Performance</h3>
                </CardHeader>
                <CardBody className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Confidence Score:</span>
                    <span className="font-medium text-foreground">
                      {summary?.confidenceScore || 0}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Risk Level:</span>
                    <span className={cn(
                      "font-medium capitalize",
                      summary?.riskLevel === 'high' ? "text-red-600" :
                      summary?.riskLevel === 'medium' ? "text-yellow-600" : "text-green-600"
                    )}>
                      {summary?.riskLevel || 'unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Data Points:</span>
                    <span className="font-medium text-foreground">
                      {forecastData.length}
                    </span>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
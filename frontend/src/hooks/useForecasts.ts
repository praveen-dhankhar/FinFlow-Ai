import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { forecastService, ForecastScenario, ForecastFilters, ForecastInsight, ForecastSummary } from '@/lib/api/forecasts';
import { queryKeys } from '@/lib/api/query-client';
import { useToast } from '@/components/ui';

export const useForecastData = (filters?: ForecastFilters) => {
  return useQuery({
    queryKey: [...queryKeys.forecasts.all, 'data', filters],
    queryFn: () => forecastService.getForecastData(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

export const useScenarios = () => {
  return useQuery({
    queryKey: [...queryKeys.forecasts.all, 'scenarios'],
    queryFn: forecastService.getScenarios,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateScenario = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: forecastService.createScenario,
    onSuccess: (newScenario) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.forecasts.all });
      addToast({
        title: 'Scenario Created',
        description: `${newScenario.name} has been created successfully.`,
        variant: 'success',
      });
    },
    onError: (error) => {
      addToast({
        title: 'Failed to Create Scenario',
        description: error.message,
        variant: 'error',
      });
    },
  });
};

export const useUpdateScenario = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Omit<ForecastScenario, 'id' | 'createdAt'>> }) =>
      forecastService.updateScenario(id, updates),
    onSuccess: (updatedScenario) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.forecasts.all });
      addToast({
        title: 'Scenario Updated',
        description: `${updatedScenario.name} has been updated successfully.`,
        variant: 'success',
      });
    },
    onError: (error) => {
      addToast({
        title: 'Failed to Update Scenario',
        description: error.message,
        variant: 'error',
      });
    },
  });
};

export const useDeleteScenario = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: forecastService.deleteScenario,
    onSuccess: (_, scenarioId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.forecasts.all });
      addToast({
        title: 'Scenario Deleted',
        description: `Scenario has been removed successfully.`,
        variant: 'success',
      });
    },
    onError: (error) => {
      addToast({
        title: 'Failed to Delete Scenario',
        description: error.message,
        variant: 'error',
      });
    },
  });
};

export const useForecastInsights = (scenarioId?: string) => {
  return useQuery({
    queryKey: [...queryKeys.forecasts.all, 'insights', scenarioId],
    queryFn: () => forecastService.getForecastInsights(scenarioId),
    staleTime: 5 * 60 * 1000,
  });
};

export const useForecastSummary = (scenarioId?: string) => {
  return useQuery({
    queryKey: [...queryKeys.forecasts.all, 'summary', scenarioId],
    queryFn: () => forecastService.getForecastSummary(scenarioId),
    staleTime: 5 * 60 * 1000,
  });
};

export const useExportForecast = () => {
  const { addToast } = useToast();

  return useMutation({
    mutationFn: ({ format, filters }: { format: 'csv' | 'json' | 'pdf'; filters?: ForecastFilters }) =>
      forecastService.exportForecast(format, filters),
    onSuccess: (blob, { format }) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `forecast-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      addToast({
        title: 'Export Successful',
        description: `Forecast data exported as ${format.toUpperCase()}.`,
        variant: 'success',
      });
    },
    onError: (error) => {
      addToast({
        title: 'Export Failed',
        description: error.message,
        variant: 'error',
      });
    },
  });
};

import apiClient from './client';
import { ApiError } from '@/types/auth';

export interface ForecastDataPoint {
  date: string;
  actual?: number;
  predicted: number;
  confidenceLower: number;
  confidenceUpper: number;
  scenario?: string;
}

export interface ForecastScenario {
  id: string;
  name: string;
  description?: string;
  incomeAdjustment: number; // -50 to 100 (percentage)
  expenseAdjustment: number; // -50 to 100 (percentage)
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ForecastInsight {
  id: string;
  type: 'prediction' | 'risk' | 'opportunity' | 'recommendation';
  title: string;
  description: string;
  confidence: number; // 0-100
  impact: 'low' | 'medium' | 'high';
  timeframe: 'short' | 'medium' | 'long';
  actionable: boolean;
  category?: string;
}

export interface ForecastSummary {
  totalPredictedIncome: number;
  totalPredictedExpenses: number;
  netWorthProjection: number;
  confidenceScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  keyTrends: string[];
  recommendations: string[];
}

export interface ForecastFilters {
  startDate?: string;
  endDate?: string;
  scenarioId?: string;
  includeHistorical?: boolean;
  confidenceLevel?: number; // 0-100
}

export const forecastService = {
  getForecastData: async (filters?: ForecastFilters): Promise<ForecastDataPoint[]> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate mock forecast data
    const startDate = filters?.startDate ? new Date(filters.startDate) : new Date();
    const endDate = filters?.endDate ? new Date(filters.endDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year from now
    
    const data: ForecastDataPoint[] = [];
    const currentDate = new Date(startDate);
    
    // Historical data (last 6 months)
    const historicalStart = new Date();
    historicalStart.setMonth(historicalStart.getMonth() - 6);
    
    while (currentDate <= endDate) {
      const isHistorical = currentDate <= new Date();
      const baseAmount = 5000 + Math.sin(currentDate.getTime() / (1000 * 60 * 60 * 24 * 30)) * 1000; // Monthly variation
      const trend = (currentDate.getTime() - startDate.getTime()) / (365 * 24 * 60 * 60 * 1000) * 200; // Annual trend
      
      const predicted = baseAmount + trend + (Math.random() - 0.5) * 500;
      const confidence = Math.max(0.7, 1 - (currentDate.getTime() - Date.now()) / (365 * 24 * 60 * 60 * 1000)); // Confidence decreases over time
      
      data.push({
        date: currentDate.toISOString().split('T')[0],
        actual: isHistorical ? predicted + (Math.random() - 0.5) * 200 : undefined,
        predicted,
        confidenceLower: predicted * (1 - confidence * 0.2),
        confidenceUpper: predicted * (1 + confidence * 0.2),
      });
      
      currentDate.setDate(currentDate.getDate() + 7); // Weekly data points
    }
    
    return data;
  },

  getScenarios: async (): Promise<ForecastScenario[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return [
      {
        id: 'scenario-1',
        name: 'Conservative',
        description: 'Conservative growth with minimal changes',
        incomeAdjustment: 5,
        expenseAdjustment: -10,
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'scenario-2',
        name: 'Optimistic',
        description: 'High growth scenario with increased income',
        incomeAdjustment: 25,
        expenseAdjustment: 5,
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'scenario-3',
        name: 'Pessimistic',
        description: 'Economic downturn scenario',
        incomeAdjustment: -20,
        expenseAdjustment: 15,
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  },

  createScenario: async (scenario: Omit<ForecastScenario, 'id' | 'createdAt' | 'updatedAt'>): Promise<ForecastScenario> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      ...scenario,
      id: `scenario-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  updateScenario: async (id: string, updates: Partial<Omit<ForecastScenario, 'id' | 'createdAt'>>): Promise<ForecastScenario> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const scenarios = await forecastService.getScenarios();
    const existingScenario = scenarios.find(s => s.id === id);
    if (!existingScenario) {
      throw new ApiError('Scenario not found', 'NOT_FOUND', 404, new Date().toISOString(), `/scenarios/${id}`);
    }
    
    return {
      ...existingScenario,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
  },

  deleteScenario: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log(`Deleted scenario with ID: ${id}`);
  },

  getForecastInsights: async (scenarioId?: string): Promise<ForecastInsight[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        id: 'insight-1',
        type: 'prediction',
        title: 'Net Worth Growth',
        description: 'Your net worth is projected to grow by 15% over the next 12 months based on current trends.',
        confidence: 85,
        impact: 'high',
        timeframe: 'long',
        actionable: true,
        category: 'wealth',
      },
      {
        id: 'insight-2',
        type: 'risk',
        title: 'Expense Volatility',
        description: 'High variability in entertainment expenses could impact budget stability.',
        confidence: 70,
        impact: 'medium',
        timeframe: 'short',
        actionable: true,
        category: 'expenses',
      },
      {
        id: 'insight-3',
        type: 'opportunity',
        title: 'Investment Opportunity',
        description: 'Consider increasing investment allocation by 5% to maximize long-term returns.',
        confidence: 80,
        impact: 'high',
        timeframe: 'medium',
        actionable: true,
        category: 'investments',
      },
      {
        id: 'insight-4',
        type: 'recommendation',
        title: 'Emergency Fund',
        description: 'Build emergency fund to 6 months of expenses for better financial security.',
        confidence: 95,
        impact: 'high',
        timeframe: 'medium',
        actionable: true,
        category: 'savings',
      },
    ];
  },

  getForecastSummary: async (scenarioId?: string): Promise<ForecastSummary> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      totalPredictedIncome: 75000,
      totalPredictedExpenses: 45000,
      netWorthProjection: 30000,
      confidenceScore: 82,
      riskLevel: 'medium',
      keyTrends: [
        'Steady income growth projected',
        'Expense optimization opportunities identified',
        'Investment returns improving',
      ],
      recommendations: [
        'Consider increasing emergency fund',
        'Optimize high-expense categories',
        'Diversify investment portfolio',
      ],
    };
  },

  exportForecast: async (format: 'csv' | 'json' | 'pdf', filters?: ForecastFilters): Promise<Blob> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const data = await forecastService.getForecastData(filters);
    
    if (format === 'csv') {
      const csvContent = [
        'Date,Actual,Predicted,Confidence Lower,Confidence Upper',
        ...data.map(d => `${d.date},${d.actual || ''},${d.predicted},${d.confidenceLower},${d.confidenceUpper}`)
      ].join('\n');
      
      return new Blob([csvContent], { type: 'text/csv' });
    } else if (format === 'json') {
      return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    } else {
      // Mock PDF
      return new Blob(['PDF content'], { type: 'application/pdf' });
    }
  },
};

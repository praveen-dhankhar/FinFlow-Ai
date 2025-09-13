'use client';

import { useState, useEffect, useCallback } from 'react';

interface ForecastResult {
  id: number;
  userId: number;
  date: string;
  predictedAmount: number;
  confidence: number;
  algorithm: string;
  category: string;
  type: 'INCOME' | 'EXPENSE';
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export default function ForecastsPage() {
  const [forecasts, setForecasts] = useState<ForecastResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock forecast data
  const mockForecasts: ForecastResult[] = [
    {
      id: 1,
      userId: 1,
      date: '2024-02-01',
      predictedAmount: 5200,
      confidence: 0.85,
      algorithm: 'LINEAR_REGRESSION',
      category: 'Salary',
      type: 'INCOME'
    },
    {
      id: 2,
      userId: 1,
      date: '2024-02-02',
      predictedAmount: 1250,
      confidence: 0.92,
      algorithm: 'SMA',
      category: 'Rent',
      type: 'EXPENSE'
    },
    {
      id: 3,
      userId: 1,
      date: '2024-02-03',
      predictedAmount: 320,
      confidence: 0.78,
      algorithm: 'LINEAR_REGRESSION',
      category: 'Groceries',
      type: 'EXPENSE'
    },
    {
      id: 4,
      userId: 1,
      date: '2024-02-04',
      predictedAmount: 750,
      confidence: 0.65,
      algorithm: 'SMA',
      category: 'Freelance',
      type: 'INCOME'
    }
  ];

  const loadForecasts = useCallback(async () => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setForecasts(mockForecasts);
    } catch (err) {
      setError('Failed to load forecasts');
      console.error('Forecasts error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadForecasts();
  }, [loadForecasts]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading forecasts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={loadForecasts}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Financial Forecasts</h1>
              <p className="text-gray-600">AI-powered predictions for your financial future</p>
            </div>
            <div className="flex space-x-4">
              <a href="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Dashboard
              </a>
              <a href="/transactions" className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
                Transactions
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Forecast Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forecasts.map((forecast) => (
            <div key={forecast.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${forecast.type === 'INCOME' ? 'bg-green-100' : 'bg-red-100'}`}>
                  <span className={`text-lg ${forecast.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                    {forecast.type === 'INCOME' ? '💰' : '💸'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-500">Confidence</span>
                  <p className="text-lg font-semibold text-gray-900">
                    {Math.round(forecast.confidence * 100)}%
                  </p>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{forecast.category}</h3>
              <p className="text-sm text-gray-600 mb-4">{forecast.algorithm}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Predicted Amount:</span>
                  <span className={`font-semibold ${forecast.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                    {forecast.type === 'INCOME' ? '+' : '-'}${forecast.predictedAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Date:</span>
                  <span className="text-sm text-gray-900">{new Date(forecast.date).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Algorithm</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">{forecast.algorithm}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Forecast Insights */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Forecast Insights</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Top Performing Models</h3>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>• Linear Regression: 85% accuracy</li>
                  <li>• Simple Moving Average: 78% accuracy</li>
                  <li>• Seasonal Decomposition: 72% accuracy</li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">Prediction Summary</h3>
                <ul className="space-y-1 text-sm text-green-800">
                  <li>• Total predicted income: $5,950</li>
                  <li>• Total predicted expenses: $1,570</li>
                  <li>• Net predicted amount: $4,380</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
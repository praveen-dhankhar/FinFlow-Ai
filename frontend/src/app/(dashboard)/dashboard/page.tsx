'use client';

import { useState, useEffect } from 'react';

// Types based on backend DTOs
interface FinancialData {
  id: number;
  userId: number;
  date: string;
  amount: number;
  category: string;
  description: string;
  type: 'INCOME' | 'EXPENSE';
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: number;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  parentId?: number;
  isActive: boolean;
  usageCount: number;
  children?: Category[];
}

interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
  transactionCount: number;
}

interface CategoryAggregation {
  category: string;
  totalAmount: number;
  transactionCount: number;
  type: string;
}

interface MonthlyTrend {
  month: string;
  income: number;
  expense: number;
  net: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export default function Dashboard() {
  const [financialData, setFinancialData] = useState<FinancialData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [categoryAggregations, setCategoryAggregations] = useState<CategoryAggregation[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration (since we're removing auth)
  const mockFinancialData: FinancialData[] = [
    {
      id: 1,
      userId: 1,
      date: '2024-01-15',
      amount: 5000,
      category: 'Salary',
      description: 'Monthly salary',
      type: 'INCOME',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 2,
      userId: 1,
      date: '2024-01-16',
      amount: 1200,
      category: 'Rent',
      description: 'Monthly rent payment',
      type: 'EXPENSE',
      createdAt: '2024-01-16T09:00:00Z',
      updatedAt: '2024-01-16T09:00:00Z'
    },
    {
      id: 3,
      userId: 1,
      date: '2024-01-17',
      amount: 300,
      category: 'Groceries',
      description: 'Weekly grocery shopping',
      type: 'EXPENSE',
      createdAt: '2024-01-17T14:30:00Z',
      updatedAt: '2024-01-17T14:30:00Z'
    },
    {
      id: 4,
      userId: 1,
      date: '2024-01-18',
      amount: 800,
      category: 'Freelance',
      description: 'Web development project',
      type: 'INCOME',
      createdAt: '2024-01-18T16:00:00Z',
      updatedAt: '2024-01-18T16:00:00Z'
    }
  ];

  const mockCategories: Category[] = [
    { id: 1, name: 'Income', description: 'All income sources', color: '#10B981', icon: '💰', isActive: true, usageCount: 2 },
    { id: 2, name: 'Expenses', description: 'All expenses', color: '#EF4444', icon: '💸', isActive: true, usageCount: 2 },
    { id: 3, name: 'Salary', description: 'Regular salary', color: '#3B82F6', icon: '💼', parentId: 1, isActive: true, usageCount: 1 },
    { id: 4, name: 'Freelance', description: 'Freelance work', color: '#8B5CF6', icon: '💻', parentId: 1, isActive: true, usageCount: 1 },
    { id: 5, name: 'Rent', description: 'Housing costs', color: '#F59E0B', icon: '🏠', parentId: 2, isActive: true, usageCount: 1 },
    { id: 6, name: 'Groceries', description: 'Food and household', color: '#06B6D4', icon: '🛒', parentId: 2, isActive: true, usageCount: 1 }
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // For now, use mock data since we're removing authentication
      // In a real app, these would be API calls:
      // const [financialRes, categoriesRes, summaryRes, aggregationsRes, trendsRes] = await Promise.all([
      //   fetch(`${API_BASE}/v1/financial-data?page=0&size=20`),
      //   fetch(`${API_BASE}/v1/categories`),
      //   fetch(`${API_BASE}/v1/financial-data/summaries`),
      //   fetch(`${API_BASE}/v1/financial-data/categories`),
      //   fetch(`${API_BASE}/v1/financial-data/trends/monthly?months=6`)
      // ]);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setFinancialData(mockFinancialData);
      setCategories(mockCategories);
      
      // Calculate summary from mock data
      const totalIncome = mockFinancialData
        .filter(item => item.type === 'INCOME')
        .reduce((sum, item) => sum + item.amount, 0);
      const totalExpense = mockFinancialData
        .filter(item => item.type === 'EXPENSE')
        .reduce((sum, item) => sum + item.amount, 0);
      
      setSummary({
        totalIncome,
        totalExpense,
        netAmount: totalIncome - totalExpense,
        transactionCount: mockFinancialData.length
      });

      // Calculate category aggregations
      const aggregations: CategoryAggregation[] = [];
      const categoryMap = new Map<string, { total: number; count: number; type: string }>();
      
      mockFinancialData.forEach(item => {
        const existing = categoryMap.get(item.category) || { total: 0, count: 0, type: item.type };
        existing.total += item.amount;
        existing.count += 1;
        existing.type = item.type;
        categoryMap.set(item.category, existing);
      });

      categoryMap.forEach((value, category) => {
        aggregations.push({
          category,
          totalAmount: value.total,
          transactionCount: value.count,
          type: value.type
        });
      });

      setCategoryAggregations(aggregations);

      // Mock monthly trends
      setMonthlyTrends([
        { month: '2024-01', income: 5800, expense: 1500, net: 4300 },
        { month: '2023-12', income: 5000, expense: 1800, net: 3200 },
        { month: '2023-11', income: 5200, expense: 1600, net: 3600 },
        { month: '2023-10', income: 4800, expense: 2000, net: 2800 },
        { month: '2023-09', income: 5500, expense: 1700, net: 3800 },
        { month: '2023-08', income: 5100, expense: 1900, net: 3200 }
      ]);

    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
            onClick={loadDashboardData}
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
              <h1 className="text-3xl font-bold text-gray-900">Finance Dashboard</h1>
              <p className="text-gray-600">Track your financial health and insights</p>
            </div>
            <div className="flex space-x-4">
              <a href="/transactions" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                View Transactions
              </a>
              <a href="/forecasts" className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
                View Forecasts
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-green-600 text-xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Income</p>
                <p className="text-2xl font-bold text-green-600">
                  ${summary?.totalIncome.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <span className="text-red-600 text-xl">💸</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  ${summary?.totalExpense.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${(summary?.netAmount || 0) >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <span className={`text-xl ${(summary?.netAmount || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  📊
                </span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Net Amount</p>
                <p className={`text-2xl font-bold ${(summary?.netAmount || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${summary?.netAmount.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-blue-600 text-xl">📈</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Transactions</p>
                <p className="text-2xl font-bold text-blue-600">
                  {summary?.transactionCount || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {financialData.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ${transaction.type === 'INCOME' ? 'bg-green-100' : 'bg-red-100'}`}>
                        <span className={`text-lg ${transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'INCOME' ? '💰' : '💸'}
                        </span>
                      </div>
                      <div className="ml-4">
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-600">{transaction.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'INCOME' ? '+' : '-'}${transaction.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Category Breakdown</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {categoryAggregations.map((agg, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-3 ${agg.type === 'INCOME' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="font-medium text-gray-900">{agg.category}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${agg.totalAmount.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">{agg.transactionCount} transactions</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Trends Chart */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Monthly Trends</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {monthlyTrends.map((trend, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">{trend.month}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Income:</span>
                      <span className="text-sm font-medium text-green-600">${trend.income.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Expenses:</span>
                      <span className="text-sm font-medium text-red-600">${trend.expense.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-sm font-medium text-gray-900">Net:</span>
                      <span className={`text-sm font-bold ${trend.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${trend.net.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Categories Overview */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <div key={category.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-3">{category.icon}</span>
                    <div>
                      <h3 className="font-medium text-gray-900">{category.name}</h3>
                      {category.description && (
                        <p className="text-sm text-gray-600">{category.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Used {category.usageCount} times</span>
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

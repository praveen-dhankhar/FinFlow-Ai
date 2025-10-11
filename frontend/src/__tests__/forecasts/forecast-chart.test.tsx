/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ForecastChart } from '@/components/forecasts';
import { ForecastDataPoint } from '@/lib/api/forecasts';

// Mock the performance monitor
jest.mock('@/utils/performance-monitor', () => ({
  usePerformanceMonitor: () => ({
    measureRender: jest.fn((name, fn) => fn()),
  }),
}));

// Mock Recharts components
jest.mock('recharts', () => ({
  ComposedChart: ({ children, data }: any) => (
    <div data-testid="composed-chart" data-chart-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  Line: ({ dataKey, name }: any) => (
    <div data-testid={`line-${dataKey}`} data-name={name} />
  ),
  Area: ({ dataKey, name }: any) => (
    <div data-testid={`area-${dataKey}`} data-name={name} />
  ),
  XAxis: ({ dataKey }: any) => <div data-testid="x-axis" data-key={dataKey} />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: ({ content }: any) => <div data-testid="tooltip">{content}</div>,
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  ReferenceLine: ({ x, label }: any) => (
    <div data-testid="reference-line" data-x={x} data-label={label?.value} />
  ),
  Legend: () => <div data-testid="legend" />,
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

const mockForecastData: ForecastDataPoint[] = [
  {
    date: '2024-01-01',
    actual: 5000,
    predicted: 5200,
    confidenceLower: 4800,
    confidenceUpper: 5600,
  },
  {
    date: '2024-01-08',
    actual: 5100,
    predicted: 5300,
    confidenceLower: 4900,
    confidenceUpper: 5700,
  },
  {
    date: '2024-01-15',
    predicted: 5400,
    confidenceLower: 5000,
    confidenceUpper: 5800,
  },
];

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('ForecastChart', () => {
  const mockOnExport = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders chart with forecast data', () => {
    renderWithQueryClient(
      <ForecastChart data={mockForecastData} onExport={mockOnExport} />
    );

    expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('line-actual')).toBeInTheDocument();
    expect(screen.getByTestId('line-predicted')).toBeInTheDocument();
    expect(screen.getByTestId('area-confidenceUpper')).toBeInTheDocument();
  });

  it('displays loading skeleton when loading', () => {
    renderWithQueryClient(
      <ForecastChart data={[]} isLoading={true} onExport={mockOnExport} />
    );

    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('renders chart controls', () => {
    renderWithQueryClient(
      <ForecastChart data={mockForecastData} onExport={mockOnExport} />
    );

    expect(screen.getByRole('button', { name: /zoom in/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /zoom out/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset view/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /export chart/i })).toBeInTheDocument();
  });

  it('handles zoom controls', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(
      <ForecastChart data={mockForecastData} onExport={mockOnExport} />
    );

    const zoomInButton = screen.getByRole('button', { name: /zoom in/i });
    const zoomOutButton = screen.getByRole('button', { name: /zoom out/i });
    const resetButton = screen.getByRole('button', { name: /reset view/i });

    // Test zoom in
    await user.click(zoomInButton);
    expect(screen.getByText(/zoom: 1\.5x/i)).toBeInTheDocument();

    // Test zoom out
    await user.click(zoomOutButton);
    expect(screen.getByText(/zoom: 1\.0x/i)).toBeInTheDocument();

    // Test reset
    await user.click(zoomInButton);
    await user.click(zoomInButton);
    await user.click(resetButton);
    expect(screen.getByText(/zoom: 1\.0x/i)).toBeInTheDocument();
  });

  it('handles pan controls', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(
      <ForecastChart data={mockForecastData} onExport={mockOnExport} />
    );

    const panLeftButton = screen.getByRole('button', { name: /pan left/i });
    const panRightButton = screen.getByRole('button', { name: /pan right/i });

    // Test pan left
    await user.click(panLeftButton);
    
    // Test pan right
    await user.click(panRightButton);
  });

  it('handles export functionality', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(
      <ForecastChart data={mockForecastData} onExport={mockOnExport} />
    );

    const exportButton = screen.getByRole('button', { name: /export chart/i });
    await user.click(exportButton);

    expect(mockOnExport).toHaveBeenCalledWith('csv');
  });

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(
      <ForecastChart data={mockForecastData} onExport={mockOnExport} />
    );

    // Test zoom in with keyboard
    await user.keyboard('+');
    expect(screen.getByText(/zoom: 1\.5x/i)).toBeInTheDocument();

    // Test zoom out with keyboard
    await user.keyboard('-');
    expect(screen.getByText(/zoom: 1\.0x/i)).toBeInTheDocument();

    // Test reset with keyboard
    await user.keyboard('+');
    await user.keyboard('0');
    expect(screen.getByText(/zoom: 1\.0x/i)).toBeInTheDocument();

    // Test pan with keyboard
    await user.keyboard('{ArrowLeft}');
    await user.keyboard('{ArrowRight}');
  });

  it('displays chart legend and info', () => {
    renderWithQueryClient(
      <ForecastChart data={mockForecastData} onExport={mockOnExport} />
    );

    expect(screen.getByText('Historical')).toBeInTheDocument();
    expect(screen.getByText('Forecast')).toBeInTheDocument();
    expect(screen.getByText('Confidence Interval')).toBeInTheDocument();
    expect(screen.getByText(/use \+ \/ - to zoom/i)).toBeInTheDocument();
  });

  it('processes data correctly', () => {
    renderWithQueryClient(
      <ForecastChart data={mockForecastData} onExport={mockOnExport} />
    );

    const chartElement = screen.getByTestId('composed-chart');
    const chartData = JSON.parse(chartElement.getAttribute('data-chart-data') || '[]');
    
    expect(chartData).toHaveLength(3);
    expect(chartData[0]).toHaveProperty('date', '2024-01-01');
    expect(chartData[0]).toHaveProperty('actual', 5000);
    expect(chartData[0]).toHaveProperty('predicted', 5200);
  });

  it('handles empty data gracefully', () => {
    renderWithQueryClient(
      <ForecastChart data={[]} onExport={mockOnExport} />
    );

    expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    const chartElement = screen.getByTestId('composed-chart');
    const chartData = JSON.parse(chartElement.getAttribute('data-chart-data') || '[]');
    expect(chartData).toHaveLength(0);
  });

  it('applies correct CSS classes', () => {
    renderWithQueryClient(
      <ForecastChart 
        data={mockForecastData} 
        onExport={mockOnExport}
        className="custom-class"
      />
    );

    const container = screen.getByTestId('composed-chart').closest('.custom-class');
    expect(container).toBeInTheDocument();
  });
});

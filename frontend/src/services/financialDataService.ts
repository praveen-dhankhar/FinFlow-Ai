import apiService from './api';
import type { 
  FinancialData, 
  FinancialDataCreateDto, 
  FinancialDataUpdateDto,
  PaginatedResponse,
  TimeSeriesData 
} from '../types';

export class FinancialDataService {
  async getFinancialData(params?: {
    page?: number;
    size?: number;
    type?: 'INCOME' | 'EXPENSE';
    category?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<FinancialData>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const response = await apiService.get<PaginatedResponse<FinancialData>>(
      `/api/financial-data?${queryParams.toString()}`
    );
    return response.data;
  }

  async getFinancialDataById(id: number): Promise<FinancialData> {
    const response = await apiService.get<FinancialData>(`/api/financial-data/${id}`);
    return response.data;
  }

  async createFinancialData(data: FinancialDataCreateDto): Promise<FinancialData> {
    const response = await apiService.post<FinancialData>('/api/financial-data', data);
    return response.data;
  }

  async updateFinancialData(id: number, data: FinancialDataUpdateDto): Promise<FinancialData> {
    const response = await apiService.put<FinancialData>(`/api/financial-data/${id}`, data);
    return response.data;
  }

  async deleteFinancialData(id: number): Promise<void> {
    await apiService.delete(`/api/financial-data/${id}`);
  }

  async getFinancialDataByDateRange(
    startDate: string, 
    endDate: string
  ): Promise<FinancialData[]> {
    const response = await apiService.get<FinancialData[]>(
      `/api/financial-data/range?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  }

  async getTimeSeriesData(
    startDate: string, 
    endDate: string, 
    groupBy: 'day' | 'week' | 'month' = 'day'
  ): Promise<TimeSeriesData[]> {
    const response = await apiService.get<TimeSeriesData[]>(
      `/api/financial-data/timeseries?startDate=${startDate}&endDate=${endDate}&groupBy=${groupBy}`
    );
    return response.data;
  }

  async getCategorySummary(
    startDate: string, 
    endDate: string
  ): Promise<Array<{ category: string; total: number; count: number }>> {
    const response = await apiService.get<Array<{ category: string; total: number; count: number }>>(
      `/api/financial-data/category-summary?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  }

  async getMonthlySummary(year: number): Promise<Array<{ month: number; income: number; expense: number; net: number }>> {
    const response = await apiService.get<Array<{ month: number; income: number; expense: number; net: number }>>(
      `/api/financial-data/monthly-summary?year=${year}`
    );
    return response.data;
  }

  async getYearlySummary(): Promise<Array<{ year: number; income: number; expense: number; net: number }>> {
    const response = await apiService.get<Array<{ year: number; income: number; expense: number; net: number }>>(
      '/api/financial-data/yearly-summary'
    );
    return response.data;
  }

  async exportFinancialData(
    format: 'csv' | 'excel' = 'csv',
    startDate?: string,
    endDate?: string
  ): Promise<void> {
    const queryParams = new URLSearchParams();
    queryParams.append('format', format);
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    await apiService.downloadFile(`/api/financial-data/export?${queryParams.toString()}`);
  }

  async importFinancialData(file: File): Promise<{ success: number; errors: string[] }> {
    const response = await apiService.uploadFile<{ success: number; errors: string[] }>(
      '/api/financial-data/import',
      file
    );
    return response.data;
  }

  async getRecentTransactions(limit: number = 10): Promise<FinancialData[]> {
    const response = await apiService.get<FinancialData[]>(
      `/api/financial-data/recent?limit=${limit}`
    );
    return response.data;
  }

  async searchFinancialData(query: string): Promise<FinancialData[]> {
    const response = await apiService.get<FinancialData[]>(
      `/api/financial-data/search?q=${encodeURIComponent(query)}`
    );
    return response.data;
  }
}

export const financialDataService = new FinancialDataService();
export default financialDataService;

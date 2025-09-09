import apiService from './api';
import type { 
  FinancialDataCreateDto, 
  FinancialDataDto, 
  PaginatedResponse,
  PaginationParams,
  FinancialDataFilters 
} from '@/types';

export class FinancialDataService {
  async getFinancialData(
    params?: PaginationParams & FinancialDataFilters
  ): Promise<PaginatedResponse<FinancialDataDto>> {
    const response = await apiService.get<PaginatedResponse<FinancialDataDto>>(
      '/financial-data',
      { params }
    );
    return response.data;
  }

  async getFinancialDataById(id: number): Promise<FinancialDataDto> {
    const response = await apiService.get<FinancialDataDto>(`/financial-data/${id}`);
    return response.data;
  }

  async createFinancialData(data: FinancialDataCreateDto): Promise<FinancialDataDto> {
    const response = await apiService.post<FinancialDataDto>('/financial-data', data);
    return response.data;
  }

  async updateFinancialData(id: number, data: Partial<FinancialDataCreateDto>): Promise<FinancialDataDto> {
    const response = await apiService.put<FinancialDataDto>(`/financial-data/${id}`, data);
    return response.data;
  }

  async deleteFinancialData(id: number): Promise<void> {
    await apiService.delete(`/financial-data/${id}`);
  }

  async getFinancialDataByDateRange(
    startDate: string,
    endDate: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<FinancialDataDto>> {
    const response = await apiService.get<PaginatedResponse<FinancialDataDto>>(
      '/financial-data/date-range',
      {
        params: {
          startDate,
          endDate,
          ...params,
        },
      }
    );
    return response.data;
  }

  async getFinancialDataByCategory(
    categoryId: number,
    params?: PaginationParams
  ): Promise<PaginatedResponse<FinancialDataDto>> {
    const response = await apiService.get<PaginatedResponse<FinancialDataDto>>(
      `/financial-data/category/${categoryId}`,
      { params }
    );
    return response.data;
  }

  async getFinancialDataSummary(
    startDate?: string,
    endDate?: string
  ): Promise<{
    totalIncome: number;
    totalExpense: number;
    netAmount: number;
    transactionCount: number;
  }> {
    const response = await apiService.get('/financial-data/summary', {
      params: { startDate, endDate },
    });
    return response.data;
  }
}

export const financialDataService = new FinancialDataService();

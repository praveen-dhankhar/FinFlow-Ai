import apiService from './api';
import type { Category, CategoryCreateDto, CategoryUpdateDto } from '../types';

export class CategoryService {
  async getCategories(): Promise<Category[]> {
    const response = await apiService.get<Category[]>('/api/categories');
    return response.data;
  }

  async getCategoryById(id: number): Promise<Category> {
    const response = await apiService.get<Category>(`/api/categories/${id}`);
    return response.data;
  }

  async createCategory(data: CategoryCreateDto): Promise<Category> {
    const response = await apiService.post<Category>('/api/categories', data);
    return response.data;
  }

  async updateCategory(id: number, data: CategoryUpdateDto): Promise<Category> {
    const response = await apiService.put<Category>(`/api/categories/${id}`, data);
    return response.data;
  }

  async deleteCategory(id: number): Promise<void> {
    await apiService.delete(`/api/categories/${id}`);
  }

  async getCategoryUsage(id: number): Promise<{ count: number; totalAmount: number }> {
    const response = await apiService.get<{ count: number; totalAmount: number }>(
      `/api/categories/${id}/usage`
    );
    return response.data;
  }

  async getCategoryStats(): Promise<Array<{ 
    category: Category; 
    count: number; 
    totalAmount: number; 
    averageAmount: number 
  }>> {
    const response = await apiService.get<Array<{ 
      category: Category; 
      count: number; 
      totalAmount: number; 
      averageAmount: number 
    }>>('/api/categories/stats');
    return response.data;
  }
}

export const categoryService = new CategoryService();
export default categoryService;

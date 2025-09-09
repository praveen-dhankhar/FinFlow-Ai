import apiService from './api';
import type { Category, CategoryCreateDto, PaginatedResponse, PaginationParams } from '@/types';

export class CategoryService {
  async getCategories(params?: PaginationParams): Promise<PaginatedResponse<Category>> {
    const response = await apiService.get<PaginatedResponse<Category>>('/categories', { params });
    return response.data;
  }

  async getCategoryById(id: number): Promise<Category> {
    const response = await apiService.get<Category>(`/categories/${id}`);
    return response.data;
  }

  async createCategory(data: CategoryCreateDto): Promise<Category> {
    const response = await apiService.post<Category>('/categories', data);
    return response.data;
  }

  async updateCategory(id: number, data: Partial<CategoryCreateDto>): Promise<Category> {
    const response = await apiService.put<Category>(`/categories/${id}`, data);
    return response.data;
  }

  async deleteCategory(id: number): Promise<void> {
    await apiService.delete(`/categories/${id}`);
  }

  async getCategoriesByUser(): Promise<Category[]> {
    const response = await apiService.get<Category[]>('/categories/user');
    return response.data;
  }
}

export const categoryService = new CategoryService();

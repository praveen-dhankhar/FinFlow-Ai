import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  categoryService, 
  Category, 
  CategoryFilters, 
  CreateCategoryRequest, 
  UpdateCategoryRequest, 
  ReorderCategoriesRequest,
  CategoryInsights 
} from '@/lib/api/categories';
import { queryKeys } from '@/lib/api/query-client';

// Get categories hook
export const useCategories = (filters?: CategoryFilters) => {
  return useQuery({
    queryKey: [...queryKeys.categories.all, filters],
    queryFn: () => categoryService.getCategories(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

// Get single category hook
export const useCategory = (id: string) => {
  return useQuery({
    queryKey: [...queryKeys.categories.byId(id)],
    queryFn: () => categoryService.getCategory(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

// Create category hook
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (category: CreateCategoryRequest) => categoryService.createCategory(category),
    onSuccess: () => {
      // Invalidate all category queries
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.data });
    },
    onError: (error) => {
      console.error('Failed to create category:', error);
    },
  });
};

// Update category hook
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryRequest }) =>
      categoryService.updateCategory(id, data),
    onSuccess: (updatedCategory) => {
      // Update the specific category in cache
      queryClient.setQueryData(
        queryKeys.categories.byId(updatedCategory.id),
        updatedCategory
      );
      // Invalidate category lists
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.data });
    },
    onError: (error) => {
      console.error('Failed to update category:', error);
    },
  });
};

// Delete category hook
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoryService.deleteCategory(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.categories.byId(deletedId) });
      // Invalidate category lists
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.data });
    },
    onError: (error) => {
      console.error('Failed to delete category:', error);
    },
  });
};

// Reorder categories hook
export const useReorderCategories = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ReorderCategoriesRequest) => categoryService.reorderCategories(request),
    onSuccess: () => {
      // Invalidate category queries to refetch with new order
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
    onError: (error) => {
      console.error('Failed to reorder categories:', error);
    },
  });
};

// Get category insights hook
export const useCategoryInsights = () => {
  return useQuery({
    queryKey: [...queryKeys.categories.all, 'insights'],
    queryFn: () => categoryService.getCategoryInsights(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};

// Get category spending hook
export const useCategorySpending = (id: string, period: 'month' | 'year' = 'month') => {
  return useQuery({
    queryKey: [...queryKeys.categories.byId(id), 'spending', period],
    queryFn: () => categoryService.getCategorySpending(id, period),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

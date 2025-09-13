'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  X, 
  Palette, 
  Search,
  Check,
  AlertCircle,
  Target,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Modal, ModalContent, Button, Input } from '@/components/ui';
import { Category, colorPresets, iconOptions } from '@/lib/api/categories';
import * as LucideIcons from 'lucide-react';

// Form validation schema
const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
  description: z.string().max(200, 'Description too long').optional(),
  icon: z.string().min(1, 'Icon is required'),
  color: z.string().min(1, 'Color is required'),
  budget: z.number().min(0, 'Budget must be positive').optional(),
  parentId: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryFormData) => void;
  category?: Category | null;
  categories: Category[];
  isLoading?: boolean;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  category,
  categories,
  isLoading = false,
}) => {
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [selectedIcon, setSelectedIcon] = useState('Home');
  const [iconSearch, setIconSearch] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      icon: 'Home',
      color: '#3B82F6',
      budget: undefined,
      parentId: undefined,
    },
  });

  const watchedName = watch('name');
  const watchedDescription = watch('description');
  const watchedBudget = watch('budget');

  // Reset form when modal opens/closes or category changes
  useEffect(() => {
    if (isOpen) {
      if (category) {
        reset({
          name: category.name,
          description: category.description || '',
          icon: category.icon,
          color: category.color,
          budget: category.budget || undefined,
          parentId: category.parentId || undefined,
        });
        setSelectedColor(category.color);
        setSelectedIcon(category.icon);
      } else {
        reset({
          name: '',
          description: '',
          icon: 'Home',
          color: '#3B82F6',
          budget: undefined,
          parentId: undefined,
        });
        setSelectedColor('#3B82F6');
        setSelectedIcon('Home');
      }
      setIconSearch('');
      setShowColorPicker(false);
      setShowIconPicker(false);
    }
  }, [isOpen, category, reset]);

  const handleFormSubmit = async (data: CategoryFormData) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setValue('color', color);
    setShowColorPicker(false);
  };

  const handleIconSelect = (icon: string) => {
    setSelectedIcon(icon);
    setValue('icon', icon);
    setShowIconPicker(false);
  };

  const filteredIcons = iconOptions.filter(icon =>
    icon.toLowerCase().includes(iconSearch.toLowerCase())
  );

  const parentCategories = categories.filter(c => !c.parentId && c.id !== category?.id);
  const SelectedIconComponent = (LucideIcons as any)[selectedIcon] || LucideIcons.Circle;

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent size="lg">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {category ? 'Edit Category' : 'Add Category'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {category ? 'Update category details' : 'Create a new spending category'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Name and Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name *
                </label>
                <input
                  {...register('name')}
                  type="text"
                  placeholder="Enter category name"
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
                    errors.name
                      ? "border-red-300 dark:border-red-600"
                      : "border-gray-300 dark:border-gray-600"
                  )}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Parent Category
                </label>
                <select
                  {...register('parentId')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">No parent (main category)</option>
                  {parentCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                placeholder="Enter category description (optional)"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Icon and Color Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Icon Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Icon *
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowIconPicker(!showIconPicker)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <SelectedIconComponent className="h-4 w-4" />
                      <span>{selectedIcon}</span>
                    </div>
                    <Search className="h-4 w-4 text-gray-400" />
                  </button>

                  <AnimatePresence>
                    {showIconPicker && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 max-h-64 overflow-hidden"
                      >
                        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                          <input
                            type="text"
                            placeholder="Search icons..."
                            value={iconSearch}
                            onChange={(e) => setIconSearch(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div className="p-3 max-h-48 overflow-y-auto">
                          <div className="grid grid-cols-6 gap-2">
                            {filteredIcons.map((icon) => {
                              const IconComponent = (LucideIcons as any)[icon] || LucideIcons.Circle;
                              return (
                                <button
                                  key={icon}
                                  type="button"
                                  onClick={() => handleIconSelect(icon)}
                                  className={cn(
                                    "p-2 rounded-lg border-2 transition-colors",
                                    selectedIcon === icon
                                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                                  )}
                                >
                                  <IconComponent className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {errors.icon && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.icon.message}
                  </p>
                )}
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color *
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: selectedColor }}
                      />
                      <span className="text-sm">{selectedColor}</span>
                    </div>
                    <Palette className="h-4 w-4 text-gray-400" />
                  </button>

                  <AnimatePresence>
                    {showColorPicker && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 p-3"
                      >
                        <div className="grid grid-cols-6 gap-2">
                          {colorPresets.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => handleColorSelect(color)}
                              className={cn(
                                "w-8 h-8 rounded-lg border-2 transition-colors",
                                selectedColor === color
                                  ? "border-gray-900 dark:border-white scale-110"
                                  : "border-gray-300 dark:border-gray-600 hover:scale-105"
                              )}
                              style={{ backgroundColor: color }}
                            >
                              {selectedColor === color && (
                                <Check className="h-4 w-4 text-white mx-auto" />
                              )}
                            </button>
                          ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <input
                            type="color"
                            value={selectedColor}
                            onChange={(e) => handleColorSelect(e.target.value)}
                            className="w-full h-8 rounded border border-gray-300 dark:border-gray-600"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {errors.color && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.color.message}
                  </p>
                )}
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Monthly Budget (Optional)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  {...register('budget', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className={cn(
                    "w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
                    errors.budget
                      ? "border-red-300 dark:border-red-600"
                      : "border-gray-300 dark:border-gray-600"
                  )}
                />
              </div>
              {errors.budget && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.budget.message}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Set a monthly budget limit for this category
              </p>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Preview
              </h4>
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm"
                  style={{ backgroundColor: selectedColor }}
                >
                  <SelectedIconComponent className="h-5 w-5" />
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white">
                    {watchedName || 'Category Name'}
                  </h5>
                  {watchedDescription && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {watchedDescription}
                    </p>
                  )}
                  {watchedBudget && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Budget: ${watchedBudget.toFixed(2)}/month
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="flex-1"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4" />
                    <span>{category ? 'Update Category' : 'Create Category'}</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>
      </ModalContent>
    </Modal>
  );
};

export default CategoryModal;

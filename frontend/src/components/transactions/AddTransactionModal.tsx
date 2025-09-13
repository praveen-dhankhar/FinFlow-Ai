'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  X, 
  Plus, 
  Minus, 
  Calendar, 
  Tag, 
  Upload,
  Check,
  AlertCircle,
  DollarSign,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Modal, ModalContent, Button, Input } from '@/components/ui';
import { Transaction } from '@/lib/api/transactions';

// Form validation schema
const transactionSchema = z.object({
  description: z.string().min(1, 'Description is required').max(100, 'Description too long'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  categoryId: z.string().min(1, 'Category is required'),
  type: z.enum(['income', 'expense']),
  date: z.string().min(1, 'Date is required'),
  tags: z.string().optional(),
  notes: z.string().optional(),
  recurring: z.boolean().optional(),
  recurringPattern: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  categories: Array<{
    id: string;
    name: string;
    icon: string;
    color: string;
  }>;
  isLoading?: boolean;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  categories,
  isLoading = false,
}) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      recurring: false,
    },
  });

  const watchedType = watch('type');
  const watchedRecurring = watch('recurring');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      reset({
        type: 'expense',
        date: new Date().toISOString().split('T')[0],
        recurring: false,
      });
      setIsSuccess(false);
      setReceiptFile(null);
    }
  }, [isOpen, reset]);

  const handleFormSubmit = async (data: TransactionFormData) => {
    try {
      const transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> = {
        description: data.description,
        amount: data.type === 'income' ? data.amount : -data.amount,
        category: categories.find(c => c.id === data.categoryId)?.name || '',
        categoryId: data.categoryId,
        categoryIcon: categories.find(c => c.id === data.categoryId)?.icon || '💰',
        categoryColor: categories.find(c => c.id === data.categoryId)?.color || '#6B7280',
        type: data.type,
        date: new Date(data.date).toISOString(),
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        notes: data.notes,
        recurring: data.recurring || false,
        recurringPattern: data.recurring ? data.recurringPattern : undefined,
        receiptUrl: receiptFile ? URL.createObjectURL(receiptFile) : undefined,
      };

      await onSubmit(transactionData);
      
      // Show success animation
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Failed to create transaction:', error);
    }
  };

  const handleReceiptUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setReceiptFile(file);
    }
  };

  const incomeCategories = categories.filter(c => c.name === 'Income' || c.name.includes('Income'));
  const expenseCategories = categories.filter(c => c.name !== 'Income' && !c.name.includes('Income'));

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent size="lg">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Add Transaction
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Record a new financial transaction
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

        {/* Success Animation */}
        <AnimatePresence>
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 bg-white dark:bg-gray-800 flex items-center justify-center z-10"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                </motion.div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Transaction Added!
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Your transaction has been successfully recorded.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Type Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Transaction Type
            </label>
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setValue('type', 'expense')}
                className={cn(
                  "flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors",
                  watchedType === 'expense'
                    ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                )}
              >
                <Minus className="h-4 w-4" />
                <span>Expense</span>
              </button>
              <button
                type="button"
                onClick={() => setValue('type', 'income')}
                className={cn(
                  "flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors",
                  watchedType === 'income'
                    ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                )}
              >
                <Plus className="h-4 w-4" />
                <span>Income</span>
              </button>
            </div>
          </div>

          {/* Amount and Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  {...register('amount', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className={cn(
                    "w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
                    errors.amount
                      ? "border-red-300 dark:border-red-600"
                      : "border-gray-300 dark:border-gray-600"
                  )}
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.amount.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  {...register('date')}
                  type="date"
                  className={cn(
                    "w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
                    errors.date
                      ? "border-red-300 dark:border-red-600"
                      : "border-gray-300 dark:border-gray-600"
                  )}
                />
              </div>
              {errors.date && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.date.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <input
              {...register('description')}
              type="text"
              placeholder="Enter transaction description"
              className={cn(
                "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
                errors.description
                  ? "border-red-300 dark:border-red-600"
                  : "border-gray-300 dark:border-gray-600"
              )}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category *
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                {...register('categoryId')}
                className={cn(
                  "w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
                  errors.categoryId
                    ? "border-red-300 dark:border-red-600"
                    : "border-gray-300 dark:border-gray-600"
                )}
              >
                <option value="">Select a category</option>
                {(watchedType === 'income' ? incomeCategories : expenseCategories).map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <input
              {...register('tags')}
              type="text"
              placeholder="Enter tags separated by commas"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Separate multiple tags with commas
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              placeholder="Add any additional notes..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            />
          </div>

          {/* Receipt Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Receipt (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleReceiptUpload}
                className="hidden"
                id="receipt-upload"
              />
              <label htmlFor="receipt-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {receiptFile ? receiptFile.name : 'Click to upload receipt'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  PNG, JPG, PDF up to 10MB
                </p>
              </label>
            </div>
          </div>

          {/* Recurring Transaction */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                {...register('recurring')}
                type="checkbox"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                This is a recurring transaction
              </span>
            </label>
            {watchedRecurring && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Recurring Pattern
                </label>
                <select
                  {...register('recurringPattern')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="daily">Daily</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            )}
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
                  <span>Creating...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Add Transaction</span>
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

export default AddTransactionModal;

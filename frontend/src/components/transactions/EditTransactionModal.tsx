'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  X, 
  Edit, 
  Calendar, 
  Tag, 
  Upload,
  Check,
  AlertCircle,
  DollarSign,
  FileText,
  History,
  Trash2
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

interface ChangeHistory {
  id: string;
  field: string;
  oldValue: string;
  newValue: string;
  changedAt: string;
  changedBy: string;
}

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onSubmit: (id: string, data: Partial<Transaction>) => void;
  onDelete: (id: string) => void;
  categories: Array<{
    id: string;
    name: string;
    icon: string;
    color: string;
  }>;
  isLoading?: boolean;
  changeHistory?: ChangeHistory[];
}

const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onSubmit,
  onDelete,
  categories,
  isLoading = false,
  changeHistory = [],
}) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
  });

  const watchedType = watch('type');
  const watchedRecurring = watch('recurring');

  // Reset form when transaction changes
  useEffect(() => {
    if (transaction && isOpen) {
      reset({
        description: transaction.description,
        amount: Math.abs(transaction.amount),
        categoryId: transaction.categoryId,
        type: transaction.type,
        date: new Date(transaction.date).toISOString().split('T')[0],
        tags: transaction.tags?.join(', ') || '',
        notes: transaction.notes || '',
        recurring: transaction.recurring || false,
        recurringPattern: transaction.recurringPattern || 'monthly',
      });
      setIsSuccess(false);
      setReceiptFile(null);
    }
  }, [transaction, isOpen, reset]);

  const handleFormSubmit = async (data: TransactionFormData) => {
    if (!transaction) return;

    try {
      const updateData: Partial<Transaction> = {
        description: data.description,
        amount: data.type === 'income' ? data.amount : -data.amount,
        category: categories.find(c => c.id === data.categoryId)?.name || transaction.category,
        categoryId: data.categoryId,
        categoryIcon: categories.find(c => c.id === data.categoryId)?.icon || transaction.categoryIcon,
        categoryColor: categories.find(c => c.id === data.categoryId)?.color || transaction.categoryColor,
        type: data.type,
        date: new Date(data.date).toISOString(),
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        notes: data.notes,
        recurring: data.recurring || false,
        recurringPattern: data.recurring ? data.recurringPattern : undefined,
        receiptUrl: receiptFile ? URL.createObjectURL(receiptFile) : transaction.receiptUrl,
      };

      await onSubmit(transaction.id, updateData);
      
      // Show success animation
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Failed to update transaction:', error);
    }
  };

  const handleDelete = async () => {
    if (!transaction) return;

    try {
      await onDelete(transaction.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete transaction:', error);
    }
  };

  const handleReceiptUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setReceiptFile(file);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!transaction) return null;

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
              <Edit className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Edit Transaction
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {transaction.description} • {formatCurrency(Math.abs(transaction.amount))}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="View change history"
            >
              <History className="h-5 w-5 text-gray-400" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
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
                  Transaction Updated!
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Your changes have been saved successfully.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Change History Sidebar */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="absolute right-0 top-0 h-full w-80 bg-gray-50 dark:bg-gray-700 border-l border-gray-200 dark:border-gray-600 z-20 p-4 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Change History
                </h3>
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              </div>
              <div className="space-y-3">
                {changeHistory.length > 0 ? (
                  changeHistory.map((change, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {change.field}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(change.changedAt)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        <div>From: {change.oldValue}</div>
                        <div>To: {change.newValue}</div>
                        <div>By: {change.changedBy}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <History className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No change history available
                    </p>
                  </div>
                )}
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
                <span>Income</span>
              </button>
            </div>
          </div>

          {/* Amount and Date */}
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

          {/* Description */}
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
              Receipt
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
                  {receiptFile ? receiptFile.name : transaction.receiptUrl ? 'Current receipt (click to replace)' : 'Click to upload receipt'}
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
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center space-x-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </Button>
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
              disabled={isSubmitting || isLoading || !isDirty}
              className="flex-1"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Edit className="h-4 w-4" />
                  <span>Save Changes</span>
                </div>
              )}
            </Button>
          </div>
        </form>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowDeleteConfirm(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Delete Transaction
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      This action cannot be undone
                    </p>
                  </div>
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  Are you sure you want to delete this transaction? This action cannot be undone.
                </p>

                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    className="flex-1"
                  >
                    Delete Transaction
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </ModalContent>
    </Modal>
  );
};

export default EditTransactionModal;

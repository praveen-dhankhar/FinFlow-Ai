'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, 
  Tag, 
  Download, 
  X, 
  MoreHorizontal,
  Check,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';

interface BulkActionsProps {
  selectedCount: number;
  onDelete: () => void;
  onChangeCategory: () => void;
  onExport: () => void;
  onClearSelection: () => void;
  className?: string;
}

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedCount,
  onDelete,
  onChangeCategory,
  onExport,
  onClearSelection,
  className,
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (selectedCount === 0) {
    return null;
  }

  const handleDelete = () => {
    setShowConfirmDelete(true);
  };

  const confirmDelete = () => {
    onDelete();
    setShowConfirmDelete(false);
  };

  return (
    <>
      {/* Floating Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className={cn(
          "fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50",
          className
        )}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center space-x-4">
          {/* Selection Info */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {selectedCount} selected
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onChangeCategory}
              className="flex items-center space-x-1"
            >
              <Tag className="h-4 w-4" />
              <span>Change Category</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="flex items-center space-x-1"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="flex items-center space-x-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </Button>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />

            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="flex items-center space-x-1"
            >
              <X className="h-4 w-4" />
              <span>Clear</span>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showConfirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowConfirmDelete(false)}
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
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Delete Transactions
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Are you sure you want to delete <strong>{selectedCount}</strong> selected transaction{selectedCount > 1 ? 's' : ''}? 
                This action cannot be undone.
              </p>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmDelete(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDelete}
                  className="flex-1"
                >
                  Delete {selectedCount} Transaction{selectedCount > 1 ? 's' : ''}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BulkActions;

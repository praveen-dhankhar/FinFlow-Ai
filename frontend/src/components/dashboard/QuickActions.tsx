'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Minus, 
  Target, 
  Download, 
  X,
  Keyboard,
  Command
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
  shortcut?: string;
}

interface QuickActionsProps {
  onAddTransaction?: () => void;
  onAddIncome?: () => void;
  onSetGoal?: () => void;
  onExportData?: () => void;
  className?: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onAddTransaction,
  onAddIncome,
  onSetGoal,
  onExportData,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const actions: QuickAction[] = [
    {
      id: 'add-transaction',
      label: 'Add Transaction',
      icon: <Minus className="h-5 w-5" />,
      color: 'bg-red-500 hover:bg-red-600',
      onClick: onAddTransaction || (() => {}),
      shortcut: 'T',
    },
    {
      id: 'add-income',
      label: 'Add Income',
      icon: <Plus className="h-5 w-5" />,
      color: 'bg-green-500 hover:bg-green-600',
      onClick: onAddIncome || (() => {}),
      shortcut: 'I',
    },
    {
      id: 'set-goal',
      label: 'Set Goal',
      icon: <Target className="h-5 w-5" />,
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: onSetGoal || (() => {}),
      shortcut: 'G',
    },
    {
      id: 'export-data',
      label: 'Export Data',
      icon: <Download className="h-5 w-5" />,
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: onExportData || (() => {}),
      shortcut: 'E',
    },
  ];

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey) {
        switch (event.key.toLowerCase()) {
          case 't':
            event.preventDefault();
            onAddTransaction?.();
            break;
          case 'i':
            event.preventDefault();
            onAddIncome?.();
            break;
          case 'g':
            event.preventDefault();
            onSetGoal?.();
            break;
          case 'e':
            event.preventDefault();
            onExportData?.();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onAddTransaction, onAddIncome, onSetGoal, onExportData]);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleActionClick = (action: QuickAction) => {
    action.onClick();
    setIsOpen(false);
  };

  return (
    <div className={cn("fixed bottom-6 right-6 z-50", className)}>
      {/* Action buttons */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="mb-4 space-y-3"
          >
            {actions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, x: 50, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.8 }}
                transition={{ 
                  duration: 0.2, 
                  delay: index * 0.05 
                }}
                className="flex items-center justify-end space-x-3"
              >
                {/* Action label */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 + 0.1 }}
                  className="bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {action.label}
                    </span>
                    {action.shortcut && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        ⌘{action.shortcut}
                      </span>
                    )}
                  </div>
                </motion.div>

                {/* Action button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleActionClick(action)}
                  className={cn(
                    "w-12 h-12 rounded-full text-white shadow-lg flex items-center justify-center transition-all duration-200",
                    action.color
                  )}
                >
                  {action.icon}
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleOpen}
        className={cn(
          "w-14 h-14 rounded-full text-white shadow-lg flex items-center justify-center transition-all duration-200",
          isOpen 
            ? "bg-gray-500 hover:bg-gray-600" 
            : "bg-blue-600 hover:bg-blue-700"
        )}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Plus className="h-6 w-6" />
          )}
        </motion.div>
      </motion.button>

      {/* Shortcuts help */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowShortcuts(!showShortcuts)}
        className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 shadow-lg flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <Keyboard className="h-4 w-4" />
      </motion.button>

      {/* Shortcuts modal */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-20 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 w-64"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Keyboard Shortcuts
              </h3>
              <button
                onClick={() => setShowShortcuts(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              {actions.map((action) => (
                <div key={action.id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {action.label}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    ⌘{action.shortcut}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuickActions;

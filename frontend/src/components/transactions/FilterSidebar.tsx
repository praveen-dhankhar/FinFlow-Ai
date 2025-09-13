'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Filter, 
  Calendar, 
  DollarSign, 
  Tag, 
  RotateCcw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TransactionFilters } from '@/lib/api/transactions';

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
  onClearFilters: () => void;
  categories: Array<{
    id: string;
    name: string;
    icon: string;
    color: string;
  }>;
  className?: string;
}

const FilterSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ title, icon, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left mb-3"
      >
        <div className="flex items-center space-x-2">
          {icon}
          <span className="font-medium text-gray-900 dark:text-white">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onClearFilters,
  categories,
  className,
}) => {
  const [localFilters, setLocalFilters] = useState<TransactionFilters>(filters);

  const handleFilterChange = (key: keyof TransactionFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    setLocalFilters({});
    onClearFilters();
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilters.search) count++;
    if (localFilters.type && localFilters.type !== 'all') count++;
    if (localFilters.categoryIds && localFilters.categoryIds.length > 0) count++;
    if (localFilters.dateFrom || localFilters.dateTo) count++;
    if (localFilters.amountMin !== undefined || localFilters.amountMax !== undefined) count++;
    if (localFilters.tags && localFilters.tags.length > 0) count++;
    if (localFilters.recurring !== undefined) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: isOpen ? 0 : -320,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          "fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 lg:relative lg:translate-x-0 lg:z-auto",
          className
        )}
      >
        <div className="p-6 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Filters
              </h2>
              {activeFilterCount > 0 && (
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2 py-1 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          {/* Filters */}
          <div className="flex-1 overflow-y-auto">
            {/* Search */}
            <FilterSection title="Search" icon={<Filter className="h-4 w-4 text-gray-400" />}>
              <input
                type="text"
                placeholder="Search transactions..."
                value={localFilters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </FilterSection>

            {/* Transaction Type */}
            <FilterSection title="Transaction Type" icon={<DollarSign className="h-4 w-4 text-gray-400" />}>
              <div className="space-y-2">
                {[
                  { value: 'all', label: 'All Transactions' },
                  { value: 'income', label: 'Income' },
                  { value: 'expense', label: 'Expenses' },
                ].map((option) => (
                  <label key={option.value} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="type"
                      value={option.value}
                      checked={(localFilters.type || 'all') === option.value}
                      onChange={(e) => handleFilterChange('type', e.target.value)}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </FilterSection>

            {/* Categories */}
            <FilterSection title="Categories" icon={<Tag className="h-4 w-4 text-gray-400" />}>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={localFilters.categoryIds?.includes(category.id) || false}
                      onChange={(e) => {
                        const currentIds = localFilters.categoryIds || [];
                        const newIds = e.target.checked
                          ? [...currentIds, category.id]
                          : currentIds.filter(id => id !== category.id);
                        handleFilterChange('categoryIds', newIds);
                      }}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div 
                      className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs"
                      style={{ backgroundColor: category.color }}
                    >
                      {category.icon}
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {category.name}
                    </span>
                  </label>
                ))}
              </div>
            </FilterSection>

            {/* Date Range */}
            <FilterSection title="Date Range" icon={<Calendar className="h-4 w-4 text-gray-400" />}>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    From
                  </label>
                  <input
                    type="date"
                    value={localFilters.dateFrom || ''}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    To
                  </label>
                  <input
                    type="date"
                    value={localFilters.dateTo || ''}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </FilterSection>

            {/* Amount Range */}
            <FilterSection title="Amount Range" icon={<DollarSign className="h-4 w-4 text-gray-400" />}>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Min Amount
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={localFilters.amountMin || ''}
                    onChange={(e) => handleFilterChange('amountMin', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max Amount
                  </label>
                  <input
                    type="number"
                    placeholder="10000.00"
                    value={localFilters.amountMax || ''}
                    onChange={(e) => handleFilterChange('amountMax', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </FilterSection>

            {/* Recurring */}
            <FilterSection title="Recurring" icon={<RotateCcw className="h-4 w-4 text-gray-400" />}>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={localFilters.recurring === true}
                    onChange={(e) => handleFilterChange('recurring', e.target.checked ? true : undefined)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Recurring only
                  </span>
                </label>
              </div>
            </FilterSection>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-3">
              <button
                onClick={handleClearFilters}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors lg:hidden"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default FilterSidebar;

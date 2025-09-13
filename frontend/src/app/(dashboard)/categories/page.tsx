'use client';

import React from 'react';
import { CategoriesManager } from '@/components/categories';

const CategoriesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <CategoriesManager />
      </div>
    </div>
  );
};

export default CategoriesPage;

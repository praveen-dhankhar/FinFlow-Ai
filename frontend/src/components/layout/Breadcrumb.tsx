'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrentPage?: boolean;
}

interface BreadcrumbProps {
  customItems?: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ customItems, className }) => {
  const pathname = usePathname();

  // Generate breadcrumb items from pathname
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (customItems) return customItems;

    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Add home
    breadcrumbs.push({
      label: 'Home',
      href: '/',
    });

    // Generate breadcrumbs from path segments
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Skip certain segments
      if (segment === 'dashboard' && index === 0) {
        breadcrumbs.push({
          label: 'Dashboard',
          href: currentPath,
          isCurrentPage: index === pathSegments.length - 1,
        });
        return;
      }

      // Format segment name
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      breadcrumbs.push({
        label,
        href: currentPath,
        isCurrentPage: index === pathSegments.length - 1,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumb if only home
  if (breadcrumbs.length <= 1) return null;

  return (
    <nav
      className={cn(
        'flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400',
        className
      )}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1">
        {breadcrumbs.map((item, index) => (
          <li key={item.href} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
            )}
            
            {item.isCurrentPage ? (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-medium text-gray-900 dark:text-white"
                aria-current="page"
              >
                {item.label === 'Home' ? (
                  <Home className="h-4 w-4" />
                ) : (
                  item.label
                )}
              </motion.span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
              >
                <motion.div
                  className="flex items-center space-x-1"
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.2 }}
                >
                  {item.label === 'Home' ? (
                    <Home className="h-4 w-4" />
                  ) : (
                    <span>{item.label}</span>
                  )}
                </motion.div>
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  CreditCard,
  TrendingUp,
  BarChart3,
  Settings,
} from 'lucide-react';

const mobileNavItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Transactions',
    href: '/transactions',
    icon: CreditCard,
  },
  {
    name: 'Forecasts',
    href: '/forecasts',
    icon: TrendingUp,
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

const MobileNav: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.name} href={item.href}>
              <motion.div
                className={cn(
                  'flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200',
                  'min-w-0 flex-1',
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="relative">
                  <Icon
                    className={cn(
                      'h-5 w-5',
                      isActive && 'text-blue-600 dark:text-blue-400'
                    )}
                  />
                  {isActive && (
                    <motion.div
                      layoutId="mobile-nav-indicator"
                      className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs mt-1 truncate max-w-full',
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 font-medium'
                      : 'text-gray-500 dark:text-gray-400'
                  )}
                >
                  {item.name}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;

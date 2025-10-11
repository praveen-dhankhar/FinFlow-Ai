'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useLogout } from '@/hooks/useAuth';
import { useAuthUser } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  CreditCard,
  Tag,
  TrendingUp,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  Bell,
  HelpCircle,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

const navigationItems = [
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
    name: 'Categories',
    href: '/categories',
    icon: Tag,
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

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle, isMobile = false }) => {
  const pathname = usePathname();
  const user = useAuthUser();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const sidebarVariants = {
    expanded: { width: 256 },
    collapsed: { width: 80 },
  };

  const contentVariants = {
    expanded: { opacity: 1, x: 0 },
    collapsed: { opacity: 0, x: -20 },
  };

  return (
    <motion.aside
      variants={sidebarVariants}
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={cn(
        'fixed left-0 top-0 z-40 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800',
        'flex flex-col',
        isMobile ? 'w-64' : ''
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              key="logo"
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="flex items-center space-x-3"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  Finance Forecast
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Smart Financial Management
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!isMobile && (
          <motion.button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            )}
          </motion.button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.name} href={item.href}>
              <motion.div
                className={cn(
                  'flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                  'hover:bg-gray-100 dark:hover:bg-gray-800',
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-r-2 border-blue-600'
                    : 'text-gray-700 dark:text-gray-300'
                )}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0',
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400'
                  )}
                />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      key={item.name}
                      variants={contentVariants}
                      initial="collapsed"
                      animate="expanded"
                      exit="collapsed"
                      className="font-medium"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        {/* User Profile */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                key="user-info"
                variants={contentVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Actions */}
        <div className="space-y-1">
          <Link href="/profile">
            <motion.div
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    key="profile"
                    variants={contentVariants}
                    initial="collapsed"
                    animate="expanded"
                    exit="collapsed"
                    className="text-sm text-gray-700 dark:text-gray-300"
                  >
                    Profile
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </Link>

          <Link href="/notifications">
            <motion.div
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Bell className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    key="notifications"
                    variants={contentVariants}
                    initial="collapsed"
                    animate="expanded"
                    exit="collapsed"
                    className="text-sm text-gray-700 dark:text-gray-300"
                  >
                    Notifications
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </Link>

          <Link href="/help">
            <motion.div
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <HelpCircle className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    key="help"
                    variants={contentVariants}
                    initial="collapsed"
                    animate="expanded"
                    exit="collapsed"
                    className="text-sm text-gray-700 dark:text-gray-300"
                  >
                    Help
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </Link>

          <motion.button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left"
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-4 w-4 text-red-500" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  key="logout"
                  variants={contentVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                  className="text-sm text-red-600 dark:text-red-400"
                >
                  {logoutMutation.isPending ? 'Signing out...' : 'Sign out'}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;

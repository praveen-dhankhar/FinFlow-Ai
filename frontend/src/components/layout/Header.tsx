'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthUser } from '@/stores/authStore';
import { useLogout } from '@/hooks/useAuth';
import { useTheme } from '@/components/providers/ThemeProvider';
import { cn } from '@/lib/utils';
import {
  Search,
  Bell,
  Sun,
  Moon,
  User,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';

interface HeaderProps {
  onMobileMenuToggle: () => void;
  isMobileMenuOpen: boolean;
  isSidebarCollapsed: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  onMobileMenuToggle, 
  isMobileMenuOpen,
  isSidebarCollapsed 
}) => {
  const user = useAuthUser();
  const { theme, setTheme } = useTheme();
  const logoutMutation = useLogout();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        const searchInput = document.getElementById('search-input');
        searchInput?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logoutMutation.mutate();
    setIsUserMenuOpen(false);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const userMenuItems = [
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
    },
    {
      name: 'Help & Support',
      href: '/help',
      icon: HelpCircle,
    },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <motion.button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            )}
          </motion.button>

          {/* Search Bar */}
          <div className="relative hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="search-input"
                type="text"
                placeholder="Search transactions, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={cn(
                  'w-64 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg',
                  'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
                  'placeholder-gray-500 dark:placeholder-gray-400',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                  'transition-all duration-200',
                  isSearchFocused && 'w-80'
                )}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded border">
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {/* Mobile Search Button */}
          <motion.button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Search className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </motion.button>

          {/* Notifications */}
          <motion.button
            className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </motion.button>

          {/* Theme Toggle */}
          <motion.button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <Sun className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            )}
          </motion.button>

          {/* User Menu */}
          <div className="relative">
            <motion.button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </motion.button>

            {/* User Dropdown Menu */}
            <AnimatePresence>
              {isUserMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
                >
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    {userMenuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <motion.div
                            className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            whileHover={{ x: 4 }}
                          >
                            <Icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {item.name}
                            </span>
                          </motion.div>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                    <motion.button
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                      className="flex items-center space-x-3 px-4 py-2 w-full text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      whileHover={{ x: 4 }}
                    >
                      <LogOut className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-600 dark:text-red-400">
                        {logoutMutation.isPending ? 'Signing out...' : 'Sign out'}
                      </span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <AnimatePresence>
        {isSearchFocused && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden px-4 pb-3"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;

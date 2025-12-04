'use client';

import React from 'react';
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
  Wallet,
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
    expanded: { opacity: 1, x: 0, display: 'block' },
    collapsed: { opacity: 0, x: -20, transitionEnd: { display: 'none' } },
  };

  return (
    <motion.aside
      variants={sidebarVariants}
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={cn(
        'fixed left-0 top-0 z-40 h-full glass-strong border-r border-white/5',
        'flex flex-col',
        isMobile ? 'w-64' : ''
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 mb-2">
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
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Wallet className="text-white h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  FinFlow<span className="text-blue-400">AI</span>
                </h1>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!isMobile && (
          <motion.button
            onClick={onToggle}
            className={cn(
              "p-2 rounded-xl hover:bg-white/10 transition-colors border border-transparent hover:border-white/5",
              isCollapsed ? "mx-auto" : ""
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-gray-400" />
            )}
          </motion.button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.name} href={item.href}>
              <motion.div
                className={cn(
                  'flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden',
                  isActive
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 gradient-primary opacity-20"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}

                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-400 rounded-r-full shadow-[0_0_10px_rgba(96,165,250,0.5)]" />
                )}

                <Icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0 relative z-10',
                    isActive
                      ? 'text-blue-400 drop-shadow-[0_0_5px_rgba(96,165,250,0.5)]'
                      : 'group-hover:text-gray-200'
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
                      className="font-medium relative z-10"
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
      <div className="p-4 border-t border-white/5 bg-black/20">
        {/* User Profile */}
        <div className={cn("flex items-center mb-4", isCollapsed ? "justify-center" : "space-x-3")}>
          <div className="w-10 h-10 gradient-accent rounded-full flex items-center justify-center ring-2 ring-white/10">
            <span className="text-white font-bold text-sm">
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
                <p className="text-sm font-semibold text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {user?.email}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Actions */}
        <div className="space-y-1">
          <Link href="/notifications">
            <motion.div
              className={cn(
                "flex items-center rounded-lg hover:bg-white/5 transition-colors group",
                isCollapsed ? "justify-center p-2" : "space-x-3 px-3 py-2"
              )}
              whileHover={{ x: isCollapsed ? 0 : 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Bell className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    key="notifications"
                    variants={contentVariants}
                    initial="collapsed"
                    animate="expanded"
                    exit="collapsed"
                    className="text-sm text-gray-400 group-hover:text-white transition-colors"
                  >
                    Notifications
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </Link>

          <motion.button
            onClick={handleLogout}
            className={cn(
              "flex items-center rounded-lg hover:bg-red-500/10 transition-colors w-full group",
              isCollapsed ? "justify-center p-2" : "space-x-3 px-3 py-2"
            )}
            whileHover={{ x: isCollapsed ? 0 : 4 }}
            whileTap={{ scale: 0.98 }}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-4 w-4 text-red-400 group-hover:text-red-300" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  key="logout"
                  variants={contentVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                  className="text-sm text-red-400 group-hover:text-red-300"
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

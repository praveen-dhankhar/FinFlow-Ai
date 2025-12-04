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
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-white/5 lg:hidden pb-safe">
      <div className="flex items-center justify-around px-2 py-3">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.name} href={item.href} className="relative z-10">
              <motion.div
                className={cn(
                  'flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200',
                  'min-w-[64px]',
                  isActive
                    ? 'text-white'
                    : 'text-gray-400 hover:text-gray-200'
                )}
                whileTap={{ scale: 0.9 }}
              >
                <div className="relative">
                  {isActive && (
                    <motion.div
                      layoutId="mobileNavActive"
                      className="absolute inset-[-8px] bg-gradient-to-b from-blue-500/20 to-purple-500/20 rounded-xl blur-sm"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}

                  <Icon
                    className={cn(
                      'h-6 w-6 relative z-10',
                      isActive && 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.6)]'
                    )}
                  />
                </div>
                <span
                  className={cn(
                    'text-[10px] mt-1 font-medium transition-colors relative z-10',
                    isActive
                      ? 'text-blue-400'
                      : 'text-gray-500'
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

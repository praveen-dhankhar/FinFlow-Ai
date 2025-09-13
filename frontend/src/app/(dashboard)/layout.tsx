'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Breadcrumb from '@/components/layout/Breadcrumb';
import MobileNav from '@/components/layout/MobileNav';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setIsSidebarCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileMenuOpen) {
        const target = event.target as Element;
        if (!target.closest('.mobile-menu') && !target.closest('.mobile-menu-button')) {
          setIsMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={toggleSidebar}
          isMobile={isMobile}
        />

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/50 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div
          className={`transition-all duration-300 ${
            isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
          }`}
        >
          {/* Header */}
          <Header
            onMobileMenuToggle={toggleMobileMenu}
            isMobileMenuOpen={isMobileMenuOpen}
            isSidebarCollapsed={isSidebarCollapsed}
          />

          {/* Main Content Area */}
          <main className="min-h-screen">
            {/* Breadcrumb */}
            <div className="px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <Breadcrumb />
            </div>

            {/* Page Content */}
            <div className="p-4 pb-20 lg:pb-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {children}
              </motion.div>
            </div>
          </main>
        </div>

        {/* Mobile Navigation */}
        <MobileNav />

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {isMobileMenuOpen && isMobile && (
            <motion.div
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 z-40 h-full w-64 lg:hidden mobile-menu"
            >
              <Sidebar
                isCollapsed={false}
                onToggle={() => {}}
                isMobile={true}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardLayout;

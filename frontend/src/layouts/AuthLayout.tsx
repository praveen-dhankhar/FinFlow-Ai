import React, { useEffect, useRef } from 'react';
import { fadeIn, scaleIn } from '../utils/animations';

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      scaleIn(containerRef.current, { duration: 300 });
    }
    fadeIn('.auth-card');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden" ref={containerRef}>
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-50" />
      <div className="auth-card w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200 p-6 relative z-10">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;

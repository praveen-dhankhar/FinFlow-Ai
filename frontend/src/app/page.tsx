'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard without authentication
    router.push('/dashboard');
  }, [router]);

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to dashboard...</p>
        <div className="mt-8 space-x-4">
          <a 
            href="/dashboard" 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go to Dashboard
          </a>
          <a 
            href="/design-system" 
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            View Design System
          </a>
          <a 
            href="/api-demo" 
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            API Demo
          </a>
        </div>
      </div>
    </main>
  );
}

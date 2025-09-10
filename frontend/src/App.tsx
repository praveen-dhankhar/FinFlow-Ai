import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryProvider } from './contexts/QueryProvider';
import { AuthProvider } from './contexts/AuthContext';
import Button from './components/Button';
import AnimationDemo from './pages/AnimationDemo';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AuthLayout from './layouts/AuthLayout';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';

// Placeholder components - these would be actual page components
const Dashboard = () => (
  <div className="min-h-screen bg-gray-50 p-8">
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <Button as="a" href="/animations" variant="outline">
          View Animation Demo
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Income</h3>
          <p className="text-3xl font-bold text-green-600">$12,345</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Expenses</h3>
          <p className="text-3xl font-bold text-red-600">$8,765</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Net Worth</h3>
          <p className="text-3xl font-bold text-blue-600">$3,580</p>
        </div>
      </div>
    </div>
  </div>
);

const LoginPage = () => (
  <AuthLayout>
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign in</h2>
    <LoginForm />
    <p className="text-sm text-gray-600 mt-4">Don't have an account? <a className="text-blue-600 underline" href="/register">Register</a></p>
  </AuthLayout>
);

const RegisterPage = () => (
  <AuthLayout>
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Create account</h2>
    <RegisterForm />
    <p className="text-sm text-gray-600 mt-4">Already have an account? <a className="text-blue-600 underline" href="/login">Sign in</a></p>
  </AuthLayout>
);

const App: React.FC = () => {
  return (
    <QueryProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route element={<ProtectedRoute />}> 
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/animations" element={<AnimationDemo />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryProvider>
  );
};

export default App;
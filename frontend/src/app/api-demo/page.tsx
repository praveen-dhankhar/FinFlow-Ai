'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  Modal,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
  ModalClose,
} from '@/components/ui';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ToastProvider, useToast } from '@/components/ui';
import {
  useLogin,
  useRegister,
  useLogout,
  useUser,
  useUpdateProfile,
  useAuthState,
  useIsAdmin,
  useIsVerified,
} from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { 
  User, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Settings,
  LogOut,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const AuthDemo = () => {
  const { addToast } = useToast();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Auth state
  const { user, isAuthenticated, isLoading, error } = useAuthState();
  const isAdmin = useIsAdmin();
  const isVerified = useIsVerified();
  
  // Auth actions
  const { clearAuth } = useAuthStore();
  
  // Form states
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ 
    email: '', 
    password: '', 
    firstName: '', 
    lastName: '' 
  });
  const [profileForm, setProfileForm] = useState({ 
    firstName: user?.firstName || '', 
    lastName: user?.lastName || '' 
  });

  // Mutations
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();
  const updateProfileMutation = useUpdateProfile();
  const { data: userData, refetch: refetchUser } = useUser();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginMutation.mutateAsync(loginForm);
      addToast({
        title: 'Login Successful',
        description: 'Welcome back!',
        variant: 'success',
      });
      setShowLogin(false);
      setLoginForm({ email: '', password: '' });
    } catch (error: any) {
      addToast({
        title: 'Login Failed',
        description: error.message || 'Please check your credentials',
        variant: 'error',
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerMutation.mutateAsync(registerForm);
      addToast({
        title: 'Registration Successful',
        description: 'Account created successfully!',
        variant: 'success',
      });
      setShowRegister(false);
      setRegisterForm({ email: '', password: '', firstName: '', lastName: '' });
    } catch (error: any) {
      addToast({
        title: 'Registration Failed',
        description: error.message || 'Please check your information',
        variant: 'error',
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      addToast({
        title: 'Logged Out',
        description: 'You have been logged out successfully',
        variant: 'info',
      });
    } catch (error) {
      addToast({
        title: 'Logout Error',
        description: 'There was an issue logging out',
        variant: 'error',
      });
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfileMutation.mutateAsync(profileForm);
      addToast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully',
        variant: 'success',
      });
      setShowProfile(false);
      refetchUser();
    } catch (error: any) {
      addToast({
        title: 'Update Failed',
        description: error.message || 'Failed to update profile',
        variant: 'error',
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              API Client Demo
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              Authentication and API client infrastructure demonstration
            </p>
          </motion.div>

          {/* Auth Status */}
          <motion.div variants={itemVariants}>
            <Card variant="glass">
              <CardHeader>
                <h2 className="text-2xl font-semibold">Authentication Status</h2>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${isAuthenticated ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="font-medium">
                        Status: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${isLoading ? 'bg-yellow-500' : 'bg-gray-400'}`} />
                      <span className="font-medium">
                        Loading: {isLoading ? 'Yes' : 'No'}
                      </span>
                    </div>

                    {user && (
                      <>
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${isAdmin ? 'bg-purple-500' : 'bg-blue-500'}`} />
                          <span className="font-medium">
                            Role: {user.role}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${isVerified ? 'bg-green-500' : 'bg-orange-500'}`} />
                          <span className="font-medium">
                            Verified: {isVerified ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {user && (
                    <div className="space-y-2">
                      <h3 className="font-medium">User Information:</h3>
                      <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                      <p><strong>Email:</strong> {user.email}</p>
                      <p><strong>ID:</strong> {user.id}</p>
                      <p><strong>Created:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                  )}

                  {error && (
                    <div className="col-span-2">
                      <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                        <AlertCircle className="h-5 w-5" />
                        <span>Error: {error}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Auth Actions */}
          <motion.div variants={itemVariants}>
            <Card variant="glass">
              <CardHeader>
                <h2 className="text-2xl font-semibold">Authentication Actions</h2>
              </CardHeader>
              <CardBody>
                <div className="flex flex-wrap gap-4">
                  {!isAuthenticated ? (
                    <>
                      <Button
                        onClick={() => setShowLogin(true)}
                        leftIcon={<Lock className="h-4 w-4" />}
                        loading={loginMutation.isPending}
                      >
                        Login
                      </Button>
                      <Button
                        onClick={() => setShowRegister(true)}
                        variant="outline"
                        leftIcon={<User className="h-4 w-4" />}
                        loading={registerMutation.isPending}
                      >
                        Register
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={() => setShowProfile(true)}
                        leftIcon={<Settings className="h-4 w-4" />}
                      >
                        Update Profile
                      </Button>
                      <Button
                        onClick={handleLogout}
                        variant="destructive"
                        leftIcon={<LogOut className="h-4 w-4" />}
                        loading={logoutMutation.isPending}
                      >
                        Logout
                      </Button>
                      <Button
                        onClick={() => refetchUser()}
                        variant="outline"
                        leftIcon={<RefreshCw className="h-4 w-4" />}
                      >
                        Refresh User
                      </Button>
                    </>
                  )}
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* API Features */}
          <motion.div variants={itemVariants}>
            <Card variant="glass">
              <CardHeader>
                <h2 className="text-2xl font-semibold">API Client Features</h2>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Automatic Token Refresh</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Request/Response Interceptors</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Exponential Backoff Retry</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>React Query Integration</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Zustand State Management</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>TypeScript Support</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </motion.div>

        {/* Login Modal */}
        <Modal open={showLogin} onOpenChange={setShowLogin}>
          <ModalContent size="md">
            <ModalHeader>
              <ModalTitle>Login</ModalTitle>
              <ModalDescription>
                Enter your credentials to access your account
              </ModalDescription>
              <ModalClose />
            </ModalHeader>
            <form onSubmit={handleLogin}>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label="Email"
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                    leftIcon={<Mail className="h-4 w-4" />}
                    required
                  />
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    leftIcon={<Lock className="h-4 w-4" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    }
                    required
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button type="button" variant="outline" onClick={() => setShowLogin(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={loginMutation.isPending}>
                  Login
                </Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>

        {/* Register Modal */}
        <Modal open={showRegister} onOpenChange={setShowRegister}>
          <ModalContent size="md">
            <ModalHeader>
              <ModalTitle>Register</ModalTitle>
              <ModalDescription>
                Create a new account to get started
              </ModalDescription>
              <ModalClose />
            </ModalHeader>
            <form onSubmit={handleRegister}>
              <ModalBody>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      value={registerForm.firstName}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, firstName: e.target.value }))}
                      required
                    />
                    <Input
                      label="Last Name"
                      value={registerForm.lastName}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, lastName: e.target.value }))}
                      required
                    />
                  </div>
                  <Input
                    label="Email"
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                    leftIcon={<Mail className="h-4 w-4" />}
                    required
                  />
                  <Input
                    label="Password"
                    type="password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                    leftIcon={<Lock className="h-4 w-4" />}
                    required
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button type="button" variant="outline" onClick={() => setShowRegister(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={registerMutation.isPending}>
                  Register
                </Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>

        {/* Profile Update Modal */}
        <Modal open={showProfile} onOpenChange={setShowProfile}>
          <ModalContent size="md">
            <ModalHeader>
              <ModalTitle>Update Profile</ModalTitle>
              <ModalDescription>
                Update your personal information
              </ModalDescription>
              <ModalClose />
            </ModalHeader>
            <form onSubmit={handleUpdateProfile}>
              <ModalBody>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                      required
                    />
                    <Input
                      label="Last Name"
                      value={profileForm.lastName}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                      required
                    />
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button type="button" variant="outline" onClick={() => setShowProfile(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={updateProfileMutation.isPending}>
                  Update Profile
                </Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
};

const ApiDemoPage = () => {
  return (
    <ThemeProvider>
      <QueryProvider>
        <ToastProvider>
          <AuthDemo />
        </ToastProvider>
      </QueryProvider>
    </ThemeProvider>
  );
};

export default ApiDemoPage;

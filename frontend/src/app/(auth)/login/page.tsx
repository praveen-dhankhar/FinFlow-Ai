'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  Button,
} from '@/components/ui';
import { useLogin } from '@/hooks/useAuth';
import { useToast } from '@/components/ui';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Github,
  Chrome,
  ArrowRight,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

// Validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const loginMutation = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setFocus,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  // Auto-focus on email field
  useEffect(() => {
    setFocus('email');
  }, [setFocus]);

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    
    try {
      await loginMutation.mutateAsync({
        email: data.email,
        password: data.password,
      });

      addToast({
        title: 'Welcome back!',
        description: 'You have been successfully logged in.',
        variant: 'success',
      });

      // Redirect to intended destination or dashboard
      const redirectUrl = searchParams.get('redirect') || '/dashboard';
      router.push(redirectUrl);
    } catch (error: any) {
      addToast({
        title: 'Login Failed',
        description: error.message || 'Please check your credentials and try again.',
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'github') => {
    addToast({
      title: 'Coming Soon',
      description: `${provider.charAt(0).toUpperCase() + provider.slice(1)} login will be available soon.`,
      variant: 'info',
    });
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      <Card variant="glass" className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
        <CardHeader className="text-center pb-6">
          <motion.div variants={itemVariants}>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sign in to your account to continue
            </p>
          </motion.div>
        </CardHeader>

        <CardBody className="space-y-6">
          <motion.form
            variants={itemVariants}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            {/* Email Input */}
            <div className="space-y-2">
              <Input
                {...register('email')}
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                leftIcon={<Mail className="h-4 w-4" />}
                error={errors.email?.message}
                autoComplete="email"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Input
                {...register('password')}
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
                error={errors.password?.message}
                autoComplete="current-password"
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  {...register('rememberMe')}
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Remember me
                </span>
              </label>

              <Link
                href="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              loading={isSubmitting}
              disabled={!isValid || isSubmitting}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </motion.form>

          {/* Divider */}
          <motion.div
            variants={itemVariants}
            className="relative"
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">
                Or continue with
              </span>
            </div>
          </motion.div>

          {/* Social Login Buttons */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 gap-3"
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSocialLogin('google')}
              leftIcon={<Chrome className="h-4 w-4" />}
              className="w-full"
            >
              Google
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSocialLogin('github')}
              leftIcon={<Github className="h-4 w-4" />}
              className="w-full"
            >
              GitHub
            </Button>
          </motion.div>
        </CardBody>

        <CardFooter className="text-center pt-6">
          <motion.div
            variants={itemVariants}
            className="w-full"
          >
            <p className="text-gray-600 dark:text-gray-400">
                Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
              >
                Sign up here
              </Link>
            </p>
          </motion.div>
        </CardFooter>
      </Card>

      {/* Success Animation Overlay */}
      <AnimatePresence>
        {loginMutation.isSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-green-500/20 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="bg-white dark:bg-gray-800 rounded-full p-6 shadow-2xl"
            >
              <CheckCircle className="h-16 w-16 text-green-500" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default LoginPage;
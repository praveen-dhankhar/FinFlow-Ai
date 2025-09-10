import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../Button';
import { shake, fadeIn } from '../../utils/animations';

const LoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginValues = z.infer<typeof LoginSchema>;

const LoginForm: React.FC = () => {
  const { login, isLoading } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginValues>({ resolver: zodResolver(LoginSchema), mode: 'onChange' });

  useEffect(() => {
    fadeIn(formRef.current as any);
  }, []);

  const onSubmit = async (values: LoginValues) => {
    try {
      await login(values);
    } catch (e: any) {
      shake(formRef.current as any);
      setError('password', { message: 'Invalid credentials' });
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="login-username" className="block text-sm font-medium text-gray-700">Username</label>
        <input id="login-username" className="input mt-1" autoComplete="username" {...register('username')} />
        {errors.username && <p className="text-red-600 text-sm mt-1">{errors.username.message}</p>}
      </div>
      <div>
        <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">Password</label>
        <input id="login-password" className="input mt-1" type="password" autoComplete="current-password" {...register('password')} />
        {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
};

export default LoginForm;

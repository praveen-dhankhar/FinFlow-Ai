import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../Button';
import { fadeIn, shake } from '../../utils/animations';

const RegisterSchema = z.object({
  username: z.string().min(3, 'At least 3 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'At least 6 characters'),
  confirmPassword: z.string().min(6, 'At least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords must match',
  path: ['confirmPassword'],
});

type RegisterValues = z.infer<typeof RegisterSchema>;

const RegisterForm: React.FC = () => {
  const { register: doRegister, isLoading } = useAuth();
  const [step, setStep] = useState(1);
  const formRef = useRef<HTMLFormElement>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RegisterValues>({ resolver: zodResolver(RegisterSchema), mode: 'onChange' });

  useEffect(() => {
    fadeIn(formRef.current as any);
  }, [step]);

  const onSubmit = async (values: RegisterValues) => {
    try {
      await doRegister({ username: values.username, email: values.email, password: values.password });
    } catch (e: any) {
      shake(formRef.current as any);
      setError('username', { message: 'Registration failed' });
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {step === 1 && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input className="input mt-1" autoComplete="username" {...register('username')} />
            {errors.username && <p className="text-red-600 text-sm mt-1">{errors.username.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input className="input mt-1" type="email" autoComplete="email" {...register('email')} />
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
          </div>
          <Button type="button" className="w-full" onClick={() => setStep(2)}>Next</Button>
        </>
      )}

      {step === 2 && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input className="input mt-1" type="password" autoComplete="new-password" {...register('password')} />
            {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input className="input mt-1" type="password" autoComplete="new-password" {...register('confirmPassword')} />
            {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="w-1/2" onClick={() => setStep(1)}>Back</Button>
            <Button type="submit" className="w-1/2" disabled={isLoading}>{isLoading ? 'Creating…' : 'Create account'}</Button>
          </div>
        </>
      )}
    </form>
  );
};

export default RegisterForm;

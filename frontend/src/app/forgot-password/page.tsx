'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { IconArrowNarrowLeft } from '@tabler/icons-react';
import AuthBrandPanel from '@/components/auth/AuthBrandPanel';
import {
  Input,
  Button,
} from '@heroui/react';

interface ForgotPasswordFormData {
  email: string;
}

export default function ForgotPasswordPage() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>();

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await resetPassword(data.email);
      setSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send reset email';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <AuthBrandPanel
        heading={<>Reset your<br />password</>}
        description="We'll send you instructions to reset your password via email."
      />

      {/* Right Side - Form Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-neutral-900">
        {/* Top Left Back Link */}
        <div className="flex justify-start p-6">
          <Link
            href="/login"
            className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <IconArrowNarrowLeft stroke={2} />
            <span>Back to Sign in</span>
          </Link>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-12 lg:px-16 pb-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                Forgot password?
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                Enter your email address and we&apos;ll send you a link to reset your password
              </p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-lime-50 dark:bg-lime-900/20 border border-lime-200 dark:border-lime-800 rounded-lg">
                <p className="text-sm text-lime-600 dark:text-lime-400 font-medium mb-2">
                  Password reset email sent!
                </p>
                <p className="text-xs text-lime-600 dark:text-lime-400">
                  Check your email for instructions to reset your password. If you don&apos;t see it, check your spam folder.
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}

            {/* Reset Password Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <Input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  type="email"
                  label="Email Address"
                  placeholder="Enter your email"
                  variant="bordered"
                  size="lg"
                  isInvalid={!!errors.email}
                  errorMessage={errors.email?.message}
                  disabled={success}
                />
              </div>

              <Button
                type="submit"
                size="lg"
                isLoading={loading}
                isDisabled={success}
                className="w-full bg-black dark:bg-white text-white dark:text-black font-semibold"
              >
                {success ? 'Email Sent' : 'Send Reset Link'}
              </Button>

              {success && (
                <Button
                  size="lg"
                  variant="bordered"
                  onClick={() => router.push('/login')}
                  className="w-full"
                >
                  Return to Sign In
                </Button>
              )}
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Remember your password?{' '}
                <Link href="/login" className="text-black dark:text-white font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

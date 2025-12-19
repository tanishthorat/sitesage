"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { FaGoogle, FaEye, FaEyeSlash } from "react-icons/fa";
import { Input, Button, Divider, Checkbox } from "@heroui/react";
import { IconArrowNarrowRight } from "@tabler/icons-react";
import AuthBrandPanel from "@/components/auth/AuthBrandPanel";
import { getAuthErrorMessage } from "@/lib/auth-errors";

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setError("");
    setLoading(true);

    try {
      await signIn(data.email, data.password);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <AuthBrandPanel
        heading={<>Welcome back to<br />SiteSage</>}
        description="Continue analyzing your website and improving your SEO performance."
      />

      {/* Right Side - Form Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-neutral-900">
        {/* Top Right Link */}
        <div className="flex justify-end p-6">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="flex text-black dark:text-white font-semibold hover:underline"
            >
              <span>Sign up</span> <IconArrowNarrowRight stroke={2} />
            </Link>
          </p>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-12 lg:px-16 pb-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                Sign in to your account
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                Access your dashboard and continue your analysis
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}

            {/* Social Login Buttons */}
            <div className="space-y-3 mb-6">
              <Button
                size="lg"
                variant="bordered"
                onPress={handleGoogleSignIn}
                isLoading={loading}
                className="w-full justify-center"
                startContent={!loading && <FaGoogle className="text-xl" />}
              >
                Sign in with Google
              </Button>
            </div>

            <div className="relative mb-6">
              <Divider />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-white dark:bg-neutral-900 px-4 text-sm text-neutral-500">
                  or
                </span>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <Input
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  type="email"
                  label="Email Address"
                  placeholder="Enter your email"
                  variant="bordered"
                  size="lg"
                  isInvalid={!!errors.email}
                  errorMessage={errors.email?.message}
                />
              </div>

              <div className="relative">
                <Input
                  {...register("password", {
                    required: "Password is required",
                  })}
                  type={showPassword ? "text" : "password"}
                  label="Password"
                  placeholder="Enter your password"
                  variant="bordered"
                  size="lg"
                  isInvalid={!!errors.password}
                  errorMessage={errors.password?.message}
                  endContent={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="focus:outline-none"
                    >
                      {showPassword ? (
                        <FaEyeSlash className="text-xl text-neutral-400" />
                      ) : (
                        <FaEye className="text-xl text-neutral-400" />
                      )}
                    </button>
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Checkbox
                  {...register("rememberMe")}
                  size="sm"
                  classNames={{
                    label: "text-sm text-neutral-600 dark:text-neutral-400",
                  }}
                >
                  Remember me
                </Checkbox>
                <Link
                  href="/forgot-password"
                  className="text-sm text-black dark:text-white hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                size="lg"
                isLoading={loading}
                className="w-full bg-black dark:bg-white text-white dark:text-black font-semibold"
              >
                Sign in
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

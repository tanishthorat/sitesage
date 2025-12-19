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

interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
  emailPreferences: boolean;
}

export default function SignupPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignUpFormData>({
    defaultValues: {
      emailPreferences: false,
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    setError("");

    // Validate passwords match
    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await signUp(data.email, data.password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create account";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError("");
    setLoading(true);

    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to sign up with Google";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <AuthBrandPanel
        heading={<>Start analyzing<br />your website today</>}
        description="Get instant insights, AI-powered recommendations, and comprehensive SEO metrics."
      />

      {/* Right Side - Form Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-neutral-900">
        {/* Top Right Link */}
        <div className="flex justify-end p-6">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="flex text-black dark:text-white font-semibold hover:underline"
            >
              <span>Sign In</span>
              <IconArrowNarrowRight stroke={2} />
            </Link>
          </p>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-12 lg:px-16 pb-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                Create your free account
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                Join thousands of website owners improving their SEO
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
                onPress={handleGoogleSignUp}
                isLoading={loading}
                className="w-full justify-center"
                startContent={!loading && <FaGoogle className="text-xl" />}
              >
                Sign up with Google
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

            {/* Sign Up Form */}
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
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  type={showPassword ? "text" : "password"}
                  label="Password"
                  placeholder="Create a password"
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

              <div className="relative">
                <Input
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === watch("password") || "Passwords do not match",
                  })}
                  type={showConfirmPassword ? "text" : "password"}
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  variant="bordered"
                  size="lg"
                  isInvalid={!!errors.confirmPassword}
                  errorMessage={errors.confirmPassword?.message}
                  endContent={
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="focus:outline-none"
                    >
                      {showConfirmPassword ? (
                        <FaEyeSlash className="text-xl text-neutral-400" />
                      ) : (
                        <FaEye className="text-xl text-neutral-400" />
                      )}
                    </button>
                  }
                />
              </div>

              <div>
                <Checkbox
                  {...register("emailPreferences")}
                  size="sm"
                  classNames={{
                    label: "text-sm text-neutral-600 dark:text-neutral-400",
                  }}
                >
                  Send me occasional emails with tips and updates
                </Checkbox>
              </div>

              <Button
                type="submit"
                size="lg"
                isLoading={loading}
                className="w-full bg-black dark:bg-white text-white dark:text-black font-semibold"
              >
                Create account
              </Button>

              <p className="text-xs text-center text-neutral-500 dark:text-neutral-400 mt-4">
                By signing up, you agree to our{" "}
                <Link
                  href="/terms"
                  className="underline hover:text-neutral-700 dark:hover:text-neutral-300"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="underline hover:text-neutral-700 dark:hover:text-neutral-300"
                >
                  Privacy Policy
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

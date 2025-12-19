"use client";

import { useState, FormEvent, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@heroui/react";
import api, { apiEndpoints } from "@/lib/api";
import { Report, ApiError } from "@/types/api";
import AppNavbar from "@/components/Navbar";
import FeatureCard from "@/components/FeatureCard";
import {
  ChartBarIcon,
  LightBulbIcon,
  LightningBoltIcon,
} from "@/components/FeatureIcons";
import { IconCircleCheckFilled, IconWorld } from "@tabler/icons-react";

export default function HomePage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);

  /**
   * Normalizes URL by adding https:// if protocol is missing
   */
  const normalizeUrl = (value: string): string => {
    const trimmed = value.trim();
    if (!trimmed) return "";

    // Add https:// if no protocol is present
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      return `https://${trimmed}`;
    }
    return trimmed;
  };

  /**
   * Validates URL format - lenient validation for better UX
   */
  const validateUrl = (value: string): boolean => {
    if (!value) return false;

    const trimmedValue = value.trim();
    if (!trimmedValue) return false;

    // Normalize URL first
    const normalizedUrl = normalizeUrl(trimmedValue);

    try {
      // Validate using URL constructor
      const urlObj = new URL(normalizedUrl);

      // Basic validation: must have http/https protocol and valid hostname
      const isValidProtocol =
        urlObj.protocol === "http:" || urlObj.protocol === "https:";
      const hasValidHostname = urlObj.hostname.length > 0;

      // Check if hostname has at least one dot (e.g., example.com)
      // OR is localhost (for development)
      const hasValidFormat =
        urlObj.hostname.includes(".") || urlObj.hostname === "localhost";

      return isValidProtocol && hasValidHostname && hasValidFormat;
    } catch {
      // If URL constructor fails, try a lenient pattern check
      // This regex allows domains like example.com, sub.example.com, etc.
      const domainPattern =
        /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}(\/.*)?$/;
      return domainPattern.test(trimmedValue);
    }
  };

  /**
   * Memoized validation state to prevent unnecessary re-renders
   */
  const validationState = useMemo(() => {
    if (!touched || !url) return undefined;
    return validateUrl(url) ? "valid" : "invalid";
  }, [url, touched]);

  /**
   * Computed error message for inline validation feedback
   */
  const urlErrorMessage = useMemo(() => {
    if (!touched || !url) return "";
    if (!validateUrl(url)) {
      return "Please enter a valid URL (e.g., example.com or tanishdev.me)";
    }
    return "";
  }, [url, touched]);

  /**
   * Handle input change with immediate validation
   */
  const handleUrlChange = (value: string) => {
    setUrl(value);
    setError(""); // Clear API errors when user types
    if (!touched) setTouched(true);
  };

  /**
   * Handle form submission with comprehensive error handling
   */
  const handleAnalyze = async (e: FormEvent) => {
    e.preventDefault();

    setTouched(true);

    // Trim the URL
    const trimmedUrl = url.trim();

    // Client-side validation before API call
    if (!trimmedUrl) {
      setError("Please enter a URL before analyzing");
      return;
    }

    if (!validateUrl(trimmedUrl)) {
      setError("Please enter a valid URL before analyzing");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Normalize URL - always add https:// if missing
      const normalizedUrl = normalizeUrl(trimmedUrl);

      console.log("Sending request with URL:", normalizedUrl); // Debug log

      const response = await api.post(apiEndpoints.analyze, {
        url: normalizedUrl,
      });
      const report: Report = response.data;

      // Redirect to the public report page
      router.push(`/report/${report.id}`);
    } catch (err: unknown) {
      console.error("Error analyzing URL:", err);

      // Type guard for axios error
      const isAxiosError = err && typeof err === "object" && "response" in err;
      const status = isAxiosError
        ? ((err as Record<string, unknown>).response as Record<string, unknown>)
            ?.status
        : null;
      const apiError = isAxiosError
        ? ((
            (err as Record<string, unknown>).response as Record<string, unknown>
          )?.data as ApiError)
        : null;

      // Comprehensive error handling
      if (status === 429) {
        const detail =
          typeof apiError?.detail === "object" ? apiError.detail : null;
        setError(
          detail?.message ||
            "Rate limit exceeded. Please wait before analyzing this URL again."
        );
      } else if (status === 400) {
        setError("Invalid URL format. Please check and try again.");
      } else if (status === 404) {
        setError("Website not found. Please verify the URL is accessible.");
      } else if (status === 500) {
        setError("Server error. Please try again later.");
      } else if (
        (err &&
          typeof err === "object" &&
          "code" in err &&
          (err as Record<string, unknown>).code === "ECONNABORTED") ||
        (err instanceof Error && err.message.includes("timeout"))
      ) {
        setError("Request timeout. The website took too long to respond.");
      } else {
        const errorMessage =
          apiError?.error ||
          (typeof apiError?.detail === "string"
            ? apiError.detail
            : "Failed to analyze URL. Please try again.");
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen ">
      {/* Navigation */}
      <AppNavbar />

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Analyze Your Website&apos;s
            <span className="block text-indigo-600 dark:text-indigo-400 mt-2">
              SEO Performance
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Get instant insights, AI-powered recommendations, and Google
            PageSpeed metrics to improve your website&apos;s search rankings.
          </p>
        </div>

        {/* Analysis Input */}
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleAnalyze} className="space-y-4">
            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Smart Input with Validation */}
              <Input
                type="text"
                value={url}
                onValueChange={handleUrlChange}
                onBlur={() => setTouched(true)}
                placeholder="example.com or https://example.com"
                disabled={loading}
                validationState={validationState}
                errorMessage={urlErrorMessage}
                isRequired
                size="lg"
                variant="bordered"
                classNames={{
                  base: "flex-1",
                  input: [
                    "text-lg",
                    "placeholder:text-gray-400",
                    "dark:placeholder:text-gray-500",
                  ],
                  inputWrapper: [
                    "border-gray-300",
                    "dark:border-gray-600",
                    "hover:border-indigo-500",
                    "dark:hover:border-indigo-400",
                    "group-data-[focus=true]:border-indigo-500",
                    "dark:group-data-[focus=true]:border-indigo-400",
                  ],
                  errorMessage: "text-rose-500 dark:text-rose-500 text-sm mt-1",
                }}
                startContent={
                  <IconWorld stroke={2} />
                }
                endContent={
                  validationState === "valid" && (
                    <IconCircleCheckFilled className="text-primary" stroke={2} />
                  )
                }
              />

              <Button
                type="submit"
                color="primary"
                size="lg"
                isLoading={loading}
                isDisabled={loading || (touched && (!url || !!urlErrorMessage))}
                className="px-8 py-4 text-lg shadow-lg w-full sm:w-auto"
              >
                {loading ? "Analyzing..." : "Analyze Now"}
              </Button>
            </div>
          </form>
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 my-16">
          <FeatureCard
            icon={<ChartBarIcon />}
            title="SEO Analysis"
            description="Comprehensive SEO scoring and detailed metrics for your website"
            colorVariant="indigo"
          />

          <FeatureCard
            icon={<LightningBoltIcon />}
            title="PageSpeed Insights"
            description="Google Lighthouse metrics for performance, accessibility, and best practices"
            colorVariant="purple"
          />

          <FeatureCard
            icon={<LightBulbIcon />}
            title="AI Recommendations"
            description="Smart, actionable suggestions powered by AI to boost your SEO"
            colorVariant="pink"
            className="sm:col-span-2 lg:col-span-1"
          />
        </div>
      </main>
    </div>
  );
}

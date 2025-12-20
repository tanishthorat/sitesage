// constants/contentMetricsReviews.ts
import {
  IconCheck,
  IconAlertTriangle,
  IconX,
  type Icon,
} from "@tabler/icons-react";

export type ReviewStatus = "poor" | "fair" | "good" | "excellent";

export interface MetricReview {
  status: ReviewStatus;
  icon: Icon;
  color: string;
  bgColor: string;
  title: string;
  message: string;
}

/**
 * Get review status and recommendations for word count
 */
export const getWordCountReview = (wordCount: number): MetricReview => {
  if (wordCount < 300) {
    return {
      status: "poor",
      icon: IconX,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      title: "Content is too short",
      message:
        "Your page has less than 300 words. Search engines prefer pages with at least 300-500 words of quality content. Consider adding more comprehensive information.",
    };
  } else if (wordCount < 500) {
    return {
      status: "fair",
      icon: IconAlertTriangle,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      title: "Content length is acceptable",
      message:
        "Your page has a decent word count, but adding more comprehensive content (500-1500 words) could improve SEO rankings and user engagement.",
    };
  } else if (wordCount < 1000) {
    return {
      status: "good",
      icon: IconCheck,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      title: "Good content length",
      message:
        "Your page has good content length. This is sufficient for most pages. For pillar content or in-depth guides, consider 1500+ words.",
    };
  } else {
    return {
      status: "excellent",
      icon: IconCheck,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      title: "Excellent content length",
      message:
        "Your page has comprehensive content. This length is ideal for in-depth articles and can help establish topical authority.",
    };
  }
};

/**
 * Get review status and recommendations for H1 count
 */
export const getH1Review = (h1Count: number): MetricReview => {
  if (h1Count === 0) {
    return {
      status: "poor",
      icon: IconX,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      title: "Missing H1 heading",
      message:
        "Every page should have exactly one H1 tag. The H1 is the main heading and tells search engines what your page is about.",
    };
  } else if (h1Count === 1) {
    return {
      status: "excellent",
      icon: IconCheck,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      title: "Perfect H1 structure",
      message:
        "Your page has exactly one H1 tag, which is the recommended best practice for SEO and accessibility.",
    };
  } else {
    return {
      status: "poor",
      icon: IconX,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      title: "Multiple H1 tags detected",
      message: `Your page has ${h1Count} H1 tags. Having multiple H1 tags can confuse search engines. Use only one H1 for the main page title.`,
    };
  }
};

/**
 * Get review status and recommendations for H2 count
 */
export const getH2Review = (h2Count: number): MetricReview => {
  if (h2Count === 0) {
    return {
      status: "fair",
      icon: IconAlertTriangle,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      title: "No H2 headings found",
      message:
        "H2 headings help structure your content and improve readability. Consider adding section headings using H2 tags.",
    };
  } else if (h2Count < 3) {
    return {
      status: "fair",
      icon: IconAlertTriangle,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      title: "Few H2 headings",
      message:
        "Your page has some H2 headings, but adding more can improve content structure and SEO. Aim for 3-5 H2 sections for longer content.",
    };
  } else {
    return {
      status: "good",
      icon: IconCheck,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      title: "Good heading structure",
      message:
        "Your page has a good number of H2 headings, which helps organize content and improve both SEO and user experience.",
    };
  }
};

/**
 * Get review status and recommendations for image count
 */
export const getImagesReview = (imageCount: number): MetricReview => {
  if (imageCount === 0) {
    return {
      status: "fair",
      icon: IconAlertTriangle,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      title: "No images found",
      message:
        "Adding relevant images can improve user engagement and time on page. Consider adding 2-5 high-quality images with descriptive alt text.",
    };
  } else if (imageCount < 3) {
    return {
      status: "fair",
      icon: IconAlertTriangle,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      title: "Limited images",
      message:
        "Your page has some images, but adding more relevant visuals can enhance user experience and engagement.",
    };
  } else {
    return {
      status: "good",
      icon: IconCheck,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      title: "Good image usage",
      message:
        "Your page has a good number of images. Visual content helps break up text and keeps users engaged.",
    };
  }
};

/**
 * Get chip styling based on review status
 */
export const getStatusChipProps = (
  status: ReviewStatus
): { color: "danger" | "warning" | "success" | "primary"; variant: "flat" } => {
  switch (status) {
    case "poor":
      return { color: "danger", variant: "flat" };
    case "fair":
      return { color: "warning", variant: "flat" };
    case "good":
      return { color: "success", variant: "flat" };
    case "excellent":
      return { color: "primary", variant: "flat" };
    default:
      return { color: "primary", variant: "flat" };
  }
};

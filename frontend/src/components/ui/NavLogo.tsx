"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

type LogoVariant = "horizontal" | "compact";
type LogoColor = "dark" | "white" | "primary";
type LogoSize = "xs" | "sm" | "md" | "lg" | "xl" | "custom";

interface NavLogoProps {
  variant?: LogoVariant;
  color?: LogoColor;
  size?: LogoSize;
  customWidth?: number;
  customHeight?: number;
  style?: React.CSSProperties;
  className?: string;
  showText?: boolean;
  textClassName?: string;
  animate?: boolean;
  responsive?: boolean; // Auto-switch between horizontal and compact on mobile
}

const sizeMap = {
  xs: { compact: { width: 24, height: 24 }, horizontal: { width: 80, height: 24 } },
  sm: { compact: { width: 32, height: 32 }, horizontal: { width: 120, height: 32 } },
  md: { compact: { width: 40, height: 40 }, horizontal: { width: 160, height: 40 } },
  lg: { compact: { width: 48, height: 48 }, horizontal: { width: 200, height: 48 } },
  xl: { compact: { width: 60, height: 60 }, horizontal: { width: 240, height: 60 } },
  custom: { compact: { width: 40, height: 40 }, horizontal: { width: 160, height: 40 } },
};

export default function NavLogo({
  variant = "compact",
  color = "dark",
  size = "md",
  customWidth,
  customHeight,
  style,
  className = "",
  showText = true,
  textClassName = "",
  animate = true,
  responsive = false,
}: NavLogoProps) {
  const [currentVariant, setCurrentVariant] = useState<LogoVariant>(
    responsive && typeof window !== 'undefined' && window.innerWidth < 1024 
      ? 'compact' 
      : variant
  );
  const [isMounted, setIsMounted] = useState(false);

  // Handle hydration with useLayoutEffect pattern
  useEffect(() => {
    const timeoutId = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timeoutId);
  }, []);

  // Handle responsive variant switching
  useEffect(() => {
    if (!responsive || !isMounted) {
      return;
    }

    const handleResize = () => {
      const width = window.innerWidth;
      // Switch to compact on mobile/tablet (< 1024px)
      const newVariant = width < 1024 ? "compact" : variant;
      setCurrentVariant(newVariant);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [variant, responsive, isMounted]);

  // Get logo path based on variant and color
  const getLogoPath = () => {
    if (currentVariant === "horizontal") {
      return color === "white"
        ? "/icons-assets/logo-horizontal-white.svg"
        : "/icons-assets/logo-horizontal-dark.svg";
    } else {
      return color === "white"
        ? "/icons-assets/logo-compact-white.svg"
        : "/icons-assets/logo-compact-dark.svg";
    }
  };

  // Get dimensions
  const getDimensions = () => {
    if (size === "custom" && customWidth && customHeight) {
      return { width: customWidth, height: customHeight };
    }
    return sizeMap[size][currentVariant];
  };

  const dimensions = getDimensions();
  const logoPath = getLogoPath();

  // Animation variants with proper typing
  const logoVariants: Variants = {
    initial: { 
      opacity: 0, 
      scale: 0.8,
      rotateY: -90 
    },
    animate: { 
      opacity: 1, 
      scale: 1,
      rotateY: 0,
      transition: {
        duration: 0.5,
        ease: [0.43, 0.13, 0.23, 0.96],
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      rotateY: 90,
      transition: {
        duration: 0.3,
        ease: [0.43, 0.13, 0.23, 0.96],
      }
    },
  };

  const textVariants: Variants = {
    initial: { 
      opacity: 0, 
      x: -20,
    },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.4,
        delay: 0.2,
        ease: [0.43, 0.13, 0.23, 0.96],
      }
    },
    exit: { 
      opacity: 0, 
      x: 20,
      transition: {
        duration: 0.2,
        ease: [0.43, 0.13, 0.23, 0.96],
      }
    },
  };

  // Prevent hydration mismatch
  if (!isMounted) {
    return (
      <div 
        style={{ 
          width: dimensions.width, 
          height: dimensions.height,
          ...style 
        }} 
        className={className}
      />
    );
  }

  return (
    <div 
      className={`flex items-center gap-3 ${className}`} 
      style={style}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentVariant}-${color}-${size}`}
          variants={animate ? logoVariants : undefined}
          initial={animate ? "initial" : false}
          animate={animate ? "animate" : false}
          exit={animate ? "exit" : undefined}
          style={{ perspective: 1000 }}
        >
          <Image
            src={logoPath}
            alt="SiteSage Logo"
            width={dimensions.width}
            height={dimensions.height}
            priority
          />
        </motion.div>
      </AnimatePresence>

      {showText && currentVariant === "compact" && (
        <AnimatePresence mode="wait">
          <motion.div
            key={`text-${currentVariant}`}
            variants={animate ? textVariants : undefined}
            initial={animate ? "initial" : false}
            animate={animate ? "animate" : false}
            exit={animate ? "exit" : undefined}
          >
            <div>
              <h1 
                className={
                  textClassName || 
                  "text-lg font-bold text-neutral-900 dark:text-white"
                }
              >
                SiteSage
              </h1>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                SEO Analytics
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

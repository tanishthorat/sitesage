// tailwind.config.js
import { heroui } from "@heroui/theme";

// 1. Define your colors ONCE here.
// This is your Single Source of Truth.
const brandColors = {
  seoGreen: {
    50: "#f7fbf4",
    100: "#e7f5de",
    200: "#cfebbd",
    300: "#afde92",
    400: "#87ce5b",
    500: "#60BE25", // Primary Base
    600: "#51a11f",
    700: "#438519",
    800: "#305f12",
    900: "#182f09",
    950: "#0e1c05",
    DEFAULT: "#60BE25",
    foreground: "#ffffff",
  },
  trustBlue: {
    50: "#f2f9fd",
    100: "#d8edfb",
    200: "#b2dcf8",
    300: "#7fc6f4",
    400: "#3fa9ef",
    500: "#008DEA", // Secondary Base
    600: "#0077c6",
    700: "#0062a3",
    800: "#004675",
    900: "#00233a",
    950: "#001523",
    DEFAULT: "#008DEA",
    foreground: "#ffffff",
  },
  alertOrange: {
    50: "#fff7f4",
    100: "#ffe8df",
    200: "#ffd2c0",
    300: "#ffb496",
    400: "#ff8e62",
    500: "#FF692E", // Accent Base
    600: "#d85927",
    700: "#b24920",
    800: "#7f3417",
    900: "#3f1a0b",
    950: "#260f06",
    DEFAULT: "#FF692E",
    foreground: "#ffffff",
  },
  deepOlive: {
    50: "#f5f5f5",
    100: "#e2e3e1",
    200: "#c6c8c4",
    300: "#a0a49d",
    400: "#70766c",
    500: "#41493B", // Dark Neutral Base
    600: "#373e32",
    700: "#2d3329",
    800: "#20241d",
    900: "#10120e",
    950: "#090a08",
  },
  sageGrey: {
    50: "#fafafa",
    100: "#f1f2f0",
    200: "#e4e6e1",
    300: "#d2d6ce",
    400: "#bbc2b5",
    500: "#A5AE9D", // Mid Neutral Base
    600: "#8c9385",
    700: "#73796d",
    800: "#52574e",
    900: "#292b27",
    950: "#181a17",
  },
  highlightCyan: {
    50: "#f2fcff",
    100: "#d8f6ff",
    200: "#b2edff",
    300: "#7fe1ff",
    400: "#3fd2ff",
    500: "#00C4FF", // Highlight Base
    600: "#00a6d8",
    700: "#0089b2",
    800: "#00627f",
    900: "#00313f",
    950: "#001d26",
    DEFAULT: "#00C4FF",
    foreground: "#000000",
  },
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom names if you want to use 'bg-olive-500' or 'text-sage-600'
        olive: brandColors.deepOlive,
        sage: brandColors.sageGrey,
        cyan: brandColors.highlightCyan,
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            background: "#ffffff",
            foreground: brandColors.deepOlive[900], // Dark olive text for high contrast
            primary: brandColors.seoGreen,
            secondary: brandColors.trustBlue,
            warning: brandColors.alertOrange, // Mapped 'Accent' to Warning
            success: brandColors.seoGreen,    // Mapped 'SEO Green' to Success
            info: brandColors.highlightCyan,  // Mapped 'Highlight' to Info
            
            // Custom semantic mapping for your specific neutrals
            content1: brandColors.sageGrey[50], // Card backgrounds
            content2: brandColors.sageGrey[100],
            content3: brandColors.sageGrey[200],
          },
        },
        dark: {
          colors: {
            // Your "Deep Olive" background for dark mode
            background: brandColors.deepOlive[950], 
            foreground: "#ededed",
            
            primary: brandColors.seoGreen,
            secondary: brandColors.trustBlue,
            warning: brandColors.alertOrange,
            success: brandColors.seoGreen,
            info: brandColors.highlightCyan,

            // Dark mode surfaces using your Deep Olive scale
            // content1: brandColors.deepOlive[900],
            // content2: brandColors.deepOlive[800],
            // content3: brandColors.deepOlive[700],
          },
        },
      },
    }),
  ],
};
import { ReactNode } from 'react';

/**
 * Color variant type for the feature card icon gradient
 */
type ColorVariant = 'indigo' | 'purple' | 'pink' | 'blue' | 'green' | 'orange' | 'red';

/**
 * Props interface for the FeatureCard component
 */
interface FeatureCardProps {
  /** The icon element (SVG or any ReactNode) to display */
  icon: ReactNode;
  
  /** The title of the feature */
  title: string;
  
  /** The description text of the feature */
  description: string;
  
  /** Color variant for the icon background gradient and hover shadow */
  colorVariant?: ColorVariant;
  
  /** Optional additional CSS classes for the card container */
  className?: string;
}

/**
 * Color configuration map for different variants
 */
const colorConfig: Record<ColorVariant, {
  gradient: string;
  shadow: string;
  hoverShadow: string;
}> = {
  indigo: {
    gradient: 'from-indigo-500 to-indigo-700',
    shadow: 'shadow-indigo-500/50',
    hoverShadow: 'hover:shadow-indigo-500/20',
  },
  purple: {
    gradient: 'from-purple-500 to-purple-700',
    shadow: 'shadow-purple-500/50',
    hoverShadow: 'hover:shadow-purple-500/20',
  },
  pink: {
    gradient: 'from-pink-500 to-pink-700',
    shadow: 'shadow-pink-500/50',
    hoverShadow: 'hover:shadow-pink-500/20',
  },
  blue: {
    gradient: 'from-blue-500 to-blue-700',
    shadow: 'shadow-blue-500/50',
    hoverShadow: 'hover:shadow-blue-500/20',
  },
  green: {
    gradient: 'from-green-500 to-green-700',
    shadow: 'shadow-green-500/50',
    hoverShadow: 'hover:shadow-green-500/20',
  },
  orange: {
    gradient: 'from-orange-500 to-orange-700',
    shadow: 'shadow-orange-500/50',
    hoverShadow: 'hover:shadow-orange-500/20',
  },
  red: {
    gradient: 'from-red-500 to-red-700',
    shadow: 'shadow-red-500/50',
    hoverShadow: 'hover:shadow-red-500/20',
  },
};

/**
 * FeatureCard - A glassmorphic card component for displaying features
 * 
 * @example
 * ```
 * <FeatureCard
 *   icon={<ChartBarIcon />}
 *   title="SEO Analysis"
 *   description="Comprehensive SEO scoring"
 *   colorVariant="indigo"
 * />
 * ```
 */
export default function FeatureCard({
  icon,
  title,
  description,
  colorVariant = 'indigo',
  className = '',
}: FeatureCardProps) {
  const colors = colorConfig[colorVariant];

  return (
    <article
      className={`
        group 
        backdrop-blur-xl 
        bg-white/5 
        border border-white/10 
        rounded-2xl 
        p-8 
        hover:bg-white/10 
        transition-all 
        duration-500 
        hover:scale-105 
        hover:shadow-2xl 
        ${colors.hoverShadow}
        ${className}
      `}
    >
      {/* Icon Container */}
      <div
        className={`
          w-16 h-16 
          bg-gradient-to-br 
          ${colors.gradient}
          rounded-2xl 
          flex items-center justify-center 
          mb-6 
          shadow-lg 
          ${colors.shadow}
          group-hover:scale-110 
          transition-transform 
          duration-300
        `}
        aria-hidden="true"
      >
        {icon}
      </div>

      {/* Content */}
      <h3 className="text-xl font-semibold text-white mb-3">
        {title}
      </h3>
      <p className="text-gray-400 leading-relaxed">
        {description}
      </p>
    </article>
  );
}

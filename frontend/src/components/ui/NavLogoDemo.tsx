"use client";

import NavLogo from "./NavLogo";

/**
 * NavLogo Component Demo
 * 
 * This component showcases all the different variants and configurations
 * of the NavLogo component.
 * 
 * Usage Examples:
 * ===============
 * 
 * 1. Basic Compact Logo (Dark):
 * ```tsx
 * <NavLogo variant="compact" color="dark" size="md" />
 * ```
 * 
 * 2. Horizontal Logo (White for dark backgrounds):
 * ```tsx
 * <NavLogo variant="horizontal" color="white" size="lg" showText={false} />
 * ```
 * 
 * 3. Responsive Logo (switches between horizontal/compact):
 * ```tsx
 * <NavLogo variant="horizontal" color="dark" size="md" responsive={true} animate={true} />
 * ```
 * 
 * 4. Custom Sized Logo:
 * ```tsx
 * <NavLogo 
 *   variant="compact" 
 *   color="dark" 
 *   size="custom" 
 *   customWidth={100} 
 *   customHeight={100} 
 * />
 * ```
 * 
 * 5. Logo with Custom Text Styling:
 * ```tsx
 * <NavLogo 
 *   variant="compact" 
 *   color="dark" 
 *   size="lg" 
 *   showText={true}
 *   textClassName="text-2xl font-extrabold text-primary-600"
 * />
 * ```
 * 
 * Props:
 * ======
 * - variant: "horizontal" | "compact" - Logo shape
 * - color: "dark" | "white" | "primary" - Logo color theme
 * - size: "xs" | "sm" | "md" | "lg" | "xl" | "custom" - Predefined sizes
 * - customWidth: number - Custom width (only with size="custom")
 * - customHeight: number - Custom height (only with size="custom")
 * - style: React.CSSProperties - Custom inline styles
 * - className: string - Additional CSS classes
 * - showText: boolean - Show "SiteSage" text (only for compact variant)
 * - textClassName: string - Custom classes for the text
 * - animate: boolean - Enable framer-motion animations
 * - responsive: boolean - Auto-switch between horizontal/compact on resize
 */

export default function NavLogoDemo() {
  return (
    <div className="p-8 space-y-12 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-950 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">
          NavLogo Component Demo
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-8">
          Explore all variants and configurations of the brand logo component
        </p>

        {/* Compact Variants */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-200 border-b-2 border-primary-500 pb-2">
            Compact Variants
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dark Compact - All Sizes */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-700">
              <h3 className="text-lg font-semibold mb-4 text-neutral-700 dark:text-neutral-300">
                Dark Compact (All Sizes)
              </h3>
              <div className="space-y-6">
                <div>
                  <p className="text-xs text-neutral-500 mb-2">XS</p>
                  <NavLogo variant="compact" color="dark" size="xs" animate={false} />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-2">SM</p>
                  <NavLogo variant="compact" color="dark" size="sm" animate={false} />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-2">MD (Default)</p>
                  <NavLogo variant="compact" color="dark" size="md" animate={false} />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-2">LG</p>
                  <NavLogo variant="compact" color="dark" size="lg" animate={false} />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-2">XL</p>
                  <NavLogo variant="compact" color="dark" size="xl" animate={false} />
                </div>
              </div>
            </div>

            {/* White Compact - All Sizes */}
            <div className="bg-neutral-900 dark:bg-neutral-950 rounded-xl p-6 shadow-lg border border-neutral-700">
              <h3 className="text-lg font-semibold mb-4 text-white">
                White Compact (All Sizes)
              </h3>
              <div className="space-y-6">
                <div>
                  <p className="text-xs text-neutral-400 mb-2">XS</p>
                  <NavLogo variant="compact" color="white" size="xs" animate={false} />
                </div>
                <div>
                  <p className="text-xs text-neutral-400 mb-2">SM</p>
                  <NavLogo variant="compact" color="white" size="sm" animate={false} />
                </div>
                <div>
                  <p className="text-xs text-neutral-400 mb-2">MD (Default)</p>
                  <NavLogo variant="compact" color="white" size="md" animate={false} />
                </div>
                <div>
                  <p className="text-xs text-neutral-400 mb-2">LG</p>
                  <NavLogo variant="compact" color="white" size="lg" animate={false} />
                </div>
                <div>
                  <p className="text-xs text-neutral-400 mb-2">XL</p>
                  <NavLogo variant="compact" color="white" size="xl" animate={false} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Horizontal Variants */}
        <section className="space-y-6 mt-12">
          <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-200 border-b-2 border-primary-500 pb-2">
            Horizontal Variants
          </h2>
          
          <div className="space-y-6">
            {/* Dark Horizontal */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-700">
              <h3 className="text-lg font-semibold mb-4 text-neutral-700 dark:text-neutral-300">
                Dark Horizontal (All Sizes)
              </h3>
              <div className="space-y-6">
                <div>
                  <p className="text-xs text-neutral-500 mb-2">SM</p>
                  <NavLogo variant="horizontal" color="dark" size="sm" showText={false} animate={false} />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-2">MD</p>
                  <NavLogo variant="horizontal" color="dark" size="md" showText={false} animate={false} />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-2">LG</p>
                  <NavLogo variant="horizontal" color="dark" size="lg" showText={false} animate={false} />
                </div>
              </div>
            </div>

            {/* White Horizontal */}
            <div className="bg-neutral-900 dark:bg-neutral-950 rounded-xl p-6 shadow-lg border border-neutral-700">
              <h3 className="text-lg font-semibold mb-4 text-white">
                White Horizontal (All Sizes)
              </h3>
              <div className="space-y-6">
                <div>
                  <p className="text-xs text-neutral-400 mb-2">SM</p>
                  <NavLogo variant="horizontal" color="white" size="sm" showText={false} animate={false} />
                </div>
                <div>
                  <p className="text-xs text-neutral-400 mb-2">MD</p>
                  <NavLogo variant="horizontal" color="white" size="md" showText={false} animate={false} />
                </div>
                <div>
                  <p className="text-xs text-neutral-400 mb-2">LG</p>
                  <NavLogo variant="horizontal" color="white" size="lg" showText={false} animate={false} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Animated Examples */}
        <section className="space-y-6 mt-12">
          <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-200 border-b-2 border-primary-500 pb-2">
            Animated Transitions
          </h2>
          
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-700">
            <h3 className="text-lg font-semibold mb-4 text-neutral-700 dark:text-neutral-300">
              With Framer Motion Animations
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
              Refresh the page to see the entrance animations
            </p>
            <div className="space-y-6">
              <NavLogo variant="compact" color="dark" size="lg" animate={true} />
            </div>
          </div>
        </section>

        {/* Responsive Example */}
        <section className="space-y-6 mt-12">
          <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-200 border-b-2 border-primary-500 pb-2">
            Responsive Logo
          </h2>
          
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-950/30 dark:to-primary-900/30 rounded-xl p-6 shadow-lg border-2 border-primary-300 dark:border-primary-700">
            <h3 className="text-lg font-semibold mb-2 text-neutral-800 dark:text-neutral-200">
              Auto-switching Logo
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
              This logo automatically switches between horizontal and compact based on screen size. 
              Resize your browser window to see the smooth transition!
            </p>
            <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 inline-block">
              <NavLogo 
                variant="horizontal" 
                color="dark" 
                size="lg" 
                responsive={true} 
                animate={true}
                showText={false}
              />
            </div>
          </div>
        </section>

        {/* Custom Size Example */}
        <section className="space-y-6 mt-12">
          <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-200 border-b-2 border-primary-500 pb-2">
            Custom Sizing
          </h2>
          
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-700">
            <h3 className="text-lg font-semibold mb-4 text-neutral-700 dark:text-neutral-300">
              Custom Width & Height
            </h3>
            <div className="space-y-6">
              <div>
                <p className="text-xs text-neutral-500 mb-2">100x100px</p>
                <NavLogo 
                  variant="compact" 
                  color="dark" 
                  size="custom" 
                  customWidth={100} 
                  customHeight={100}
                  showText={false}
                  animate={false}
                />
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-2">300x60px (Horizontal)</p>
                <NavLogo 
                  variant="horizontal" 
                  color="dark" 
                  size="custom" 
                  customWidth={300} 
                  customHeight={60}
                  showText={false}
                  animate={false}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Code Examples */}
        <section className="space-y-6 mt-12">
          <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-200 border-b-2 border-primary-500 pb-2">
            Usage Code Examples
          </h2>
          
          <div className="bg-neutral-900 rounded-xl p-6 shadow-lg border border-neutral-700 overflow-x-auto">
            <pre className="text-sm text-neutral-100 font-mono">
{`// Sidebar Logo (Desktop)
<NavLogo 
  variant="compact"
  color="dark"
  size="md"
  showText={true}
  animate={true}
  responsive={false}
/>

// Mobile Header Logo
<NavLogo 
  variant="compact"
  color="dark"
  size="sm"
  showText={true}
  animate={true}
  responsive={true}
  textClassName="text-base font-bold"
/>

// Responsive Navbar Logo
<NavLogo 
  variant="horizontal"
  color="white"
  size="lg"
  responsive={true}
  animate={true}
  showText={false}
/>

// Custom Styled Logo
<NavLogo 
  variant="compact"
  color="dark"
  size="custom"
  customWidth={80}
  customHeight={80}
  className="hover:scale-110 transition-transform"
  showText={true}
  textClassName="text-2xl font-black text-primary-600"
/>`}
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
}

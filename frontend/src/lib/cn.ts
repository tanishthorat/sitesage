import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * A utility function to merge Tailwind CSS classes efficiently.
 *
 * This function combines clsx for conditional class handling and tailwind-merge
 * for proper Tailwind class merging, ensuring that conflicting classes are
 * resolved correctly (e.g., "px-2 px-4" becomes just "px-4").
 *
 * @param inputs - Class values that can be strings, objects, arrays, or conditional expressions
 * @returns A merged string of Tailwind classes
 *
 * @example
 * ```jsx
 * // Basic usage
 * cn("px-2 py-1", "bg-blue-500")
 * // => "px-2 py-1 bg-blue-500"
 *
 * // Conditional classes
 * cn("px-2 py-1", isActive && "bg-blue-500")
 * // => "px-2 py-1 bg-blue-500" (if isActive is true)
 *
 * // Object syntax
 * cn("px-2 py-1", { "bg-blue-500": isActive, "bg-gray-200": !isActive })
 * // => "px-2 py-1 bg-blue-500" (if isActive is true)
 *
 * // Conflicting classes (tailwind-merge resolves conflicts)
 * cn("px-2 px-4", "py-1 py-2")
 * // => "px-4 py-2"
 *
 * // Array of classes
 * cn(["px-2", "py-1"], ["bg-blue-500", isActive && "hover:bg-blue-600"])
 * // => "px-2 py-1 bg-blue-500 hover:bg-blue-600" (if isActive is true)
 *
 * // Component prop example
 * <Button className={cn("text-lg", size === "large" && "px-8 py-4", size === "small" && "px-2 py-1")} />
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Export as default for convenience
export default cn;

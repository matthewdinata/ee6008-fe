import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * A utility function for conditionally joining classNames together
 * This combines clsx for conditional class joining with tailwind-merge to handle
 * conflicting Tailwind CSS classes properly
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

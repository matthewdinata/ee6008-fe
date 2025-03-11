import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Converts a date to a relative time string, e.g. "5 minutes ago" or "2 hours ago"
 */
export function getRelativeTimeString(date: Date | null): string {
	if (!date) return 'just now';

	const now = new Date();
	const diffInMs = now.getTime() - date.getTime();
	const diffInSecs = Math.floor(diffInMs / 1000);
	const diffInMins = Math.floor(diffInSecs / 60);
	const diffInHours = Math.floor(diffInMins / 60);
	const diffInDays = Math.floor(diffInHours / 24);

	if (diffInSecs < 60) {
		return diffInSecs <= 5 ? 'just now' : `${diffInSecs} seconds ago`;
	}
	if (diffInMins < 60) {
		return `${diffInMins} minute${diffInMins > 1 ? 's' : ''} ago`;
	}
	if (diffInHours < 24) {
		return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
	}
	if (diffInDays < 7) {
		return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
	}

	// For older dates, return the actual date string
	return date.toLocaleDateString();
}

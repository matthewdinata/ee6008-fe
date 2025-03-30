/**
 * Helper functions for formatting and manipulating data
 */

/**
 * Formats a date string to a human-readable format
 * @param dateString - ISO date string to format
 * @returns Formatted date string (e.g. "Jan 1, 2023 at 12:00 PM")
 */
export function formatDate(dateString: string): string {
	if (!dateString) return 'N/A';

	const date = new Date(dateString);
	return date.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
		hour12: true,
	});
}

/**
 * Truncates a string to a specified length
 * @param str - String to truncate
 * @param length - Maximum length
 * @returns Truncated string with ellipsis if needed
 */
export function truncateString(str: string, length: number): string {
	if (!str) return '';
	return str.length > length ? `${str.substring(0, length)}...` : str;
}

/**
 * Extracts the first name from a full name
 * @param fullName - Full name string
 * @returns First name
 */
export function getFirstName(fullName: string): string {
	if (!fullName) return '';
	return fullName.split(' ')[0];
}

/**
 * Creates a unique identifier
 * @returns A UUID-like string
 */
export function generateId(): string {
	return (
		Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
	);
}

/**
 * Checks if a value is empty (null, undefined, empty string, empty array, or empty object)
 * @param value - Value to check
 * @returns Boolean indicating if the value is empty
 */
export function isEmpty(value: unknown): boolean {
	if (value === null || value === undefined) return true;
	if (typeof value === 'string') return value.trim() === '';
	if (Array.isArray(value)) return value.length === 0;
	if (typeof value === 'object') return Object.keys(value as object).length === 0;
	return false;
}

/**
 * Capitalizes the first letter of a string
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
	if (!str) return '';
	return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Utility function to parse email string into array
 * Supports multiple formats: space-separated, comma-separated
 */
export const parseEmails = (emailString: string): string[] => {
	if (!emailString) return [];

	// Split by comma or space
	return emailString
		.split(/[,\s]+/)
		.map((email) => email.trim())
		.filter((email) => email.length > 0);
};

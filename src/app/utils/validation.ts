// utils/validation.ts

export const isValidNTUEmail = (email: string): boolean => {
	const validDomains = ['e.ntu.edu.sg', 'staff.ntu.edu.sg', 'ntu.edu.sg'];
	return validDomains.some((domain) => email.toLowerCase().endsWith(domain));
};

/* eslint-disable import/extensions */
'use server';

/**
 * Server action to verify authentication
 * @param accessToken User's access token for authorization
 */
export async function verifyAuth(accessToken: string) {
	const apiUrl = process.env.BACKEND_API_URL;
	if (!apiUrl) {
		throw new Error('Backend API URL is not defined');
	}

	const response = await fetch(`${apiUrl}/auth/verify`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${accessToken}`,
		},
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	return response.json();
}

/**
 * Server action to check user eligibility/authentication
 * @param data User data to check (email, name, userId)
 * @param accessToken User's access token for authorization
 */
interface UserData {
	email: string;
	name: string;
	userId: string;
}

export async function checkEligibility(data: UserData, accessToken?: string) {
	try {
		if (!accessToken) {
			throw new Error('No access token provided');
		}

		const apiUrl = process.env.BACKEND_API_URL;
		if (!apiUrl) {
			throw new Error('Backend API URL is not defined');
		}

		// Direct fetch without using fetcherFn
		const response = await fetch(`${apiUrl}/auth/verify`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
			body: JSON.stringify({
				email: data.email,
				name: data.name,
				userId: data.userId,
			}),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		return response.json();
	} catch (error) {
		console.error('Error checking eligibility:', error);
		throw error;
	}
}

'use server';

import { cookies } from 'next/headers';

import { fetcherFn } from '@/utils/functions';

// Define interfaces for the data types
export interface User {
	id: number;
	email: string;
	name: string;
	is_course_coordinator?: boolean;
}

interface Semester {
	id: number;
	academic_year: number;
	name: string;
	is_active: boolean;
	status: string;
}

// Interface updated to ensure semesterId is treated as a number
interface StudentUserData {
	email: string;
	name: string;
	studentID: string;
	semesterID?: number;
}

// Define response types for server actions
export type ServerActionSuccess<T> = {
	success: true;
	data: T;
	error?: undefined;
};

export type ServerActionError = {
	success: false;
	error: string;
	data?: undefined;
};

export type ServerActionResponse<T> = ServerActionSuccess<T> | ServerActionError;

export async function getAccessToken(): Promise<string | null> {
	const cookieStore = cookies();
	return cookieStore.get('session-token')?.value || null;
}

/**
 * Server action to fetch all semesters
 */
export async function getSemesters(): Promise<ServerActionResponse<Semester[]>> {
	try {
		const accessToken = await getAccessToken();

		if (!accessToken) {
			return {
				success: false,
				error: 'Not authenticated',
			};
		}

		const result = await fetcherFn('admin/semesters', {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});

		// Debug the raw API response to check academic_year field
		console.log('Raw API response for semesters:', JSON.stringify(result, null, 2));

		return {
			success: true,
			data: result,
		};
	} catch (error) {
		console.error('Server Action: Error fetching semesters:', error);
		return {
			success: false,
			error: 'Failed to fetch semesters',
		};
	}
}

/**
 * Server action to fetch all users
 * @param accessToken User's access token for authorization
 */
export async function getUsers(accessToken: string): Promise<ServerActionResponse<User[]>> {
	console.log('Server Action: Fetching all users');

	try {
		const result = await fetcherFn('admin/users', {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});

		console.log(`Server Action: Successfully fetched ${result?.length || 0} users`);
		// Return data directly instead of using a function
		return {
			success: true,
			data: result,
		};
	} catch (error) {
		console.error('Server Action: Error fetching users:', error);
		return {
			success: false,
			error: 'Failed to fetch users',
		};
	}
}

/**
 * Server action to fetch faculty users
 * @param accessToken User's access token for authorization
 */
export async function getFacultyUsers(accessToken: string): Promise<ServerActionResponse<User[]>> {
	try {
		const result = await fetcherFn('admin/users-faculty', {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});
		return {
			success: true,
			data: result,
		};
	} catch (error) {
		console.error('Server Action: Error fetching faculty users:', error);
		return {
			success: false,
			error: 'Failed to fetch faculty users',
		};
	}
}

/**
 * Server action to fetch student users
 * @param accessToken User's access token for authorization
 */
export async function getStudentUsers(accessToken: string): Promise<ServerActionResponse<User[]>> {
	try {
		const result = await fetcherFn('admin/users-student', {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});
		return {
			success: true,
			data: result,
		};
	} catch (error) {
		console.error('Server Action: Error fetching student users:', error);
		return {
			success: false,
			error: 'Failed to fetch student users',
		};
	}
}

/**
 * Server action to fetch a specific user
 * @param userId User ID to fetch
 * @param accessToken User's access token for authorization
 */
export async function getUser(
	userId: string,
	accessToken: string
): Promise<ServerActionResponse<User>> {
	try {
		const result = await fetcherFn(`admin/users/${userId}`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});
		return {
			success: true,
			data: result,
		};
	} catch (error) {
		console.error(`Server Action: Error fetching user ${userId}:`, error);
		return {
			success: false,
			error: 'Failed to fetch user',
		};
	}
}

/**
 * Server action to delete a user by ID
 * @param userId The ID of the user to delete
 * @param accessToken User's access token for authorization
 */
export async function deleteUser(
	userId: number,
	accessToken: string
): Promise<ServerActionResponse<null>> {
	console.log('Server Action: Deleting user', userId);

	try {
		const result = await fetcherFn(`admin/users/${userId}`, {
			method: 'DELETE',
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json',
			},
		});

		console.log('Server Action: User deleted successfully');
		// Return in a format that matches the ServerActionSuccess type
		return {
			success: true,
			data: result,
		};
	} catch (error) {
		console.error('Server Action: Error deleting user:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to delete user',
		};
	}
}

/**
 * Server action to create a new user
 */
export async function createUser(userData: {
	email: string;
	name: string;
	role: string;
	studentID?: string;
	semesterID?: number;
	isCoordinator?: boolean;
}): Promise<ServerActionResponse<User>> {
	try {
		console.log('Creating user with data:', JSON.stringify(userData));
		const accessToken = await getAccessToken();

		if (!accessToken) {
			return {
				success: false,
				error: 'Not authenticated',
			};
		}

		// Convert the client-side data structure to match the API expectations
		const requestData: Record<string, unknown> = {
			email: userData.email,
			name: userData.name,
			role: userData.role,
		};

		// Add role-specific fields based on role
		console.log(`Processing role-specific fields for role: "${userData.role}"`);

		if (userData.role === 'student') {
			// For students, always pass studentID if available
			if (userData.studentID) {
				requestData.studentID = userData.studentID;
			}
			// Pass semesterID directly to match backend's expected format
			requestData.semesterID = userData.semesterID ? userData.semesterID : null;
			console.log('Added student-specific fields:', JSON.stringify(requestData));
		} else if (userData.role === 'faculty') {
			// For faculty members, set is_coordinator and explicitly set semesterID to null to avoid backend validation
			requestData.is_coordinator = Boolean(userData.isCoordinator);
			requestData.semesterID = null;
			console.log('Added faculty-specific fields:', JSON.stringify(requestData));
		} else {
			console.log(`Using default fields for role: ${userData.role}`);
		}

		const apiUrl = process.env.BACKEND_API_URL;
		if (!apiUrl) {
			throw new Error('Backend API URL is not defined');
		}

		console.log('Final request data:', JSON.stringify(requestData));

		const response = await fetch(`${apiUrl}/api/admin/users`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
			body: JSON.stringify(requestData),
		});

		const responseData = await response.json();
		console.log('Response from server:', JSON.stringify(responseData));

		if (!response.ok) {
			throw new Error(
				responseData.details ||
					responseData.message ||
					'Unknown error occurred during user creation'
			);
		}

		return {
			success: true,
			data: responseData,
		};
	} catch (error) {
		console.error('Server Action: Error creating user:', error);
		const errorMessage = error instanceof Error ? error.message : 'Failed to create user';
		return {
			success: false,
			error: errorMessage,
		};
	}
}

/**
 * Server action to create a new faculty user
 * This separate function ensures we don't trigger the semester validation for faculty users
 */
export async function createFacultyUser(userData: {
	email: string;
	name: string;
	isCoordinator?: boolean;
}): Promise<ServerActionResponse<User>> {
	try {
		console.log('Creating faculty user with data:', JSON.stringify(userData));
		const accessToken = await getAccessToken();

		if (!accessToken) {
			return {
				success: false,
				error: 'Not authenticated',
			};
		}

		// Convert the client-side data structure to match the API expectations
		const requestData: Record<string, unknown> = {
			email: userData.email,
			name: userData.name,
			role: 'faculty',
			is_coordinator: Boolean(userData.isCoordinator),
			// Explicitly setting semesterID to null for faculty
			semesterID: null,
		};

		console.log('Faculty request data:', JSON.stringify(requestData));

		const apiUrl = process.env.BACKEND_API_URL;
		if (!apiUrl) {
			throw new Error('Backend API URL is not defined');
		}

		const response = await fetch(`${apiUrl}/api/admin/users`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
			body: JSON.stringify(requestData),
		});

		const responseData = await response.json();
		console.log('Response from server:', JSON.stringify(responseData));

		if (!response.ok) {
			throw new Error(
				responseData.details ||
					responseData.message ||
					'Unknown error occurred during faculty user creation'
			);
		}

		return {
			success: true,
			data: responseData,
		};
	} catch (error) {
		console.error('Server Action: Error creating faculty user:', error);
		const errorMessage =
			error instanceof Error ? error.message : 'Failed to create faculty user';
		return {
			success: false,
			error: errorMessage,
		};
	}
}

/**
 * Server action to create a new student user with active semester handling
 */
export async function createStudentUser(
	userData: StudentUserData
): Promise<ServerActionResponse<null>> {
	console.log('Creating student user with data:', JSON.stringify(userData));

	// Validate required fields
	if (!userData.email || !userData.name || !userData.studentID) {
		console.error('Missing required fields for student user creation');
		return {
			success: false,
			error: 'Missing required student fields: email, name, and studentID are all required',
		};
	}

	// Try to get active semester if semesterID is not provided
	if (!userData.semesterID) {
		console.log('No semester ID provided, trying to find active semester...');
		try {
			const semestersResponse = await getSemesters();
			if (semestersResponse.success && semestersResponse.data) {
				const activeSemester = semestersResponse.data.find(
					(sem: Semester) => sem.is_active
				);
				if (activeSemester) {
					console.log(
						`Found active semester: ${activeSemester.name} (ID: ${activeSemester.id})`
					);
					userData.semesterID = activeSemester.id;
				} else {
					console.log('No active semester found');
					return {
						success: false,
						error: 'No active semester found for student enrollment',
					};
				}
			}
		} catch (error) {
			console.error('Error getting active semester:', error);
		}
	}

	if (!userData.semesterID) {
		return {
			success: false,
			error: 'No semester ID provided and no active semester found',
		};
	}

	// Build the request with the correct field names for the backend
	const requestData = {
		email: userData.email,
		name: userData.name,
		role: 'student',
		studentID: userData.studentID,
		semesterID: userData.semesterID,
	};

	console.log('Final request data for student user:', JSON.stringify(requestData));

	const apiUrl = process.env.BACKEND_API_URL;
	if (!apiUrl) {
		throw new Error('Backend API URL is not defined');
	}

	// Log URL for debugging
	console.log(`Sending POST request to: ${apiUrl}/api/admin/users`);

	const response = await fetch(`${apiUrl}/api/admin/users`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${await getAccessToken()}`,
		},
		body: JSON.stringify(requestData),
	});

	const responseData = await response.json();
	console.log('Response from server:', JSON.stringify(responseData));

	if (!response.ok) {
		throw new Error(
			responseData.details ||
				responseData.message ||
				'Unknown error occurred during student user creation'
		);
	}

	return {
		success: true,
		data: null,
	};
}

'use server';

import { fetcherFn } from '@/utils/functions';

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

/**
 * Server action to fetch all semesters
 * @param accessToken User's access token for authorization
 */
export async function getSemesters(accessToken: string): Promise<ServerActionResponse<Semester[]>> {
	try {
		const result = await fetcherFn('admin/semesters', null, {
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
/**
 * Server action to fetch all users
 * @param accessToken User's access token for authorization
 */
export async function getUsers(accessToken: string): Promise<ServerActionResponse<User[]>> {
	console.log('Server Action: Fetching all users');

	try {
		const result = await fetcherFn('admin/users', null, {
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
		const result = await fetcherFn('admin/users-faculty', null, {
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
		const result = await fetcherFn('admin/users-student', null, {
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
		const result = await fetcherFn(`admin/users/${userId}`, null, {
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
): Promise<ServerActionResponse<unknown>> {
	console.log('Server Action: Deleting user', userId);

	try {
		const result = await fetcherFn(`admin/users/${userId}`, null, {
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

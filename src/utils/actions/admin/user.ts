'use server';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Define types for User data
export interface User {
	id: number;
	user_id: number;
	email: string;
	name: string;
	is_course_coordinator: boolean;
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
 * Utility function to get the current session from the client component
 * @returns The Supabase session
 */
export async function getSessionFromClient() {
	const supabase = createClientComponentClient();
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		throw new Error('No session found');
	}

	return session;
}

/**
 * Fetch faculty users
 * This function handles session management internally
 */
export async function fetchFacultyUsers(): Promise<User[]> {
	// Get session from client
	const session = await getSessionFromClient();

	const response = await fetch(`${process.env.BACKEND_API_URL}/api/admin/users-faculty`, {
		headers: {
			Authorization: `Bearer ${session.access_token}`,
			'Content-Type': 'application/json',
		},
	});

	if (!response.ok) {
		throw new Error('Failed to fetch faculty users');
	}

	const data = await response.json();
	return data.map((user: User) => ({
		id: user.id,
		user_id: user.user_id,
		email: user.email,
		name: user.name,
		is_course_coordinator: Boolean(user.is_course_coordinator),
	}));
}

/**
 * Delete a user
 * This function handles session management internally
 * @param userId The ID of the user to delete
 */
export async function deleteUser(userId: number): Promise<void> {
	// Get session from client
	const session = await getSessionFromClient();

	const response = await fetch(`${process.env.BACKEND_API_URL}/api/admin/users/${userId}`, {
		method: 'DELETE',
		headers: {
			Authorization: `Bearer ${session.access_token}`,
			'Content-Type': 'application/json',
		},
	});

	if (!response.ok) {
		throw new Error('Failed to delete user');
	}
}

/**
 * Bulk upload students from a file
 * This function handles session management internally
 * @param file The file containing student data
 * @param semesterId The ID of the semester for which students are being uploaded
 * @returns The upload result containing success and failure information
 */
export interface BulkUploadResult {
	success: Array<{ email: string; name: string; matricNo: string }>;
	failed: Array<{ email: string; error: string }>;
}

export async function bulkUploadStudents(
	file: File,
	semesterId: string
): Promise<ServerActionResponse<BulkUploadResult>> {
	try {
		// Get session from client
		const session = await getSessionFromClient();

		// Prepare form data
		const formData = new FormData();
		formData.append('file', file);

		// Construct URL with query parameter
		const url = new URL(`${process.env.BACKEND_API_URL}/api/admin/users/bulk-upload-students`);
		url.searchParams.append('semester_id', semesterId);

		// Make request
		const response = await fetch(url.toString(), {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${session.access_token}`,
			},
			body: formData,
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			return {
				success: false,
				error: errorData.message || `Upload failed: ${response.statusText}`,
			};
		}

		const result = await response.json();
		return {
			success: true,
			data: result,
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred during upload',
		};
	}
}

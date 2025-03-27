'use server';

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

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
 * Utility function to get the current session from cookies in server actions
 * @returns The Supabase session
 */
export async function getSessionFromClient() {
	const cookieStore = cookies();
	const accessToken = cookieStore.get('session-token')?.value;

	if (!accessToken) {
		console.error('No session token found in cookies');
		throw new Error('No session found');
	}

	// Verify the token is valid by creating a client and getting the user
	const supabase = createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			global: {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			},
		}
	);

	// Get user data to verify token
	const { data, error } = await supabase.auth.getUser();

	if (error || !data.user) {
		console.error('Invalid session token:', error);
		throw new Error('No session found');
	}

	// Create a session-like object to maintain compatibility
	return {
		access_token: accessToken,
		user: data.user,
	};
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
 * Fetch student users with their semester information
 * This function handles session management internally
 * @returns Array of student users with semester information
 */
interface StudentData {
	student_id: number;
	email: string;
	name: string;
	semester_id: number;
	academic_year: string;
	semester_name: string;
}

interface Student {
	id: number;
	user_id: number;
	email: string;
	name: string;
	role: string;
	is_course_coordinator: boolean;
	semester: {
		id: number;
		academicYear: number;
		name: string;
	};
}

export async function fetchStudentUsers(): Promise<Student[]> {
	// Get session from client
	const session = await getSessionFromClient();

	const response = await fetch(`${process.env.BACKEND_API_URL}/api/admin/users-student`, {
		headers: {
			Authorization: `Bearer ${session.access_token}`,
			'Content-Type': 'application/json',
		},
	});

	if (!response.ok) {
		console.error('Error fetching student users:', response.status, response.statusText);
		throw new Error('Failed to fetch student users');
	}

	const data = await response.json();
	console.log('Fetched student users:', data);
	return data.map((user: StudentData) => ({
		id: user.student_id,
		user_id: user.student_id,
		email: user.email,
		name: user.name,
		role: 'student',
		is_course_coordinator: false,
		semester: {
			id: user.semester_id,
			academicYear: Number(user.academic_year),
			name: user.semester_name,
		},
	}));
}

/**
 * Bulk upload students from a file
 * This function handles session management internally
 * @param fileData The base64-encoded file data
 * @param fileName The original file name (to determine file type)
 * @param semesterId The ID of the semester for which students are being uploaded
 * @returns The upload result containing success and failure information
 */
export interface BulkUploadResult {
	success: Array<{ email: string; name: string; matricNo: string }>;
	failed: Array<{ email: string; error: string }>;
}

export async function bulkUploadStudents(
	fileData: string,
	fileName: string,
	semesterId: string
): Promise<ServerActionResponse<BulkUploadResult>> {
	try {
		// Get session from client
		const session = await getSessionFromClient();

		// Prepare form data
		const formData = new FormData();

		// Convert base64 string back to a file
		const base64Data = fileData.split(',')[1]; // Remove data URL prefix if present
		const binaryString = atob(base64Data);
		const bytes = new Uint8Array(binaryString.length);
		for (let i = 0; i < binaryString.length; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		}

		// Determine content type based on file extension
		let contentType = 'text/csv';
		if (fileName.endsWith('.xlsx')) {
			contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
		} else if (fileName.endsWith('.xls')) {
			contentType = 'application/vnd.ms-excel';
		}

		// Create a blob and then a file from the binary data
		const blob = new Blob([bytes], { type: contentType });
		const file = new File([blob], fileName, { type: contentType });
		formData.append('file', file);
		// Remove semester_id from form data since it should be in the URL

		// Log payload details
		console.log('Payload details:');
		console.log('- File name:', fileName);
		console.log('- File type:', contentType);
		console.log('- File size:', blob.size, 'bytes');
		console.log('- Semester ID:', semesterId);

		// Log FormData entries for debugging (compatible with older TS targets)
		console.log('FormData entries:');
		// Use Array.from to convert the iterator to an array for compatibility
		Array.from(formData.entries()).forEach((pair) => {
			const [key, value] = pair;
			if (key === 'file' && value instanceof File) {
				console.log('- file:', value.name, value.type, value.size, 'bytes');
			} else {
				console.log(`- ${key}:`, value);
			}
		});

		// Construct URL with semester_id as a query parameter
		const url = new URL(`${process.env.BACKEND_API_URL}/api/admin/users/bulk-upload-student`);
		url.searchParams.append('semester_id', semesterId);

		console.log('Upload URL:', url.toString());

		// Make request
		const response = await fetch(url.toString(), {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${session.access_token}`,
			},
			body: formData,
		});

		if (!response.ok) {
			const errorText = await response.text();
			let errorMessage = `Upload failed: ${response.status} ${response.statusText}`;

			try {
				// Try to parse as JSON if possible
				const errorData = JSON.parse(errorText);
				errorMessage = errorData.message || errorMessage;
				console.error('Upload error details:', errorData);
			} catch (e) {
				// If not JSON, use the raw text
				console.error('Upload error response:', errorText);
			}

			return {
				success: false,
				error: errorMessage,
			};
		}

		const result = await response.json();
		return {
			success: true,
			data: result,
		};
	} catch (error) {
		console.error('Bulk upload error:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred during upload',
		};
	}
}

/**
 * Bulk upload faculty users
 * @param fileData Base64 encoded file data
 * @param fileName Filename of the uploaded file
 * @returns Result of the upload operation
 */
export async function bulkUploadFaculty(
	fileData: string,
	fileName: string
): Promise<ServerActionResponse<BulkUploadResult>> {
	try {
		// Convert base64 string back to a file
		const base64Data = fileData.split(',')[1]; // Remove data URL prefix if present
		const binaryString = atob(base64Data);
		const bytes = new Uint8Array(binaryString.length);
		for (let i = 0; i < binaryString.length; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		}

		// Determine content type based on file extension
		let contentType = 'text/csv';
		if (fileName.endsWith('.xlsx')) {
			contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
		} else if (fileName.endsWith('.xls')) {
			contentType = 'application/vnd.ms-excel';
		}

		// Create a blob and then a file from the binary data
		const blob = new Blob([bytes], { type: contentType });
		const file = new File([blob], fileName, { type: contentType });

		// Prepare form data
		const formData = new FormData();
		formData.append('file', file);

		// Log payload details
		console.log('Faculty upload payload details:');
		console.log('- File name:', fileName);
		console.log('- File type:', contentType);
		console.log('- File size:', blob.size, 'bytes');

		// Log FormData entries for debugging
		console.log('FormData entries:');
		Array.from(formData.entries()).forEach((pair) => {
			const [key, value] = pair;
			if (key === 'file' && value instanceof File) {
				console.log('- file:', value.name, value.type, value.size, 'bytes');
			} else {
				console.log(`- ${key}:`, value);
			}
		});

		// When using fetcherFn, we need to handle FormData differently
		// We'll access the fetch function it uses internally and create our own setup
		const apiUrl = process.env.BACKEND_API_URL;
		if (!apiUrl) {
			throw new Error('Backend API URL is not defined');
		}

		// Get the session token from cookies - this replicates what fetcherFn does
		const cookieStore = cookies();
		const sessionToken = cookieStore.get('session-token')?.value;

		if (!sessionToken) {
			throw new Error('No active session found');
		}

		// Make the request with fetch but mimicking fetcherFn's authentication pattern
		const response = await fetch(`${apiUrl}/api/admin/users/bulk-upload`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${sessionToken}`,
				// Note: Do NOT set Content-Type here - the browser sets it correctly with the boundary
			},
			body: formData,
		});

		// Process the response
		if (!response.ok) {
			const errorText = await response.text();
			let errorMessage = `Upload failed: ${response.status} ${response.statusText}`;

			try {
				// Try to parse as JSON if possible
				const errorData = JSON.parse(errorText);
				errorMessage = errorData.message || errorMessage;
				console.error('Upload error details:', errorData);
			} catch (e) {
				// If not JSON, use the raw text
				console.error('Upload error response:', errorText);
			}

			return {
				success: false,
				error: errorMessage,
			};
		}

		// Parse the successful response and transform it to camelCase like fetcherFn would
		const result = await response.json();
		return {
			success: true,
			data: result,
		};
	} catch (error) {
		console.error('Faculty bulk upload error:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred during upload',
		};
	}
}

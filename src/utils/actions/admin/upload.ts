/* eslint-disable prettier/prettier */
'use server';

/* eslint-disable import/extensions */
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import { fetcherFn } from '@/utils/functions';

/* eslint-disable prettier/prettier */

/* eslint-disable prettier/prettier */

/**
 * Server action to handle bulk upload of faculty users
 * @param formData Form data containing the file and semester_id
 * @param accessToken User's access token for authorization
 */
export async function bulkUploadFaculty(formData: FormData, accessToken: string) {
	return fetcherFn('admin/users/bulk-upload-faculty', formData, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});
}

/**
 * Server action to handle bulk upload of student users
 * @param formData Form data containing the file
 * @param semesterId The semester ID to associate with the uploaded students
 */
export async function bulkUploadStudent(formData: FormData, semesterId: string) {
	const supabase = createClientComponentClient();
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		throw new Error('No active session found');
	}

	// Construct the URL with the semester_id parameter
	const url = `admin/users/bulk-upload-student?semester_id=${encodeURIComponent(semesterId)}`;

	return fetcherFn(url, formData, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${session.access_token}`,
		},
	});
}

/**
 * Server action to handle general bulk upload
 * @param formData Form data containing the file and other required parameters
 */
export async function bulkUpload(formData: FormData) {
	const supabase = createClientComponentClient();
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		throw new Error('No active session found');
	}

	return fetcherFn('admin/users/bulk-upload', formData, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${session.access_token}`,
		},
	});
}

/**
 * Server action to fetch all semesters
 * @returns Array of semester objects
 */
export async function fetchSemesters() {
	const supabase = createClientComponentClient();
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		throw new Error('No active session found');
	}

	const apiUrl = process.env.BACKEND_API_URL;
	if (!apiUrl) {
		throw new Error('Backend API URL is not defined');
	}

	const response = await fetch(`${apiUrl}/api/admin/semesters`, {
		headers: {
			Authorization: `Bearer ${session.access_token}`,
		},
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch semesters: ${response.statusText}`);
	}

	return response.json();
}

/**
 * Server action to fetch all student users
 * @returns Array of student user objects
 */
export async function fetchStudentUsers() {
	const supabase = createClientComponentClient();
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		throw new Error('No active session found');
	}

	const apiUrl = process.env.BACKEND_API_URL;
	if (!apiUrl) {
		throw new Error('Backend API URL is not defined');
	}

	const response = await fetch(`${apiUrl}/api/admin/users-student`, {
		headers: {
			Authorization: `Bearer ${session.access_token}`,
			'Content-Type': 'application/json',
		},
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch student users: ${response.statusText}`);
	}

	return response.json();
}

/**
 * Server action to create a new user
 * @param userData User data to create the user with
 * @returns The response data
 */
export async function createUser(userData: {
	email: string;
	name: string;
	role: string;
	studentId?: string;
	semesterId?: number;
	isCoordinator?: boolean;
}) {
	const supabase = createClientComponentClient();
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		throw new Error('No active session found');
	}

	const apiUrl = process.env.BACKEND_API_URL;
	if (!apiUrl) {
		throw new Error('Backend API URL is not defined');
	}

	const response = await fetch(`${apiUrl}/api/admin/users`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${session.access_token}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(userData),
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.details || data.message || 'Failed to create user');
	}

	return data;
}

/**
 * Server action to delete a user
 * @param userId ID of the user to delete
 * @returns The response data
 */
export async function deleteUser(userId: string) {
	const supabase = createClientComponentClient();
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		throw new Error('No active session found');
	}

	const apiUrl = process.env.BACKEND_API_URL;
	if (!apiUrl) {
		throw new Error('Backend API URL is not defined');
	}

	const response = await fetch(`${apiUrl}/api/admin/users/${userId}`, {
		method: 'DELETE',
		headers: {
			Authorization: `Bearer ${session.access_token}`,
			'Content-Type': 'application/json',
		},
	});

	if (!response.ok) {
		throw new Error(`Failed to delete user: ${response.statusText}`);
	}

	return response.json();
}

/**
 * Server action to handle file upload with internal session management
 * @param formData Form data containing the file to upload
 * @returns The response data
 */
export async function uploadFile(formData: FormData) {
	const supabase = createClientComponentClient();
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		throw new Error('No active session found');
	}

	return fetcherFn('admin/upload', formData, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${session.access_token}`,
		},
	});
}

/**
 * Server action to handle file upload
 * @param formData Form data containing the file to upload
 */
export async function fileUpload(formData: FormData) {
	return uploadFile(formData);
}

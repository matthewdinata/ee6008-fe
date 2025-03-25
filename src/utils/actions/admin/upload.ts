'use server';

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

import { fetcherFn } from '@/utils/functions';

/* eslint-disable prettier/prettier */

/**
 * Gets a session from cookies for server actions
 * @returns The Supabase session
 */
export async function getServerActionSession() {
	const cookieStore = cookies();
	const accessToken = cookieStore.get('session-token')?.value;

	if (!accessToken) {
		console.error('No session token found in cookies');
		throw new Error('No active session found');
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
		throw new Error('No active session found');
	}

	// Create a session-like object to maintain compatibility
	return {
		accessToken: accessToken,
		user: data.user,
	};
}

/**
 * Server action to handle bulk upload of faculty users
 * @param formData Form data containing the file and semester_id
 * @param accessToken User's access token for authorization
 */
export async function bulkUploadFaculty(formData: FormData, accessToken: string) {
	return fetcherFn(
		'admin/users/bulk-upload-faculty',
		{
			method: 'POST',
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		},
		formData
	);
}

/**
 * Server action to handle bulk upload of student users
 * @param formData Form data containing the file
 * @param semesterId The semester ID to associate with the uploaded students
 */
export async function bulkUploadStudent(formData: FormData, semesterId: string) {
	const session = await getServerActionSession();

	// Construct the URL with the semester_id parameter
	const url = `admin/users/bulk-upload-student?semester_id=${encodeURIComponent(semesterId)}`;

	return fetcherFn(
		url,
		{
			method: 'POST',
			headers: {
				Authorization: `Bearer ${session.accessToken}`,
			},
		},
		formData
	);
}

/**
 * Server action to handle general bulk upload
 * @param formData Form data containing the file and other required parameters
 */
export async function bulkUpload(formData: FormData) {
	const session = await getServerActionSession();

	return fetcherFn(
		'admin/users/bulk-upload',
		{
			method: 'POST',
			headers: {
				Authorization: `Bearer ${session.accessToken}`,
			},
		},
		formData
	);
}

/**
 * Server action to handle faculty bulk upload
 * @param formData Form data containing the faculty CSV file
 */
export async function facultyBulkUpload(formData: FormData) {
	const session = await getServerActionSession();

	return fetcherFn(
		'admin/users/bulk-upload',
		{
			method: 'POST',
			headers: {
				Authorization: `Bearer ${session.accessToken}`,
			},
		},
		formData
	);
}

/**
 * Server action to fetch all semesters
 * @returns Array of semester objects
 */
export async function fetchSemesters() {
	const session = await getServerActionSession();

	const apiUrl = process.env.BACKEND_API_URL;
	if (!apiUrl) {
		throw new Error('Backend API URL is not defined');
	}

	const response = await fetch(`${apiUrl}/api/admin/semesters`, {
		headers: {
			Authorization: `Bearer ${session.accessToken}`,
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
	const session = await getServerActionSession();

	const apiUrl = process.env.BACKEND_API_URL;
	if (!apiUrl) {
		throw new Error('Backend API URL is not defined');
	}

	const response = await fetch(`${apiUrl}/api/admin/users-student`, {
		headers: {
			Authorization: `Bearer ${session.accessToken}`,
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
	const session = await getServerActionSession();

	const apiUrl = process.env.BACKEND_API_URL;
	if (!apiUrl) {
		throw new Error('Backend API URL is not defined');
	}

	const response = await fetch(`${apiUrl}/api/admin/users`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${session.accessToken}`,
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
	const session = await getServerActionSession();

	const apiUrl = process.env.BACKEND_API_URL;
	if (!apiUrl) {
		throw new Error('Backend API URL is not defined');
	}

	const response = await fetch(`${apiUrl}/api/admin/users/${userId}`, {
		method: 'DELETE',
		headers: {
			Authorization: `Bearer ${session.accessToken}`,
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
	const session = await getServerActionSession();

	return fetcherFn(
		'admin/upload',
		{
			method: 'POST',
			headers: {
				Authorization: `Bearer ${session.accessToken}`,
			},
		},
		formData
	);
}

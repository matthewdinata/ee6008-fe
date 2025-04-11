'use server';

import { cookies } from 'next/headers';

import { Project } from '@/utils/actions/admin/types';

import { fetcherFn } from '../../functions';

/**
 * Fetches faculty projects for a given semester and email.
 *
 * @param semesterId The ID of the semester.
 * @param email The email of the faculty member.
 * @returns A promise that resolves to an array of projects.
 */
export async function getFacultyProjectsBySemester(
	semesterId: number,
	email: string
): Promise<Project[]> {
	try {
		console.log(`Fetching faculty projects for semester ${semesterId} and email ${email}`);

		// Replace URL encoding of @ with actual @ character since the API expects it
		const encodedEmail = encodeURIComponent(email).replace(/%40/g, '@');

		const result = await fetcherFn<Project[]>(
			`faculty/semesters/${semesterId}/professors/${encodedEmail}/projects`,
			{
				method: 'GET',
			}
		);

		console.log('Faculty projects API response:', result);
		return result ?? [];
	} catch (error) {
		console.error('Error in getFacultyProjectsBySemester:', error);
		return [];
	}
}

export async function getAccessToken(): Promise<string | null> {
	const cookieStore = cookies();
	return cookieStore.get('session-token')?.value || null;
}

/**
 * Client-side function to fetch faculty projects.
 * This version works with React Query in client components.
 *
 * @param semesterId The ID of the semester.
 * @param email The email of the faculty member.
 * @returns A promise that resolves to an array of projects.
 */
export async function getFacultyProjectsClient(
	semesterId: number,
	email: string
): Promise<Project[]> {
	// Try both possible API URL environment variables
	const apiUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;
	if (!apiUrl) {
		console.error('Backend API URL is not defined in environment variables');
		// Fallback to a hardcoded URL for development

		return [];
	}

	// Get token from localStorage/sessionStorage or cookie
	const accessToken = await getAccessToken();

	if (!accessToken) {
		console.warn('No access token found for API request');
	}

	// Ensure email is not empty
	if (!email) {
		console.error('No email provided for faculty projects query');
		return [];
	}

	// Decode the email if it contains %40 (from cookies/URL encoding)
	const decodedEmail = email.includes('%40') ? decodeURIComponent(email) : email;
	console.log(`Original email: ${email}, Decoded email: ${decodedEmail}`);

	// Ensure apiUrl doesn't end with a slash
	const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;

	// Construct the URL with the provided semester and decoded email
	const url = `${baseUrl}/api/faculty/semesters/${semesterId}/professors/${decodedEmail}/projects`;

	console.log(`Fetching faculty projects from: ${url}`);

	try {
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
			},
		});

		if (!response.ok) {
			console.error(`API request failed with status ${response.status}`);

			// For 500 errors, try to get more information
			if (response.status === 500) {
				try {
					const errorText = await response.text();
					console.error(`Server error details: ${errorText}`);
				} catch (e) {
					console.error('Failed to parse server error details');
				}
			}

			throw new Error(`API request failed with status ${response.status}`);
		}

		const data = await response.json();
		console.log('[Client] Faculty projects API response:', data);
		return data ?? [];
	} catch (error) {
		console.error('Error fetching faculty projects:', error);
		return [];
	}
}

/**
 * Fetches all projects for a given semester.
 *
 * @param semesterId The ID of the semester.
 * @returns A promise that resolves to an array of projects.
 */
export async function getAllProjectsBySemester(semesterId: number): Promise<Project[]> {
	try {
		console.log(`Fetching all projects for semester ${semesterId}`);

		const result = await fetcherFn<Project[]>(`admin/semesters/${semesterId}/projects`, {
			method: 'GET',
		});

		return result ?? [];
	} catch (error) {
		console.error('Error in getAllProjectsBySemester:', error);
		return [];
	}
}

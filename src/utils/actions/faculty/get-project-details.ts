'use server';

import { cookies } from 'next/headers';

export interface ProjectDetails {
	id: number;
	title: string;
	description: string;
	allocation_id: number;
	allocation_name: string;
	allocation_timestamp: string;
	semester: string;
	academic_year: number;
	professor: Professor;
	moderator?: Moderator; // Added moderator field
	team_members: TeamMember[];
}

/**
 * Interface for team member in project details
 */
export interface TeamMember {
	student_id: number;
	name: string;
	email: string;
	matriculation_number: string;
	priority: number;
}

/**
 * Interface for professor in project details
 */
export interface Professor {
	id: number;
	name: string;
	email: string;
}

/**
 * Interface for moderator in project details
 */
export interface Moderator {
	id: number;
	name: string;
	email: string;
}

/**
 * Helper function to get access token from cookies
 */
export async function getAccessToken(): Promise<string | null> {
	const cookieStore = cookies();
	return cookieStore.get('session-token')?.value || null;
}

/**
 * Client-side function to get project details by ID
 */
export async function getProjectDetailsClient(projectId: number): Promise<ProjectDetails | null> {
	if (!projectId) {
		console.error('No project ID provided for project details query');
		return null;
	}

	// Get token from localStorage/sessionStorage or cookie
	const accessToken = await getAccessToken();

	if (!accessToken) {
		console.warn('No access token found for API request');
	}

	// Get API URL from environment
	const apiUrl = process.env.BACKEND_API_URL || '';
	if (!apiUrl) {
		console.error('No API URL found in environment variables');
		return null;
	}

	// Ensure apiUrl doesn't end with a slash
	const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;

	// Construct the URL with the provided project ID
	const url = `${baseUrl}/api/faculty/projects/${projectId}`;

	console.log(`Fetching project details from: ${url}`);

	try {
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: accessToken ? `Bearer ${accessToken}` : '',
			},
			next: { tags: ['project-details', `project-${projectId}`] },
		});

		if (!response.ok) {
			throw new Error(`API error: ${response.status} ${response.statusText}`);
		}

		const data = await response.json();
		console.log('Project details response:', data);

		return data;
	} catch (error) {
		console.error('Error fetching project details:', error);
		return null;
	}
}

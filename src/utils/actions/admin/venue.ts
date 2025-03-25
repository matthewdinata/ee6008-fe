'use server';

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

import { ServerActionResponse } from '@/utils/actions/admin/fetch';
import { fetcherFn } from '@/utils/functions';

// Define Venue interface
export interface Venue {
	id: number;
	name: string;
	location: string;
	semesterId: number;
	created_at: string;
	updated_at: string;
}

export interface CreateVenueData {
	name: string;
	location: string;
	semesterId: number;
}

export interface UpdateVenueData {
	name?: string;
	location?: string;
	semesterId?: number;
}

/**
 * Gets a session from cookies for server actions
 * @returns The Supabase session
 */
async function getServerActionSession() {
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
		access_token: accessToken,
		user: data.user,
	};
}

export async function getAccessToken(): Promise<string | null> {
	const cookieStore = cookies();
	return cookieStore.get('session-token')?.value || null;
}

/**
 * Fetch all venues
 */
export async function getVenues(): Promise<ServerActionResponse<Venue[]>> {
	try {
		const session = await getServerActionSession();

		const response = await fetcherFn('admin/venues', {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${session.access_token}`,
			},
		});

		// If response is already a data array (not a Response object)
		if (Array.isArray(response)) {
			return {
				success: true,
				data: response,
			};
		}

		// Otherwise, treat it as a Response object
		if (!response.ok) {
			const error = await response.json();
			return {
				success: false,
				error: error.message || 'Failed to fetch venues',
			};
		}

		const data = await response.json();
		return {
			success: true,
			data: data,
		};
	} catch (error) {
		console.error('Error fetching venues:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'An unexpected error occurred',
		};
	}
}

/**
 * Fetch venues by semester ID
 */
export async function getVenuesBySemester(
	semesterId: number
): Promise<ServerActionResponse<Venue[]>> {
	try {
		const session = await getServerActionSession();

		const response = await fetcherFn(`admin/venues?semester_id=${semesterId}`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${session.access_token}`,
			},
		});

		if (!response.ok) {
			const error = await response.json();
			return {
				success: false,
				error: error.message || 'Failed to fetch venues',
			};
		}

		const data = await response.json();
		return {
			success: true,
			data: data,
		};
	} catch (error) {
		console.error('Error fetching venues by semester:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'An unexpected error occurred',
		};
	}
}

/**
 * Fetch a venue by ID
 */
export async function getVenue(venueId: number): Promise<ServerActionResponse<Venue>> {
	try {
		const session = await getServerActionSession();

		const response = await fetcherFn(`admin/venues/${venueId}`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${session.access_token}`,
			},
		});

		if (!response.ok) {
			const error = await response.json();
			return {
				success: false,
				error: error.message || 'Failed to fetch venue',
			};
		}

		const data = await response.json();
		return {
			success: true,
			data: data,
		};
	} catch (error) {
		console.error('Error fetching venue:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'An unexpected error occurred',
		};
	}
}

/**
 * Create a new venue
 */
export async function createVenue(
	venueData: CreateVenueData
): Promise<ServerActionResponse<Venue>> {
	try {
		// Validate required fields
		if (!venueData.name || !venueData.location || !venueData.semesterId) {
			return {
				success: false,
				error: 'Missing required fields: name, location, and semesterId are required',
			};
		}

		const session = await getServerActionSession();

		const response = await fetcherFn(
			'admin/venues',
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${session.access_token}`,
				},
			},
			venueData
		);

		// If response is already a JS object (which is likely the case)
		if (response && typeof response === 'object') {
			// Check for error indicators
			if (response.error || (response.message && !response.id)) {
				return {
					success: false,
					error: response.error || response.message || 'Failed to create venue',
				};
			}

			// Otherwise assume it's the venue data
			return {
				success: true,
				data: response,
			};
		}

		// Fallback for standard Response handling (probably won't be reached)
		if (!response.ok) {
			const error = await response.json();
			return {
				success: false,
				error: error.message || 'Failed to create venue',
			};
		}

		const data = await response.json();
		return {
			success: true,
			data: data,
		};
	} catch (error) {
		console.error('Error creating venue:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'An unexpected error occurred',
		};
	}
}

export async function updateVenue(
	venueId: number,
	venueData: UpdateVenueData
): Promise<ServerActionResponse<Venue>> {
	const session = await getServerActionSession();
	try {
		// Rebuild the function call from scratch
		const response = await fetcherFn(
			`admin/venues/${venueId}`,
			{
				method: 'PUT',
				headers: {
					Authorization: `Bearer ${session.access_token}`,
				},
			},
			venueData
		);

		// Check if response is already a data object (not a Response object)
		if (response && typeof response === 'object' && !response.ok) {
			return {
				success: true,
				data: response,
			};
		}

		// If it's a Response object (which it shouldn't be based on your logs)
		if (response.ok) {
			const data = await response.json();
			return {
				success: true,
				data,
			};
		}

		return {
			success: true,
			data: response,
		};
	} catch (error) {
		console.error('Error updating venue:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'An unexpected error occurred',
		};
	}
}

/**
 * Delete a venue by ID
 */
export async function deleteVenue(venueId: number): Promise<ServerActionResponse<null>> {
	try {
		const session = await getServerActionSession();

		const response = await fetcherFn(`admin/venues/${venueId}`, {
			method: 'DELETE',
			headers: {
				Authorization: `Bearer ${session.access_token}`,
			},
		});

		// If response is already a data object (not a Response object)
		if (response && typeof response === 'object') {
			// Check if it contains a success message
			if (response.message === 'Venue deleted successfully') {
				return {
					success: true,
					data: null,
				};
			} else if (response.error || response.message) {
				return {
					success: false,
					error: response.error || response.message || 'Failed to delete venue',
				};
			}
		}

		// Fallback for standard Response handling (probably won't be reached)
		if (!response.ok) {
			const error = await response.json();
			return {
				success: false,
				error: error.message || 'Failed to delete venue',
			};
		}

		return {
			success: true,
			data: null,
		};
	} catch (error) {
		console.error('Error deleting venue:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'An unexpected error occurred',
		};
	}
}

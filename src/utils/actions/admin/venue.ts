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
			data,
		};
	} catch (error) {
		console.error('Error in getVenues:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to fetch venues',
		};
	}
}

/**
 * Fetch venues by semester ID
 * @param semesterId The ID of the semester to fetch venues for
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

		// If response is already a data array or object (not a Response object)
		if (response && typeof response === 'object' && !('ok' in response)) {
			// If it's an array, return it directly
			if (Array.isArray(response)) {
				return {
					success: true,
					data: response,
				};
			}

			// If it's an object with data property, return the data
			if ('data' in response) {
				return {
					success: true,
					data: Array.isArray(response.data) ? response.data : [],
				};
			}

			// Otherwise, return the object itself (assuming it's the data)
			return {
				success: true,
				data: Array.isArray(response) ? response : [],
			};
		}

		// Otherwise, treat it as a Response object
		if (response && typeof response === 'object' && 'ok' in response) {
			if (!response.ok) {
				try {
					const error = await response.json();
					return {
						success: false,
						error: error.message || `Failed to fetch venues for semester ${semesterId}`,
					};
				} catch (jsonError) {
					return {
						success: false,
						error: `Failed to fetch venues for semester ${semesterId}`,
					};
				}
			}

			try {
				const data = await response.json();
				return {
					success: true,
					data: Array.isArray(data) ? data : [],
				};
			} catch (jsonError) {
				console.error('Error parsing JSON response:', jsonError);
				return {
					success: false,
					error: 'Failed to parse venue data',
				};
			}
		}

		// Fallback for unexpected response format
		return {
			success: false,
			error: `Unexpected response format for venues in semester ${semesterId}`,
		};
	} catch (error) {
		console.error(`Error in getVenuesBySemester for semester ${semesterId}:`, error);
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: `Failed to fetch venues for semester ${semesterId}`,
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

/**
 * Bulk upload venues from a CSV file
 * @param fileBase64 Base64 encoded file content
 * @param fileName Original file name
 * @param semesterId Semester ID to associate venues with
 * @returns Response with success and failure information
 */
export async function bulkUploadVenues(
	fileBase64: string,
	fileName: string,
	semesterId: string
): Promise<
	ServerActionResponse<{
		success: { name: string }[];
		failed: { name: string; error: string }[];
	}>
> {
	try {
		// Get session from client
		const accessToken = await getAccessToken();

		if (!accessToken) {
			throw new Error('No active session found');
		}

		// Prepare form data
		const formData = new FormData();

		// Convert base64 string back to a file
		const base64Data = fileBase64.split(',')[1]; // Remove data URL prefix if present
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

		// Construct URL with semester_id as a query parameter
		const url = new URL(`${process.env.BACKEND_API_URL}/api/admin/venues/bulk-upload`);
		url.searchParams.append('semester_id', semesterId);

		// Make request
		const response = await fetch(url.toString(), {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${accessToken}`,
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
		console.error('Error in bulkUploadVenues:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to upload venues',
		};
	}
}

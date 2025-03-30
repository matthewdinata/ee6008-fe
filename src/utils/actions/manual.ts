'use server';

import { fetcherFn } from '@/utils/functions';
import { Manual, ManualInput, ManualResponse } from '@/utils/types/manual';

/**
 * Fetch all manuals
 */
export async function fetchManuals(): Promise<Manual[]> {
	try {
		console.log('API Call:', 'GET', `${process.env.BACKEND_API_URL}/faculty/manuals`);
		return await fetcherFn<Manual[]>('faculty/manuals', {
			method: 'GET',
		});
	} catch (error) {
		console.error('Error fetching manuals:', error);
		return [];
	}
}

/**
 * Fetch a specific manual by ID
 * @param id Manual ID to fetch
 */
export async function fetchManualById(id: number): Promise<Manual | null> {
	try {
		console.log('API Call:', 'GET', `${process.env.BACKEND_API_URL}/faculty/manuals/${id}`);
		return await fetcherFn<Manual>(`faculty/manuals/${id}`, {
			method: 'GET',
		});
	} catch (error) {
		console.error(`Error fetching manual #${id}:`, error);
		return null;
	}
}

/**
 * Create a new manual
 * @param data Manual data to create
 */
export async function createManual(data: ManualInput): Promise<ManualResponse> {
	try {
		console.log('API Call:', 'POST', `${process.env.BACKEND_API_URL}/faculty/manuals`, data);
		return await fetcherFn<ManualResponse>(
			'faculty/manuals',
			{
				method: 'POST',
			},
			data
		);
	} catch (error) {
		console.error('Error creating manual:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
		};
	}
}

/**
 * Update an existing manual
 * @param id Manual ID to update
 * @param data Manual data to update
 */
export async function updateManual(id: number, data: ManualInput): Promise<ManualResponse> {
	try {
		console.log(
			'API Call:',
			'PUT',
			`${process.env.BACKEND_API_URL}/faculty/manuals/${id}`,
			data
		);
		return await fetcherFn<ManualResponse>(
			`faculty/manuals/${id}`,
			{
				method: 'PUT',
			},
			data
		);
	} catch (error) {
		console.error(`Error updating manual #${id}:`, error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
		};
	}
}

/**
 * Delete a manual
 * @param id Manual ID to delete
 */
export async function deleteManual(id: number): Promise<ManualResponse> {
	try {
		console.log('API Call:', 'DELETE', `${process.env.BACKEND_API_URL}/faculty/manuals/${id}`);
		return await fetcherFn<ManualResponse>(`faculty/manuals/${id}`, {
			method: 'DELETE',
		});
	} catch (error) {
		console.error(`Error deleting manual #${id}:`, error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
		};
	}
}

/**
 * Fetch manual categories
 */
export async function fetchCategories(): Promise<string[]> {
	try {
		console.log(
			'API Call:',
			'GET',
			`${process.env.BACKEND_API_URL}/faculty/manuals/categories`
		);
		return await fetcherFn<string[]>('faculty/manuals/categories', {
			method: 'GET',
		});
	} catch (error) {
		console.error('Error fetching manual categories:', error);
		return [];
	}
}

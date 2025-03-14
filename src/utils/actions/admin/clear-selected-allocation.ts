'use server';

import { revalidateTag } from 'next/cache';

import { Semester } from '@/types';

import { fetcherFn } from '../../functions';

export type ClearSelectedAllocationResponseData = {
	semester: Semester;
} | null;

export async function clearSelectedAllocation(
	semesterId: number
): Promise<ClearSelectedAllocationResponseData> {
	try {
		const response = await fetcherFn<ClearSelectedAllocationResponseData>(
			`admin/semesters/${semesterId}/allocation`,
			{
				method: 'PATCH',
				cache: 'no-store',
				next: {
					tags: ['clear-selected-allocation', semesterId.toString()],
				},
				headers: {
					'Cache-Control': 'no-cache, no-store, must-revalidate',
					Pragma: 'no-cache',
				},
			}
		);

		revalidateTag('selected-allocation');

		return response?.semester
			? {
					semester: response.semester,
				}
			: null;
	} catch (error) {
		console.error('Error in clearSelectedAllocation:', error);
		return null;
	}
}

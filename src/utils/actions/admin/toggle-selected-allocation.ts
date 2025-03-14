'use server';

import { revalidateTag } from 'next/cache';

import { Semester } from '@/types';

import { fetcherFn } from '../../functions';

type ToggleSelectedAllocationData = {
	semesterId: number;
	allocationId: number;
};

export type ToggleSelectedAllocationResponseData = {
	semester: Semester;
} | null;
export async function toggleSelectedAllocation(
	data: ToggleSelectedAllocationData
): Promise<ToggleSelectedAllocationResponseData> {
	try {
		const response = await fetcherFn<ToggleSelectedAllocationResponseData>(
			`admin/semesters/${data.semesterId}/allocation/${data.allocationId}`,
			{
				method: 'PATCH',
				cache: 'no-store',
				next: {
					tags: [
						'toggle-selected-allocation',
						data.semesterId.toString(),
						data.allocationId.toString(),
					],
				},
				headers: {
					'Cache-Control': 'no-cache, no-store, must-revalidate',
					Pragma: 'no-cache',
				},
			},
			data
		);

		revalidateTag('selected-allocation');

		return response?.semester
			? {
					semester: response.semester,
				}
			: null;
	} catch (error) {
		console.error('Error in toggleSelectedAllocation:', error);
		return null;
	}
}

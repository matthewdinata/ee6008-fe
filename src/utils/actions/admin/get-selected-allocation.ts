'use server';

import { AllocationData } from '@/types';

import { fetcherFn } from '../../functions';

export type GetSelectedAllocationResponseData = AllocationData | null;

export async function getSelectedAllocation(
	semesterId: number
): Promise<GetSelectedAllocationResponseData> {
	try {
		const result = await fetcherFn<GetSelectedAllocationResponseData>(
			`admin/semesters/${semesterId}/allocation`,
			{
				method: 'GET',
			},
			{
				next: { tags: ['selected-allocation'] },
			}
		);

		return result ?? null;
	} catch (error) {
		console.error('Error in getSelectedAllocation:', error);
		return null;
	}
}

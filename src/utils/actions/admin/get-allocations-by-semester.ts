'use server';

import { GeneratedAllocationData } from '@/app/admin/project/allocation/types';

import { fetcherFn } from '../../functions';

export type GetAllocationsBySemesterResponseData = Array<{
	allocationId: number;
	timestamp: string;
	name: string;
	data: GeneratedAllocationData;
}> | null;

export async function getAllocationsBySemester(
	semesterId: number
): Promise<GetAllocationsBySemesterResponseData> {
	try {
		const result = await fetcherFn<GetAllocationsBySemesterResponseData>(
			`admin/allocations?semester_id=${semesterId}`,
			{
				method: 'GET',
			},
			{
				next: { tags: ['allocations-by-semester'] },
			}
		);

		return result ?? [];
	} catch (error) {
		console.error('Error in getAllocationsBySemester:', error);
		return null;
	}
}

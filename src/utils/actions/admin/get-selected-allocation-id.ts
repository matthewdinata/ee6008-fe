'use server';

import { fetcherFn } from '../../functions';

export type GetSelectedAllocationIdResponseData = {
	semesterId: number;
	selectedAllocationId: number;
} | null;

export async function getSelectedAllocationId(
	semesterId: number
): Promise<GetSelectedAllocationIdResponseData> {
	try {
		const result = await fetcherFn<GetSelectedAllocationIdResponseData>(
			`/semesters/${semesterId}/allocation`,
			{
				method: 'GET',
			},
			{
				next: { tags: ['selected-allocation-id'] },
			}
		);

		return result ?? null;
	} catch (error) {
		console.error('Error in getSelectedAllocationId:', error);
		return null;
	}
}

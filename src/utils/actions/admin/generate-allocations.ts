'use server';

import { fetcherFn } from '../../functions';

type GenerateAllocationsData = {
	semesterId: number;
	name?: string;
};

export type GenerateAllocationsResponseData = {
	allocations: Array<{
		studentId: number;
		projectId: number;
		priority: number;
		status: string;
	}>;
	allocationRate: number;
	averagePreference: number;
	preferenceDistribution: { [key: string]: number };
	unallocatedStudents: Array<number>;
	forceAllocatedStudents: Array<number>;
} | null;

export async function generateAllocations(
	data: GenerateAllocationsData
): Promise<GenerateAllocationsResponseData> {
	try {
		const result = await fetcherFn<GenerateAllocationsResponseData>(
			'admin/allocations/generate',
			data,
			{
				method: 'POST',
				next: { tags: ['allocations'] },
			}
		);

		console.log('result', result);

		// TODO: Revalidate
		// if (result) {
		// 	// Revalidate the 'get-allocations' cache tag
		// 	revalidateTag('get-allocations');
		// }

		return {
			allocations: result?.allocations ?? [],
			allocationRate: result?.allocationRate ?? 0,
			averagePreference: result?.averagePreference ?? 0,
			preferenceDistribution: result?.preferenceDistribution ?? {},
			unallocatedStudents: result?.unallocatedStudents ?? [],
			forceAllocatedStudents: result?.forceAllocatedStudents ?? [],
		};
	} catch (error) {
		console.error('Error in generateAllocations:', error);
		return null;
	}
}

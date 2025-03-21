'use server';

import { revalidateTag } from 'next/cache';

import { fetcherFn } from '../../functions';

type GenerateAllocationsData = {
	semesterId: number;
	name?: string;
};

export type GenerateAllocationsResponseData = {
	allocationId: number;
	result: {
		allocations: Array<{
			studentId: number;
			name: string;
			matriculationNumber: string;
			projectId: number;
			priority: number;
			status: string;
		}>;
		allocationRate: number;
		averagePreference: number;
		preferenceDistribution: { [key: string]: number };
		unallocatedStudents: Array<number>;
		droppedProjects: Array<number>;
	};
} | null;

export async function generateAllocations(
	data: GenerateAllocationsData
): Promise<GenerateAllocationsResponseData> {
	try {
		const response = await fetcherFn<GenerateAllocationsResponseData>(
			'admin/allocations/generate',
			{
				method: 'POST',
				next: { tags: ['allocations'] },
			},
			data
		);

		revalidateTag('allocations-by-semester');

		return {
			allocationId: response?.allocationId ?? 0,
			result: {
				allocations: response?.result.allocations ?? [],
				allocationRate: response?.result?.allocationRate ?? 0,
				averagePreference: response?.result?.averagePreference ?? 0,
				preferenceDistribution: response?.result?.preferenceDistribution ?? {},
				unallocatedStudents: response?.result?.unallocatedStudents ?? [],
				droppedProjects: response?.result?.droppedProjects ?? [],
			},
		};
	} catch (error) {
		console.error('Error in generateAllocations:', error);
		return null;
	}
}

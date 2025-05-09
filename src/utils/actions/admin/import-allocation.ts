'use server';

import { revalidateTag } from 'next/cache';

import { GeneratedAllocationData } from '@/app/admin/project/allocation/types';

import { getServerActionSession } from './upload';

export async function importAllocation(
	formData: FormData
): Promise<GeneratedAllocationData | null> {
	try {
		const apiUrl = process.env.BACKEND_API_URL;
		if (!apiUrl) {
			throw new Error('Backend API URL is not defined');
		}

		// Get the session token using your authentication method
		const session = await getServerActionSession();

		// Create a simple form data object to send to the API
		const response = await fetch(`${apiUrl}/api/admin/allocations/import`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${session.accessToken}`,
			},
			body: formData,
		});

		const formDataObject = Object.fromEntries(formData.entries());
		console.log('FormData contents:', formDataObject);

		console.log('Response from API:', response);

		if (!response.ok) {
			const errorData = await response.json();
			console.error('API error details:', errorData);
			throw new Error(
				`HTTP error! status: ${response.status}, details: ${JSON.stringify(errorData)}`
			);
		}

		const rawResult = await response.json();

		// Transform the raw result to camelCase for consistency
		const transformedData: GeneratedAllocationData = {
			allocationId: rawResult.allocation_id,
			result: {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				allocations: rawResult.result.allocations.map((allocation: any) => ({
					studentId: allocation.student_id,
					name: allocation.name,
					matriculationNumber: allocation.matriculation_number,
					projectId: allocation.project_id,
					priority: allocation.priority,
					status: allocation.status,
				})),
				allocationRate: rawResult.result.allocation_rate,
				averagePreference: rawResult.result.average_preference,
				preferenceDistribution: rawResult.result.preference_distribution,
				unallocatedStudents: rawResult.result.unallocated_students,
				droppedProjects: rawResult.result.dropped_projects,
			},
		};

		// Revalidate relevant cache tags to update data
		revalidateTag(`allocations-by-semester-${formData.get('semester_id')}`);

		return transformedData;
	} catch (error) {
		console.error('Error importing allocation:', error);
		return null;
	}
}

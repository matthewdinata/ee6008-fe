'use server';

import { fetcherFn } from '../../functions';

export type GetRegistrationsByProjectIdResponseData = Array<{
	id: number;
	matriculationNumber: string;
	name: string;
	priority: number;
	status: string;
}> | null;

export async function getRegistrationsByProjectId(
	projectId: number
): Promise<GetRegistrationsByProjectIdResponseData> {
	try {
		const result = await fetcherFn<GetRegistrationsByProjectIdResponseData>(
			`admin/registrations?project_id=${projectId}`,
			{
				method: 'GET',
			},
			{
				next: { tags: ['registrations-by-project-id'] },
			}
		);

		return result ?? [];
	} catch (error) {
		console.error('Error in getRegistrationsByProjectId:', error);
		return null;
	}
}

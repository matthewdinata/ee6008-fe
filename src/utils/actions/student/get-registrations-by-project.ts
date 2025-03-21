'use server';

import { fetcherFn } from '../../functions';

export type GetRegistrationsByProjectResponse = {
	projectId: number;
	projectTitle: string;
	students: { studentId: number }[];
} | null;

export async function getRegistrationsByProject(
	projectId: number
): Promise<GetRegistrationsByProjectResponse> {
	try {
		const result = await fetcherFn<GetRegistrationsByProjectResponse>(
			`student/registrations/${projectId}`,
			{
				method: 'GET',
			},
			{
				next: { tags: ['registrations-by-project'] },
			}
		);

		return result ?? null;
	} catch (error) {
		console.error('Error in getRegistrationsByProject:', error);
		return null;
	}
}

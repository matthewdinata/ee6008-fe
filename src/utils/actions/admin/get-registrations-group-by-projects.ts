'use server';

import { fetcherFn } from '../../functions';

export type GetRegistrationsGroupByProjectsResponseData = Array<{
	projectId: number;
	title: string;
	totalSignUps: number;
}> | null;

export async function getRegistrationsGroupByProjects(): Promise<GetRegistrationsGroupByProjectsResponseData> {
	try {
		const result = await fetcherFn<GetRegistrationsGroupByProjectsResponseData>(
			'admin/registrations/group-by-projects',
			{
				method: 'GET',
			},
			{
				next: { tags: ['registrations-group-by-projects'] },
			}
		);

		return result ?? [];
	} catch (error) {
		console.error('Error in getRegistrationsGroupByProjects:', error);
		return null;
	}
}

'use server';

import { fetcherFn } from '../../functions';

export type PlannedProject = {
	id: number;
	projectId: number;
	title: string;
	description: string;
	professorName?: string;
	programmeName?: string;
	venueName?: string;
};

export type GetPlannedProjectsResponseData = PlannedProject[] | null;

export async function getPlannedProjects(): Promise<GetPlannedProjectsResponseData> {
	try {
		const result = await fetcherFn<GetPlannedProjectsResponseData>(
			'student/planner',
			{
				method: 'GET',
			},
			{
				next: { tags: ['plans'] },
			}
		);

		return result ?? [];
	} catch (error) {
		console.error('Error in getPlannedProjects:', error);
		return null;
	}
}

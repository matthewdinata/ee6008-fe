'use server';

import { fetcherFn } from '../../functions';

export type ProjectResponse = {
	id: number;
	title: string;
	description: string;
	programme?: {
		id: number;
		name: string;
	};
	venue?: {
		id: number;
		name: string;
	};
	professor?: {
		id: number;
		name: string;
	};
};

export type GetActiveProjectsResponseData = ProjectResponse[] | null;

export async function getActiveProjects(): Promise<GetActiveProjectsResponseData> {
	try {
		const result = await fetcherFn<GetActiveProjectsResponseData>(
			'student/projects',
			{
				method: 'GET',
			},
			{
				next: { tags: ['projects'] },
			}
		);

		return result ?? [];
	} catch (error) {
		console.error('Error in getActiveProjects:', error);
		return null;
	}
}

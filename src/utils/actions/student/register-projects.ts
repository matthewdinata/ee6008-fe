'use server';

import { revalidateTag } from 'next/cache';

import { fetcherFn } from '../../functions';

export type RegisterProjectsData = number[];

export type RegisterProjectsResponseData = {
	message: string;
	projects: Array<{
		id: number;
		title: string;
		priority: number;
	}>;
} | null;

export async function registerProjects(
	data: RegisterProjectsData
): Promise<RegisterProjectsResponseData> {
	try {
		const response = await fetcherFn<RegisterProjectsResponseData>(
			'student/register',
			{
				method: 'POST',
				next: { tags: ['register-projects'] },
			},
			data
		);

		revalidateTag('registrations');

		return response;
	} catch (error) {
		console.error('Error in registerProjects:', error);
		return null;
	}
}

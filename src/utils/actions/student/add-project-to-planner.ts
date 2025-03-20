'use server';

import { revalidateTag } from 'next/cache';

import { fetcherFn } from '../../functions';

export type AddProjectToPlannerData = {
	projectId: number;
};

export type AddProjectToPlannerResponseData = {
	id: number;
	studentId: number;
	projectId: number;
} | null;

export async function addProjectToPlanner(
	data: AddProjectToPlannerData
): Promise<AddProjectToPlannerResponseData> {
	try {
		const response = await fetcherFn<AddProjectToPlannerResponseData>(
			'student/planner',
			{
				method: 'POST',
				next: { tags: ['planner'] },
			},
			data
		);

		revalidateTag('plans');

		return response;
	} catch (error) {
		console.error('Error in addProjectToPlanner:', error);
		return null;
	}
}

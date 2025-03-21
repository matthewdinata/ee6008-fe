'use server';

import { fetcherFn } from '../../functions';

export type GetStudentsByPlannedProjectResponse = Array<{
	projectId: number;
	name: string;
	email: string;
	studentId: number;
	matriculationNumber: string;
}> | null;

export async function getStudentsByPlannedProject(
	projectId: number
): Promise<GetStudentsByPlannedProjectResponse> {
	try {
		const result = await fetcherFn<GetStudentsByPlannedProjectResponse>(
			`student/planner/project/${projectId}`,
			{
				method: 'GET',
			},
			{
				next: { tags: ['students-by-planned-project'] },
			}
		);

		return result ?? null;
	} catch (error) {
		console.error('Error in getStudentsByPlannedProject:', error);
		return null;
	}
}

'use server';

import { fetcherFn } from '@/utils/functions';

export interface StudentGrade {
	studentId: number;
	name: string;
	matricNumber: string;
	supervisorGrade: number;
	moderatorGrade: number;
	finalGrade: number;
	letterGrade: string;
}

export interface ProjectGradeSummary {
	projectId: number;
	title: string;
	supervisorName: string;
	moderatorName: string;
	students: StudentGrade[];
}

/**
 * Get all project grades for a specific semester
 * @param semesterId - The semester ID to get grades for
 * @returns Array of project grade summaries
 */
export async function getAllProjectGrades(semesterId: number): Promise<ProjectGradeSummary[]> {
	if (!semesterId) {
		return [];
	}

	try {
		const endpoint = `faculty/grades?semester_id=${semesterId}`;
		const response = await fetcherFn(endpoint, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		console.log('Raw API response:', response);

		return response as ProjectGradeSummary[];
	} catch (error) {
		console.error('Error fetching all project grades:', error);
		throw new Error('Failed to fetch project grades');
	}
}

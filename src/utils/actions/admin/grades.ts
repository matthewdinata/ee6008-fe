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

	console.log('Fetching all project grades for semester ID:', semesterId);
	try {
		const endpoint = `faculty/grades?semester_id=${semesterId}`;
		console.log('API endpoint:', endpoint);

		const response = await fetcherFn(endpoint, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		console.log('Raw API response:', JSON.stringify(response, null, 2));
		console.log(
			'Number of projects returned:',
			Array.isArray(response) ? response.length : 'Not an array'
		);

		if (Array.isArray(response) && response.length > 0) {
			const firstProject = response[0];
			console.log('First project data:', JSON.stringify(firstProject, null, 2));
			console.log(
				'First project students:',
				firstProject.students
					? JSON.stringify(firstProject.students.slice(0, 2), null, 2)
					: 'No students'
			);
		}

		return response as ProjectGradeSummary[];
	} catch (error) {
		console.error('Error fetching all project grades:', error);
		throw new Error('Failed to fetch project grades');
	}
}

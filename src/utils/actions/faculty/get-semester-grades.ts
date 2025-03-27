import { ProjectGradeResponse } from '@/types/grade';
import { fetcherFn } from '@/utils/functions';

/**
 * Fetches project grades for a specific semester
 * @param semesterId - The ID of the semester
 * @returns Promise with project grades data
 */
export const getSemesterGrades = async (semesterId: number): Promise<ProjectGradeResponse[]> => {
	try {
		const response = await fetcherFn<ProjectGradeResponse[]>(
			`faculty/semesters/${semesterId}/projects/grades`,
			{
				method: 'GET',
			}
		);
		console.log(response);
		// Transform snake_case to camelCase
		return response.map((project) => ({
			projectId: project.projectId,
			title: project.title,
			description: project.description,
			role: project.role,
			supervisorName: project.supervisorName,
			supervisorEmail: project.supervisorEmail,
			moderatorName: project.moderatorName,
			moderatorEmail: project.moderatorEmail,
			students: project.students.map((student) => ({
				studentId: student.studentId,
				name: student.name,
				matricNumber: student.matricNumber,
				supervisorGrade: student.supervisorGrade,
				moderatorGrade: student.moderatorGrade,
				finalGrade: student.finalGrade,
				letterGrade: student.letterGrade,
			})),
		}));
	} catch (error) {
		console.error('Error fetching semester grades:', error);
		throw error;
	}
};

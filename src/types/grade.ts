export interface StudentGrade {
	studentId: number;
	matricNumber: string;
	supervisorGrade: number;
	moderatorGrade: number;
	finalGrade: number;
	letterGrade: string;

	student_id?: number;
	matric_number?: string;
	supervisor_grade?: number;
	moderator_grade?: number;
	final_grade?: number;
	letter_grade?: string;
	name: string;
}

export interface ProjectGradeResponse {
	title: string;
	description: string;
	role: 'supervisor' | 'moderator';

	projectId: number;
	supervisorName: string;
	supervisorEmail: string;
	moderatorName: string;
	moderatorEmail: string;
	students: StudentGrade[];

	project_id?: number;
	supervisor_name?: string;
	supervisor_email?: string;
	moderator_name?: string;
	moderator_email?: string;
}

export interface SemesterOption {
	id: number;
	name: string;
}

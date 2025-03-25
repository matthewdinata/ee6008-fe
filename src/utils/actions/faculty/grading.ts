'use server';

import { fetcherFn } from '@/utils/functions';

// Interfaces for grading components
export interface GradingComponent {
	id: number;
	name: string;
	description: string;
	weight: number;
	max_score: number;
	component_type: string;
	is_team_based?: boolean;
}

// Interface for supervisor grading
export interface SupervisorGrade {
	project_id: number;
	student_id?: number;
	component_id: number;
	score: number;
	feedback?: string;
}

// Interface for team grading
export interface TeamGrade {
	component_id: number;
	score: number;
	comments?: string;
}

// Interface for student grading
export interface StudentGrade {
	student_id: number;
	component_id: number;
	score: number;
	comments?: string;
}

// Interface for moderator grading
export interface ModeratorGrade {
	project_id: number;
	component_id: number;
	score: number;
	feedback?: string;
}

// Interface for project grades
export interface ProjectGrade {
	project_id: number;
	student_id?: number;
	component_id: number;
	component_name: string;
	component_weight: number;
	score: number;
	max_score: number;
	feedback?: string;
	graded_by: string;
	graded_at: string;
}

// Interface for final project grades
export interface FinalProjectGrade {
	project_id: number;
	student_id?: number;
	student_name?: string;
	final_score: number;
	supervisor_score: number;
	moderator_score: number;
	grade: string;
}

/**
 * Get grading components for supervisor
 */
export async function getGradingComponentsForSupervisor(): Promise<GradingComponent[]> {
	return fetcherFn<GradingComponent[]>('faculty/grading/components/supervisor', {
		method: 'GET',
		cache: 'no-store',
	});
}

/**
 * Get grading components for moderator
 */
export async function getGradingComponentsForModerator(): Promise<GradingComponent[]> {
	return fetcherFn<GradingComponent[]>('faculty/grading/components/moderator', {
		method: 'GET',
		cache: 'no-store',
	});
}

/**
 * Get project grades as supervisor
 */
export async function getProjectGradesAsSupervisor(projectId: number): Promise<ProjectGrade[]> {
	return fetcherFn<ProjectGrade[]>(`faculty/projects/${projectId}/supervisor/grade`, {
		method: 'GET',
		cache: 'no-store',
	});
}

/**
 * Get project grades as moderator
 */
export async function getProjectGradesAsModerator(projectId: number): Promise<ProjectGrade[]> {
	return fetcherFn<ProjectGrade[]>(`faculty/projects/${projectId}/moderator/grade`, {
		method: 'GET',
		cache: 'no-store',
	});
}

/**
 * Get final project grades
 */
export async function getFinalProjectGrades(projectId: number): Promise<FinalProjectGrade[]> {
	return fetcherFn<FinalProjectGrade[]>(`faculty/projects/${projectId}/grades`, {
		method: 'GET',
		cache: 'no-store',
	});
}

/**
 * Grade project as supervisor
 */
export async function gradeProjectAsSupervisor(
	projectId: number,
	grades: SupervisorGrade[],
	feedback?: string
): Promise<boolean> {
	await fetcherFn(
		`faculty/projects/${projectId}/supervisor/grade`,
		{
			method: 'POST',
		},
		{
			grades,
			feedback,
		}
	);

	return true;
}

/**
 * Grade project as moderator
 */
export async function gradeProjectAsModerator(
	projectId: number,
	grades: ModeratorGrade[],
	feedback?: string
): Promise<boolean> {
	await fetcherFn(
		`faculty/projects/${projectId}/moderator/grade`,
		{
			method: 'POST',
		},
		{
			grades,
			feedback,
		}
	);

	return true;
}

/**
 * Client-side functions
 */

export async function getGradingComponentsForSupervisorClient(): Promise<GradingComponent[]> {
	return fetcherFn<GradingComponent[]>('faculty/grading/components/supervisor', {
		method: 'GET',
	});
}

export async function getGradingComponentsForModeratorClient(): Promise<GradingComponent[]> {
	return fetcherFn<GradingComponent[]>('faculty/grading/components/moderator', {
		method: 'GET',
	});
}

export async function getProjectGradesAsSupervisorClient(
	projectId: number
): Promise<ProjectGrade[]> {
	return fetcherFn<ProjectGrade[]>(`faculty/projects/${projectId}/supervisor/grade`, {
		method: 'GET',
	});
}

export async function getProjectGradesAsModeratorClient(
	projectId: number
): Promise<ProjectGrade[]> {
	return fetcherFn<ProjectGrade[]>(`faculty/projects/${projectId}/moderator/grade`, {
		method: 'GET',
	});
}

export async function getFinalProjectGradesClient(projectId: number): Promise<FinalProjectGrade[]> {
	return fetcherFn<FinalProjectGrade[]>(`faculty/projects/${projectId}/grades`, {
		method: 'GET',
	});
}

export async function gradeProjectAsSupervisorClient(
	projectId: number,
	grades: {
		student_grades: SupervisorGrade[];
		team_grades: SupervisorGrade[];
	},
	feedback?: string
): Promise<boolean> {
	console.log('gradeProjectAsSupervisorClient - POST request payload:', {
		projectId,
		...grades,
		feedback,
	});

	await fetcherFn(
		`faculty/projects/${projectId}/supervisor/grade`,
		{
			method: 'POST',
		},
		{
			...grades,
			feedback,
		}
	);

	return true;
}

export async function gradeProjectAsModeratorClient(
	projectId: number,
	grades: {
		team_grades: ModeratorGrade[];
	},
	feedback?: string
): Promise<boolean> {
	console.log('gradeProjectAsModeratorClient - POST request payload:', {
		projectId,
		...grades,
		feedback,
	});

	await fetcherFn(
		`faculty/projects/${projectId}/moderator/grade`,
		{
			method: 'POST',
		},
		{
			...grades,
			feedback,
		}
	);

	return true;
}

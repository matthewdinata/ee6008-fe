import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
	FinalProjectGrade,
	GradingComponent,
	ModeratorGrade,
	ProjectGrade,
	SupervisorGrade,
	getFinalProjectGradesClient,
	getGradingComponentsForModeratorClient,
	getGradingComponentsForSupervisorClient,
	getProjectGradesAsModeratorClient,
	getProjectGradesAsSupervisorClient,
	gradeProjectAsModeratorClient,
	gradeProjectAsSupervisorClient,
} from '@/utils/actions/faculty/grading';

/**
 * Hook to get supervisor grading components
 */
export const useGetSupervisorGradingComponents = (options?: { enabled?: boolean }) => {
	return useQuery<GradingComponent[], Error>({
		queryKey: ['supervisor-grading-components'],
		queryFn: () => getGradingComponentsForSupervisorClient(),
		staleTime: 1000 * 60 * 5, // 5 minutes
		enabled: options?.enabled !== false, // Default to true if not specified
	});
};

/**
 * Hook to get moderator grading components
 */
export const useGetModeratorGradingComponents = (options?: { enabled?: boolean }) => {
	return useQuery<GradingComponent[], Error>({
		queryKey: ['moderator-grading-components'],
		queryFn: () => getGradingComponentsForModeratorClient(),
		staleTime: 1000 * 60 * 5, // 5 minutes
		enabled: options?.enabled !== false, // Default to true if not specified
	});
};

/**
 * Hook to get project grades as supervisor
 */
export const useGetSupervisorGrades = (
	projectId: number | null,
	options?: { enabled?: boolean }
) => {
	return useQuery<ProjectGrade[], Error>({
		queryKey: ['supervisor-grades', projectId],
		queryFn: () =>
			projectId ? getProjectGradesAsSupervisorClient(projectId) : Promise.resolve([]),
		enabled: options?.enabled !== false && !!projectId, // Default to true if not specified
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
};

/**
 * Hook to get project grades as moderator
 */
export const useGetModeratorGrades = (
	projectId: number | null,
	options?: { enabled?: boolean }
) => {
	return useQuery<ProjectGrade[], Error>({
		queryKey: ['moderator-grades', projectId],
		queryFn: () =>
			projectId ? getProjectGradesAsModeratorClient(projectId) : Promise.resolve([]),
		enabled: options?.enabled !== false && !!projectId, // Default to true if not specified
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
};

/**
 * Hook to get final project grades
 */
export const useGetFinalProjectGrades = (
	projectId: number | null,
	options?: { enabled?: boolean }
) => {
	return useQuery<FinalProjectGrade[], Error>({
		queryKey: ['final-project-grades', projectId],
		queryFn: () => (projectId ? getFinalProjectGradesClient(projectId) : Promise.resolve([])),
		enabled: options?.enabled !== false && !!projectId, // Default to true if not specified
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
};

/**
 * Hook to submit supervisor grades
 */
export const useSubmitSupervisorGrades = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			projectId,
			grades,
			feedback,
		}: {
			projectId: number;
			grades: {
				student_grades: SupervisorGrade[];
				team_grades: SupervisorGrade[];
			};
			feedback?: string;
		}) => {
			console.log('Supervisor grade submission payload:', {
				projectId,
				grades,
				feedback,
			});
			return gradeProjectAsSupervisorClient(projectId, grades, feedback);
		},
		onSuccess: (_, variables) => {
			// Invalidate relevant queries
			queryClient.invalidateQueries({ queryKey: ['supervisor-grades', variables.projectId] });
			queryClient.invalidateQueries({
				queryKey: ['final-project-grades', variables.projectId],
			});
		},
	});
};

/**
 * Hook to submit moderator grades
 */
export const useSubmitModeratorGrades = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			projectId,
			grades,
			feedback,
		}: {
			projectId: number;
			grades: {
				team_grades: ModeratorGrade[];
			};
			feedback?: string;
		}) => {
			console.log('Moderator grade submission payload:', {
				projectId,
				grades,
				feedback,
			});
			return gradeProjectAsModeratorClient(projectId, grades, feedback);
		},
		onSuccess: (_, variables) => {
			// Invalidate relevant queries
			queryClient.invalidateQueries({ queryKey: ['moderator-grades', variables.projectId] });
			queryClient.invalidateQueries({
				queryKey: ['final-project-grades', variables.projectId],
			});
		},
	});
};

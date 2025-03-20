import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
	AddProjectToPlannerResponseData,
	addProjectToPlanner,
} from '@/utils/actions/student/add-project-to-planner';

type ProjectInput = {
	id: number;
	title: string;
};

type SuccessfulProject = {
	project: ProjectInput;
	result: AddProjectToPlannerResponseData;
};

type FailedProject = {
	project: ProjectInput;
	error: Error;
	statusCode?: number;
};

interface ProjectError extends Error {
	failedProjects?: FailedProject[];
}

export const useAddProjectsToPlanner = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (projects: ProjectInput[]) => {
			const results = await Promise.allSettled(
				projects.map((project) => addProjectToPlanner({ projectId: project.id }))
			);

			// Track successful and failed projects
			const successfulProjects: SuccessfulProject[] = [];
			const failedProjects: FailedProject[] = [];

			results.forEach((result, index) => {
				if (
					result.status === 'rejected' ||
					(result.status === 'fulfilled' && result.value === null)
				) {
					const error =
						result.status === 'rejected'
							? (result as PromiseRejectedResult).reason
							: new Error('Failed to add project');

					// Extract status code from error message if present
					let statusCode: number | undefined = undefined;
					if (error.message) {
						const match = error.message.match(/status: (\d+)/);
						if (match && match[1]) {
							statusCode = parseInt(match[1], 10);
						}
					}

					failedProjects.push({
						project: projects[index],
						error,
						statusCode,
					});
				} else {
					successfulProjects.push({
						project: projects[index],
						result: (result as PromiseFulfilledResult<AddProjectToPlannerResponseData>)
							.value,
					});
				}
			});

			// If there are any errors, include project titles in the error
			if (failedProjects.length > 0) {
				const error = new Error('Failed to add projects to planner') as ProjectError;
				error.failedProjects = failedProjects;
				throw error;
			}

			return successfulProjects;
		},
		onSuccess: () => {
			// Invalidate relevant queries
			queryClient.invalidateQueries({
				queryKey: ['planner'],
			});
			queryClient.invalidateQueries({
				queryKey: ['plans'],
			});
		},
	});
};

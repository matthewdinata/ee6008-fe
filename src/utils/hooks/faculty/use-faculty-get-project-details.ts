import { useQuery } from '@tanstack/react-query';

import {
	ProjectDetails,
	getProjectDetailsClient,
} from '@/utils/actions/faculty/get-project-details';

/**
 * Hook to get project details by ID
 */
export const useGetProjectDetails = (projectId: number | null) => {
	return useQuery<ProjectDetails | null, Error>({
		queryKey: ['project-details', projectId],
		queryFn: () => (projectId ? getProjectDetailsClient(projectId) : null),
		enabled: !!projectId,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
};

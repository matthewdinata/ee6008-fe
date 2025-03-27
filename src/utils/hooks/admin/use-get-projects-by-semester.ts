import { useQuery } from '@tanstack/react-query';

import { getProjectsBySemester } from '@/utils/actions/admin/project';
import { Project } from '@/utils/actions/admin/types';

export const useGetProjectsBySemester = (
	semesterId: number,
	options?: {
		onSuccess?: (data: Project[]) => void;
		onError?: (error: unknown) => void;
		enabled?: boolean;
	}
) => {
	return useQuery<Project[]>({
		queryKey: ['projects-by-semester', semesterId],
		queryFn: async () => {
			const result = await getProjectsBySemester(semesterId);
			return result || [];
		},
		enabled: semesterId > 0 && options?.enabled !== false, // Only run if semesterId is valid and not explicitly disabled
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
		refetchOnWindowFocus: false, // Prevent refetching when window gains focus
		refetchOnMount: false, // Don't refetch when component mounts
		...options,
	});
};

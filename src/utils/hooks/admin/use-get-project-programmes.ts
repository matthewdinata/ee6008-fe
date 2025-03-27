import { useQuery } from '@tanstack/react-query';

import { getProjectProgrammes } from '@/utils/actions/admin/project';
import { Programme } from '@/utils/actions/admin/types';

export const useGetProjectProgrammes = (
	semesterId: number,
	options?: {
		onSuccess?: (data: Programme[]) => void;
		onError?: (error: unknown) => void;
		enabled?: boolean;
	}
) => {
	return useQuery<Programme[]>({
		queryKey: ['project-programmes', semesterId],
		queryFn: async () => {
			const result = await getProjectProgrammes(semesterId);
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

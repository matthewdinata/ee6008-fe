import { useQuery } from '@tanstack/react-query';

import { ProjectGradeSummary, getAllProjectGrades } from '@/utils/actions/admin/grades';

/**
 * Hook to get all project grades for a semester
 * @param semesterId - The semester ID to get grades for
 * @returns Query result with project grades data
 */
export function useGetAllProjectGrades(semesterId: number | null) {
	return useQuery<ProjectGradeSummary[], Error>({
		queryKey: ['all-project-grades', semesterId],
		queryFn: () => getAllProjectGrades(semesterId || 0),
		enabled: !!semesterId,
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10, // 10 minutes
		refetchOnWindowFocus: false,
	});
}

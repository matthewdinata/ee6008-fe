import { UseQueryOptions, useQuery } from '@tanstack/react-query';

import { ProjectGradeSummary, getAllProjectGrades } from '@/utils/actions/admin/grades';

/**
 * Hook to get all project grades for a semester
 * @param semesterId - The semester ID to get grades for
 * @param options - Additional options for the query
 * @returns Query result with project grades data
 */
export function useGetAllProjectGrades(
	semesterId: string | null,
	options?: Omit<
		UseQueryOptions<
			ProjectGradeSummary[],
			Error,
			ProjectGradeSummary[],
			[string, string | null]
		>,
		'queryKey' | 'queryFn'
	>
) {
	return useQuery<ProjectGradeSummary[], Error, ProjectGradeSummary[], [string, string | null]>({
		queryKey: ['all-project-grades', semesterId],
		queryFn: () => getAllProjectGrades(semesterId ? parseInt(semesterId) : 0),
		enabled: options?.enabled !== undefined ? options.enabled : !!semesterId,
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10, // 10 minutes
		refetchOnWindowFocus: false,
		...options,
	});
}

import { UseQueryOptions, useQuery } from '@tanstack/react-query';

import {
	CourseCoordinatorResponse,
	checkCourseCoordinator,
} from '@/utils/actions/faculty/check-course-coordinator';

export type UseCheckCourseCoordinatorOptions = Omit<
	UseQueryOptions<
		CourseCoordinatorResponse,
		Error,
		CourseCoordinatorResponse,
		readonly unknown[]
	>,
	'queryKey' | 'queryFn'
>;

export const useCheckCourseCoordinator = (options?: UseCheckCourseCoordinatorOptions) => {
	return useQuery<
		CourseCoordinatorResponse,
		Error,
		CourseCoordinatorResponse,
		readonly unknown[]
	>({
		queryKey: ['check-course-coordinator'] as const,
		queryFn: () => checkCourseCoordinator(),
		staleTime: 5 * 60 * 1000, // 5 minutes
		...options,
	});
};

import { useQuery } from '@tanstack/react-query';

import { ProjectGradeResponse } from '@/types/grade';
import { getSemesterGrades } from '@/utils/actions/faculty/get-semester-grades';

interface UseGetSemesterGradesOptions {
	onSuccess?: (data: ProjectGradeResponse[]) => void;
	onError?: (error: unknown) => void;
	enabled?: boolean;
}

/**
 * Hook to fetch project grades for a specific semester
 * @param semesterId - The ID of the semester
 * @param options - Query options
 * @returns Query result with project grades data
 */
export const useGetSemesterGrades = (
	semesterId: number | undefined,
	options: UseGetSemesterGradesOptions = {}
) => {
	return useQuery<ProjectGradeResponse[], Error>({
		queryKey: ['semesterGrades', semesterId],
		queryFn: () => {
			if (!semesterId) {
				throw new Error('Semester ID is required');
			}
			return getSemesterGrades(semesterId);
		},
		enabled: !!semesterId && options.enabled !== false,
		...options,
	});
};

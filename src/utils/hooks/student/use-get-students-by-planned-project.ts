import { useQuery } from '@tanstack/react-query';

import { getStudentsByPlannedProject } from '@/utils/actions/student/get-students-by-planned-project';

export const useGetStudentsByPlannedProject = (projectId: number) => {
	return useQuery({
		queryKey: ['get-students-by-planned-project'],
		queryFn: () => getStudentsByPlannedProject(projectId),
	});
};

import { useQuery } from '@tanstack/react-query';

import { getRegistrationsByProject } from '@/utils/actions/student/get-registrations-by-project';

export const useGetRegistrationsByProject = (projectId: number) => {
	return useQuery({
		queryKey: ['get-registrations-by-project', projectId],
		queryFn: () => getRegistrationsByProject(projectId),
	});
};

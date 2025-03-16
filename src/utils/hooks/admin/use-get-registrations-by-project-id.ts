import { useQuery } from '@tanstack/react-query';

import { getRegistrationsByProjectId } from '../../actions/admin/get-registrations-by-project-id';

export const useGetRegistrationsByProjectId = (projectId: number) => {
	return useQuery({
		queryKey: ['get-registrations-by-project-id', projectId],
		queryFn: () => getRegistrationsByProjectId(projectId),
	});
};

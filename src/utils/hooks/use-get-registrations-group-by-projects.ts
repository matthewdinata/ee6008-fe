import { useQuery } from '@tanstack/react-query';

import { getRegistrationsGroupByProjects } from '../actions/admin/get-registrations-group-by-projects';

export const useGetRegistrationsGroupByProjects = () => {
	return useQuery({
		queryKey: ['get-registrations-group-by-projects'],
		queryFn: () => getRegistrationsGroupByProjects(),
	});
};

import { useQuery } from '@tanstack/react-query';

import { getPlannedProjects } from '@/utils/actions/student/get-planned-projects';

export const useGetPlannedProjects = () => {
	return useQuery({
		queryKey: ['get-planned-projects'],
		queryFn: () => getPlannedProjects(),
	});
};

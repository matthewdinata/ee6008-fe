import { useQuery } from '@tanstack/react-query';

import { getActiveProjects } from '@/utils/actions/student/get-active-projects';

export const useGetActiveProjects = () => {
	return useQuery({
		queryKey: ['get-active-projects'],
		queryFn: () => getActiveProjects(),
	});
};

import { useQuery } from '@tanstack/react-query';

import { getAllocatedProject } from '@/utils/actions/student/get-allocated-project';

export const useGetAllocatedProject = () => {
	return useQuery({
		queryKey: ['get-allocated-project'],
		queryFn: () => getAllocatedProject(),
	});
};

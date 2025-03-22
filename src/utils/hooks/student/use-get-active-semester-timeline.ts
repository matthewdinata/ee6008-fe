import { useQuery } from '@tanstack/react-query';

import { getActiveSemesterTimeline } from '@/utils/actions/student/get-active-semester-timeline';

export const useGetActiveSemesterTimeline = () => {
	return useQuery({
		queryKey: ['semester-timeline'],
		queryFn: () => getActiveSemesterTimeline(),
	});
};

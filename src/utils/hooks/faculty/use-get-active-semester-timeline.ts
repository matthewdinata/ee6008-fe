import { useQuery } from '@tanstack/react-query';

import { getActiveSemesterTimeline } from '@/utils/actions/faculty/get-active-semester-timeline';

export const useGetActiveSemesterTimeline = () => {
	return useQuery({
		queryKey: ['active-semester-timeline'],
		queryFn: () => getActiveSemesterTimeline(),
	});
};

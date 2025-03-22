import { useQuery } from '@tanstack/react-query';

import { checkCourseCoordinator } from '@/utils/actions/faculty/check-course-coordinator';

export const useCheckCourseCoordinator = () => {
	return useQuery({
		queryKey: ['check-course-coordinator'],
		queryFn: () => checkCourseCoordinator(),
	});
};

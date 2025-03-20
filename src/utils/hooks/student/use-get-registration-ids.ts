import { useQuery } from '@tanstack/react-query';

import { getRegistrations } from '@/utils/actions/student/get-registrations';

export const useGetRegistrationIds = () => {
	return useQuery({
		queryKey: ['get-registration-ids'],
		queryFn: () => getRegistrations(),
		select: (data) =>
			data?.projects.reduce(
				(acc, project) => {
					acc[project.id] = project.priority;
					return acc;
				},
				{} as Record<number, number>
			) || {},
	});
};

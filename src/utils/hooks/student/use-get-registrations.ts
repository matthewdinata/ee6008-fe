import { useQuery } from '@tanstack/react-query';

import { getRegistrations } from '@/utils/actions/student/get-registrations';

export const useGetRegistrations = () => {
	return useQuery({
		queryKey: ['get-registrations'],
		queryFn: () => getRegistrations(),
	});
};

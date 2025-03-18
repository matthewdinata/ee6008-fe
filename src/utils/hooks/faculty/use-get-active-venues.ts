import { useQuery } from '@tanstack/react-query';

import { getActiveVenues } from '@/utils/actions/faculty/get-active-venues';

export const useGetActiveVenues = () => {
	return useQuery({
		queryKey: ['get-active-venues'],
		queryFn: () => getActiveVenues(),
	});
};

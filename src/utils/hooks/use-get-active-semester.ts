import { useQuery } from '@tanstack/react-query';

import { getActiveSemester } from '../actions/admin/get-active-semester';

export const useGetActiveSemester = () => {
	return useQuery({
		queryKey: ['get-active-semester'],
		queryFn: () => getActiveSemester(),
	});
};

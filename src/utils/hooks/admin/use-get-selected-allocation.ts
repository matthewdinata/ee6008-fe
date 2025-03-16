import { useQuery } from '@tanstack/react-query';

import { getSelectedAllocation } from '../../actions/admin/get-selected-allocation';

export const useGetSelectedAllocation = (semesterId: number) => {
	return useQuery({
		queryKey: ['get-selected-allocation', semesterId],
		queryFn: () => getSelectedAllocation(semesterId),
		enabled: !!semesterId,
	});
};

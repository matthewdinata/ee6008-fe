import { useQuery } from '@tanstack/react-query';

import { getSelectedAllocationId } from '../actions/admin/get-selected-allocation-id';

export const useGetSelectedAllocationId = (semesterId: number) => {
	return useQuery({
		queryKey: ['get-selected-allocation-id'],
		queryFn: () => getSelectedAllocationId(semesterId),
		enabled: !!semesterId,
	});
};

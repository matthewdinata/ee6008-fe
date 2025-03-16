import { useQuery } from '@tanstack/react-query';

import { getAllocationsBySemester } from '../../actions/admin/get-allocations-by-semester';

export const useGetAllocationsBySemester = (semesterId: number) => {
	return useQuery({
		queryKey: ['get-allocations-by-semester', semesterId],
		queryFn: () => getAllocationsBySemester(semesterId),
	});
};

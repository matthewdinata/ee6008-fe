import { useQuery } from '@tanstack/react-query';

import { getAllProposals } from '@/utils/actions/faculty/get-all-proposals';

export const useGetAllProposals = () => {
	return useQuery({
		queryKey: ['get-all-proposals'],
		queryFn: () => getAllProposals(),
	});
};

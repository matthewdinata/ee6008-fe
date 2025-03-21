import { useQuery } from '@tanstack/react-query';

import { getMyProposals } from '@/utils/actions/faculty/get-my-proposals';

export const useGetMyProposals = () => {
	return useQuery({
		queryKey: ['get-my-proposals'],
		queryFn: () => getMyProposals(),
	});
};

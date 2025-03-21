import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
	UpdateProposalStatusData,
	updateProposalStatus,
} from '@/utils/actions/faculty/update-proposal-status';

export const useUpdateProposalStatus = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (requestData: UpdateProposalStatusData) => updateProposalStatus(requestData),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['proposals'],
			});
			queryClient.invalidateQueries({
				queryKey: ['get-my-proposals'],
			});
		},
	});
};

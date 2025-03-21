import { useMutation, useQueryClient } from '@tanstack/react-query';

import { CreateProposalData, createProposal } from '@/utils/actions/faculty/create-proposal';

export const useCreateProposal = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (requestData: CreateProposalData) => createProposal(requestData),
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

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { generateAllocations } from '../actions/admin/generate-allocations';

export const useGenerateAllocations = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ semesterId, name }: { semesterId: number; name?: string }) =>
			generateAllocations({
				semesterId,
				name,
			}),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({
				queryKey: ['get-allocations-by-semester', variables.semesterId],
			});
		},
	});
};

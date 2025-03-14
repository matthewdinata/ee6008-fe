import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toggleSelectedAllocation } from '../actions/admin/toggle-selected-allocation';

export const useToggleSelectedAllocation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			semesterId,
			allocationId,
		}: {
			semesterId: number;
			allocationId: number;
		}) => {
			try {
				const result = await toggleSelectedAllocation({
					semesterId,
					allocationId,
				});

				return result;
			} catch (error) {
				console.error('Error in mutation function:', error);
				throw error;
			}
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: ['get-selected-allocation', data?.semester.id],
			});

			queryClient.refetchQueries({
				queryKey: ['get-selected-allocation'],
				exact: false,
			});
		},
		onError: (error) => {
			console.error('The useToggleSelectedAllocation mutation failed with error:', error);
		},
	});
};

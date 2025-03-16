import { useMutation, useQueryClient } from '@tanstack/react-query';

import { clearSelectedAllocation } from '../../actions/admin/clear-selected-allocation';

export const useClearSelectedAllocation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (semesterId: number) => {
			try {
				const result = await clearSelectedAllocation(semesterId);
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
			console.error('The useClearSelectedAllocation mutation failed with error:', error);
		},
	});
};

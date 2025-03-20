import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteProjectFromPlanner } from '@/utils/actions/student/delete-project-from-planner';

export const useDeleteProjectFromPlanner = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (plannerId: number) => deleteProjectFromPlanner(plannerId),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['get-planned-projects'],
			});
		},
	});
};

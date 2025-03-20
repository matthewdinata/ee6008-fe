import { useMutation, useQueryClient } from '@tanstack/react-query';

import { registerProjects } from '@/utils/actions/student/register-projects';

export const useRegisterProjects = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (projectIds: number[]) => registerProjects(projectIds),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['get-registration-ids'],
			});
			queryClient.invalidateQueries({
				queryKey: ['get-registrations'],
			});
		},
	});
};

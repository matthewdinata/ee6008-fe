import { useMutation } from '@tanstack/react-query';

import { generateAllocations } from '../actions/admin/generate-allocations';

export const useGenerateAllocations = () => {
	return useMutation({
		mutationFn: ({ semesterId, name }: { semesterId: number; name?: string }) =>
			generateAllocations({
				semesterId,
				name,
			}),
	});
};

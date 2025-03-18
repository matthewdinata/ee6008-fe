import { useQuery } from '@tanstack/react-query';

import { getActiveProgrammes } from '@/utils/actions/faculty/get-active-programmes';

export const useGetActiveProgrammes = () => {
	return useQuery({
		queryKey: ['get-active-programmes'],
		queryFn: () => getActiveProgrammes(),
	});
};

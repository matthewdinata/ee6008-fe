import { useQuery } from '@tanstack/react-query';

import { checkProgrammeDirector } from '@/utils/actions/faculty/check-programme-director';

export const useCheckProgrammeDirector = () => {
	return useQuery({
		queryKey: ['check-programme-director'],
		queryFn: () => checkProgrammeDirector(),
	});
};

import { useQuery } from '@tanstack/react-query';

import { getProposalsByFacultyId } from '@/utils/actions/faculty/get-proposals-by-faculty-id';

export const useGetProposalsByFacultyId = (facultyId: number) => {
	return useQuery({
		queryKey: ['get-proposals-by-faculty-id', facultyId],
		queryFn: () => getProposalsByFacultyId(facultyId),
	});
};

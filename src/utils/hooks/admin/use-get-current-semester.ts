'use client';

import { useQuery } from '@tanstack/react-query';

import {
	GetActiveSemesterResponseData,
	getActiveSemester,
} from '@/utils/actions/admin/get-active-semester';

export function useGetCurrentSemester() {
	return useQuery<GetActiveSemesterResponseData>({
		queryKey: ['activeSemester'],
		queryFn: () => getActiveSemester(),
		staleTime: 5 * 60 * 1000, // 5 minutes
		refetchOnWindowFocus: false,
	});
}

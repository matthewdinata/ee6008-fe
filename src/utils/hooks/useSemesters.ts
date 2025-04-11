import { useQuery } from '@tanstack/react-query';

import { fetchSemesters } from '@/utils/actions/admin/semester';
import { Semester } from '@/utils/actions/admin/types';

/**
 * Hook to fetch all semesters
 * @returns Query result containing semesters data
 */
export function useSemesters(options?: {
	onSuccess?: (data: Semester[]) => void;
	onError?: (error: unknown) => void;
}) {
	return useQuery({
		queryKey: ['semesters'],
		queryFn: async () => {
			try {
				const response = await fetchSemesters();

				// If it's the wrapped format with success/data properties
				if (response && typeof response === 'object' && 'success' in response) {
					if (response.success && response.data) {
						return response.data;
					}
					throw new Error(response.error || 'Failed to fetch semesters');
				}

				// If it's a direct array
				if (Array.isArray(response)) {
					return response;
				}

				return [];
			} catch (error) {
				console.error('Error in useSemesters queryFn:', error);
				throw error;
			}
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		...options,
	});
}

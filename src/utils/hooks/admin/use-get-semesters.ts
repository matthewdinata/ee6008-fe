import { useQuery } from '@tanstack/react-query';

import { fetchSemesters } from '@/utils/actions/admin/semester';
import { Semester } from '@/utils/actions/admin/types';

export const useGetSemesters = (options?: {
	onSuccess?: (data: Semester[]) => void;
	onError?: (error: unknown) => void;
}) => {
	return useQuery({
		queryKey: ['semesters'],
		queryFn: async () => {
			console.log('useGetSemesters queryFn executing...');
			try {
				const response = await fetchSemesters();
				console.log('fetchSemesters response in hook:', response);

				// Check what type of response we're getting
				console.log('Response type:', typeof response);
				console.log('Is array?', Array.isArray(response));

				// If it's the wrapped format with success/data properties
				if (response && typeof response === 'object' && 'success' in response) {
					console.log('Got wrapped response with success property');
					if (response.success && response.data) {
						return response.data;
					}
					throw new Error(response.error || 'Failed to fetch semesters');
				}

				// If it's a direct array
				if (Array.isArray(response)) {
					return response;
				}

				console.log('Unexpected response format:', response);
				return [];
			} catch (error) {
				console.error('Error in useGetSemesters queryFn:', error);
				throw error;
			}
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
		refetchOnWindowFocus: false, // Prevent refetching when window gains focus
		refetchOnMount: false, // Don't refetch when component mounts
		...options,
	});
};

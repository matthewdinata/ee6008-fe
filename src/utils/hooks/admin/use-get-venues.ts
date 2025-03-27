import { useQuery } from '@tanstack/react-query';

import { Venue, getVenues } from '@/utils/actions/admin/venue';

export const useGetVenues = (options?: {
	onSuccess?: (data: Venue[]) => void;
	onError?: (error: unknown) => void;
	enabled?: boolean;
}) => {
	return useQuery<Venue[]>({
		queryKey: ['venues'],
		queryFn: async () => {
			console.log('useGetVenues queryFn executing...');
			try {
				const response = await getVenues();

				if (!response.success) {
					throw new Error(response.error || 'Failed to fetch venues');
				}

				const data = response.data;

				// Ensure we always return a valid array
				if (!data || !Array.isArray(data)) {
					console.warn('Venues data is not an array, returning empty array');
					return [];
				}

				console.log('Fetched venues:', data);
				return data;
			} catch (error) {
				console.error('Error fetching venues data:', error);
				return []; // Return empty array instead of throwing to avoid breaking the UI
			}
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
		refetchOnWindowFocus: false, // Prevent refetching when window gains focus
		refetchOnMount: false, // Don't refetch when component mounts
		...options,
	});
};

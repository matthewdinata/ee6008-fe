import { useQuery } from '@tanstack/react-query';

import { Venue, getVenuesBySemester } from '@/utils/actions/admin/venue';

/**
 * Hook to fetch venues by semester ID
 * @param semesterId The ID of the semester to fetch venues for
 * @param options Additional query options
 * @returns Query result containing venues data
 */
export const useGetVenuesBySemester = (
	semesterId: number | null,
	options?: {
		onSuccess?: (data: Venue[]) => void;
		onError?: (error: unknown) => void;
		enabled?: boolean;
	}
) => {
	return useQuery<Venue[]>({
		queryKey: ['venues', 'semester', semesterId],
		queryFn: async () => {
			if (!semesterId) {
				return [];
			}

			try {
				const response = await getVenuesBySemester(semesterId);

				if (!response.success) {
					throw new Error(response.error || 'Failed to fetch venues');
				}

				const data = response.data;

				// Ensure we always return a valid array
				if (!data || !Array.isArray(data)) {
					console.warn('Venues data is not an array, returning empty array');
					return [];
				}

				return data;
			} catch (error) {
				console.error(`Error fetching venues for semester ${semesterId}:`, error);
				return []; // Return empty array instead of throwing to avoid breaking the UI
			}
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		enabled: !!semesterId, // Only run the query if semesterId is provided
		...options,
	});
};

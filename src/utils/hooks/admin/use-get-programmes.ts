import { useQuery } from '@tanstack/react-query';

import { getProgrammes } from '@/utils/actions/admin/semester';
import { Programme } from '@/utils/actions/admin/types';

export const useGetProgrammes = (
	semesterId?: number,
	options?: {
		onSuccess?: (data: Programme[]) => void;
		onError?: (error: unknown) => void;
		enabled?: boolean;
	}
) => {
	return useQuery<Programme[]>({
		queryKey: ['programmes', semesterId],
		queryFn: async () => {
			console.log('useGetProgrammes queryFn executing for semester:', semesterId);
			if (!semesterId) {
				console.warn('No semester ID provided to useGetProgrammes');
				return [];
			}

			try {
				const response = await getProgrammes(semesterId);

				if (!response.success) {
					throw new Error(response.error || 'Failed to fetch programmes');
				}

				const data = response.data;

				// Ensure we always return a valid array
				if (!data || !Array.isArray(data)) {
					console.warn('Programmes data is not an array, returning empty array');
					return [];
				}

				console.log(`Loaded ${data.length} programmes for semester ${semesterId}`);
				return data;
			} catch (error) {
				console.error('Error fetching programmes data:', error);
				throw error; // Let React Query handle the error
			}
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
		refetchOnWindowFocus: false, // Prevent refetching when window gains focus
		refetchOnMount: false, // Don't refetch when component mounts
		enabled: !!semesterId && options?.enabled !== false, // Only enable if semesterId exists
		...options,
	});
};

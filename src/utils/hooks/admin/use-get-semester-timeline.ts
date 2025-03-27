import { useQueries, useQuery } from '@tanstack/react-query';

import { getSemesterTimeline } from '@/utils/actions/admin/semester';
import { TimelineEvent } from '@/utils/actions/admin/types';

/**
 * Hook to fetch semester timeline data
 * @param semesterId The ID of the semester to fetch timeline for
 * @param options Optional callbacks for success and error
 * @returns Query result object with data, error, and loading state
 */
export const useGetSemesterTimeline = (
	semesterId: number,
	options?: {
		onSuccess?: (data: TimelineEvent[]) => void;
		onError?: (error: unknown) => void;
	}
) => {
	// Only enable the query if semesterId is valid (positive number)
	const isEnabled = semesterId > 0;

	return useQuery<TimelineEvent[], Error>({
		queryKey: ['semester-timeline', semesterId],
		queryFn: async () => {
			console.log(`useGetSemesterTimeline queryFn executing for semester ${semesterId}...`);

			try {
				const response = await getSemesterTimeline(semesterId);
				console.log(
					`useGetSemesterTimeline received response for semester ${semesterId}:`,
					response
				);

				// If it's the wrapped format with success/data properties
				if (response && typeof response === 'object' && 'success' in response) {
					if (response.success && response.data) {
						const eventData = response.data as TimelineEvent[];
						console.log(
							`useGetSemesterTimeline parsed ${eventData.length} events for semester ${semesterId}`
						);
						return eventData;
					}
					throw new Error(response.error || 'Failed to fetch semester timeline');
				}

				// If it's a direct array
				if (Array.isArray(response)) {
					const eventData = response as TimelineEvent[];
					console.log(
						`useGetSemesterTimeline parsed ${eventData.length} events directly for semester ${semesterId}`
					);
					return eventData;
				}

				// If we couldn't parse the response
				console.error('Unexpected timeline response format:', response);
				throw new Error('Received invalid response format from semester timeline API');
			} catch (error) {
				console.error('Error in useGetSemesterTimeline:', error);
				throw error;
			}
		},
		enabled: isEnabled, // Only run the query if semesterId is valid
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		refetchOnReconnect: false,
		retry: 1,
		...options, // Spread the options object to include onSuccess and onError
	});
};

/**
 * Hook to fetch timeline data for multiple semesters
 * @param semesterIds Array of semester IDs to fetch timelines for
 * @returns Array of query results, one for each semester
 */
export const useGetMultipleSemesterTimelines = (semesterIds: number[]) => {
	return useQueries({
		queries: semesterIds.map((id) => ({
			queryKey: ['semester-timeline', id],
			queryFn: async () => {
				console.log(
					`Fetching timeline for semester ID: ${id} in useGetMultipleSemesterTimelines`
				);
				try {
					const response = await getSemesterTimeline(id);

					// If it's the wrapped format with success/data properties
					if (response && typeof response === 'object' && 'success' in response) {
						if (response.success && response.data) {
							return response.data as TimelineEvent[];
						}
						throw new Error(response.error || 'Failed to fetch semester timeline');
					}

					// If it's a direct array
					if (Array.isArray(response)) {
						return response as TimelineEvent[];
					}

					// If we couldn't parse the response
					throw new Error('Received invalid response format from semester timeline API');
				} catch (error) {
					console.error(`Error fetching timeline for semester ${id}:`, error);
					throw error;
				}
			},
			staleTime: 5 * 60 * 1000, // 5 minutes
			gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
			refetchOnWindowFocus: false,
			refetchOnMount: false,
			refetchOnReconnect: false,
			retry: 1,
			enabled: id > 0, // Only enable if ID is valid
		})),
	});
};

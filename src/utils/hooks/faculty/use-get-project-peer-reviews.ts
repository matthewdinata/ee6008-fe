// utils/hooks/faculty/use-get-project-peer-reviews.ts
import { useQuery } from '@tanstack/react-query';

import { getProjectPeerReviewsClient } from '@/utils/actions/faculty/get-project-peer-reviews';
import { PeerReviewData } from '@/utils/actions/faculty/get-project-peer-reviews';

/**
 * Hook to get peer reviews for a project.
 *
 * @param projectId The ID of the project to fetch peer reviews for.
 * @returns A query object that contains the peer review data or an error.
 */
export const useGetProjectPeerReviews = (projectId: number | null) => {
	console.log(`useGetProjectPeerReviews called with projectId: ${projectId}`);

	return useQuery<PeerReviewData | null, Error>({
		/**
		 * A unique key for the query.
		 * This key is used to identify the query and cache its results.
		 */
		queryKey: ['project-peer-reviews', projectId],
		/**
		 * A function that fetches the peer review data.
		 * This function is called when the query is executed.
		 */
		queryFn: async () => {
			if (!projectId) {
				console.log('No projectId provided, returning null');
				return null;
			}

			console.log(`Fetching peer reviews for project ${projectId}`);
			try {
				const data = await getProjectPeerReviewsClient(projectId);

				if (data) {
					console.log(`Successfully fetched peer reviews for project ${projectId}`);
					console.log('Data structure:', Object.keys(data));
					console.log(`Team members: ${data.team_members?.length || 0}`);
					console.log(`Reviews: ${data.review_pairs?.length || 0}`);
				} else {
					console.log(`No data returned for project ${projectId}`);
				}

				return data;
			} catch (error) {
				console.error(`Error fetching peer reviews for project ${projectId}:`, error);
				throw error;
			}
		},
		/**
		 * A flag that determines whether the query is enabled.
		 * If this flag is false, the query will not be executed.
		 */
		enabled: !!projectId,
		/**
		 * The time in milliseconds after which the query is considered stale.
		 * If the query is stale, it will be refetched.
		 */
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
};

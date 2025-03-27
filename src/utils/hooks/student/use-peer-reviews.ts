import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
	fetchPeerReviewDetails,
	fetchPeerReviewSummary,
	fetchPeerReviews,
	submitPeerReview,
	updatePeerReview,
} from '@/utils/actions/student/peer-review';
import type {
	PeerReviewSubmitRequest,
	PeerReviewUpdateRequest,
} from '@/utils/actions/student/types';

/**
 * Hook to fetch peer reviews for the student's project
 * @param projectId Optional project ID (if not provided, uses student's allocated project)
 * @returns Query result containing peer reviews data
 */
export function usePeerReviews(projectId?: number) {
	return useQuery({
		queryKey: ['peerReviews', projectId],
		queryFn: () => fetchPeerReviews(projectId),
	});
}

/**
 * Hook to fetch details of a specific peer review
 * @param reviewId The ID of the review to fetch
 * @returns Query result containing peer review details
 */
export function usePeerReviewDetails(reviewId: number | undefined) {
	return useQuery({
		queryKey: ['peerReviewDetails', reviewId],
		queryFn: () => fetchPeerReviewDetails(reviewId as number),
		enabled: !!reviewId, // Only run the query if reviewId is provided
	});
}

/**
 * Hook to submit a new peer review
 * @returns Mutation result for submitting a peer review
 */
export function useSubmitPeerReview() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (reviewData: PeerReviewSubmitRequest) => submitPeerReview(reviewData),
		onSuccess: () => {
			// Invalidate the peer reviews query to refetch the data
			queryClient.invalidateQueries({ queryKey: ['peerReviews'] });
		},
	});
}

/**
 * Hook to update an existing peer review
 * @returns Mutation result for updating a peer review
 */
export function useUpdatePeerReview() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			reviewId,
			reviewData,
		}: {
			reviewId: number;
			reviewData: PeerReviewUpdateRequest;
		}) => updatePeerReview(reviewId, reviewData),
		onSuccess: (_, variables) => {
			// Invalidate the specific review query and the peer reviews list
			queryClient.invalidateQueries({ queryKey: ['peerReviewDetails', variables.reviewId] });
			queryClient.invalidateQueries({ queryKey: ['peerReviews'] });
		},
	});
}

/**
 * Hook to fetch the summary of the student's own review status
 * @returns Query result containing peer review summary
 */
export function usePeerReviewSummary() {
	return useQuery({
		queryKey: ['peerReviewSummary'],
		queryFn: fetchPeerReviewSummary,
	});
}

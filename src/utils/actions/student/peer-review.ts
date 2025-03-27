'use server';

import { fetcherFn } from '@/utils/functions';

import {
	PeerReviewDetails,
	PeerReviewSubmitRequest,
	PeerReviewSubmitResponse,
	PeerReviewSummary,
	PeerReviewUpdateRequest,
	PeerReviewsResponse,
} from './types';

/**
 * Fetches all team members and review status for the student's project
 * @param projectId Optional project ID (if not provided, uses student's allocated project)
 * @returns PeerReviewsResponse containing team members and review status
 */
export async function fetchPeerReviews(projectId?: number): Promise<PeerReviewsResponse> {
	try {
		// Construct the URL with optional project_id parameter
		let path = 'student/peer-reviews';
		if (projectId) {
			path += `?project_id=${projectId}`;
		}

		console.log('Fetching peer reviews from path:', path);

		const response = await fetcherFn<PeerReviewsResponse>(path, {
			method: 'GET',
		});

		console.log('Peer reviews API response:', JSON.stringify(response, null, 2));

		return response;
	} catch (error) {
		console.error('Error in fetchPeerReviews:', error);
		throw error;
	}
}

/**
 * Fetches details of a specific peer review
 * @param reviewId The ID of the review to fetch
 * @returns PeerReviewDetails containing the review details
 */
export async function fetchPeerReviewDetails(reviewId: number): Promise<PeerReviewDetails> {
	try {
		console.log(`Fetching peer review details for review ID: ${reviewId}`);

		const response = await fetcherFn<PeerReviewDetails>(`student/peer-reviews/${reviewId}`, {
			method: 'GET',
		});

		console.log('Peer review details response:', JSON.stringify(response, null, 2));

		return response;
	} catch (error) {
		console.error('Error in fetchPeerReviewDetails:', error);
		throw error;
	}
}

/**
 * Submits a new peer review
 * @param reviewData The review data to submit
 * @returns PeerReviewSubmitResponse containing the new review ID
 */
export async function submitPeerReview(
	reviewData: PeerReviewSubmitRequest
): Promise<PeerReviewSubmitResponse> {
	try {
		console.log('Submitting peer review with data:', JSON.stringify(reviewData, null, 2));

		const response = await fetcherFn<PeerReviewSubmitResponse>(
			'student/peer-reviews',
			{
				method: 'POST',
			},
			reviewData
		);

		console.log('Peer review submit response:', JSON.stringify(response, null, 2));

		return response;
	} catch (error) {
		console.error('Error in submitPeerReview:', error);
		throw error;
	}
}

/**
 * Updates an existing peer review
 * @param reviewId The ID of the review to update
 * @param reviewData The updated review data
 * @returns PeerReviewSubmitResponse containing the updated review ID
 */
export async function updatePeerReview(
	reviewId: number,
	reviewData: PeerReviewUpdateRequest
): Promise<PeerReviewSubmitResponse> {
	try {
		return await fetcherFn<PeerReviewSubmitResponse>(
			`student/peer-reviews/${reviewId}`,
			{
				method: 'PATCH',
			},
			reviewData
		);
	} catch (error) {
		console.error('Error in updatePeerReview:', error);
		throw error;
	}
}

/**
 * Fetches the summary of the student's own review status
 * @returns PeerReviewSummary containing the student's review summary
 */
export async function fetchPeerReviewSummary(): Promise<PeerReviewSummary> {
	try {
		return await fetcherFn<PeerReviewSummary>('student/peer-review-summary', {
			method: 'GET',
		});
	} catch (error) {
		console.error('Error in fetchPeerReviewSummary:', error);
		throw error;
	}
}

'use client';

import { Clock, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useCheckPeerReviewPeriod } from '@/utils/hooks/student/use-check-peer-review-period';
import { usePeerReviews } from '@/utils/hooks/student/use-peer-reviews';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

/**
 * This page acts as a redirect to the appropriate edit page with an ID
 * If the user navigates to /student/peer-review/edit, we'll find their reviews
 * and redirect them to the first one that needs editing
 */
export default function EditReviewRedirectPage() {
	const router = useRouter();
	const { data: peerReviews, isLoading: isLoadingReviews } = usePeerReviews();
	const {
		isWithinPeerReviewPeriod,
		timeMessage,
		isLoading: isTimelineLoading,
	} = useCheckPeerReviewPeriod();

	useEffect(() => {
		// First, check if we're within the review period
		if (!isTimelineLoading && !isWithinPeerReviewPeriod) {
			// If outside the period, redirect to main page
			router.push('/student/peer-review');
			return;
		}

		// If we have peer reviews data, find the first review that can be edited
		if (
			!isLoadingReviews &&
			peerReviews &&
			peerReviews.teamMembers &&
			peerReviews.teamMembers.length > 0
		) {
			// Find the first review that has been submitted (has a reviewId)
			const reviewToEdit = peerReviews.teamMembers.find((member) => member.reviewId);

			if (reviewToEdit && reviewToEdit.reviewId) {
				// Redirect to the edit page for this review
				router.push(`/student/peer-review/edit/${reviewToEdit.reviewId}`);
			} else {
				// If no reviews to edit, redirect to the main peer review page
				router.push('/student/peer-review');
			}
		}
	}, [peerReviews, router, isWithinPeerReviewPeriod, isTimelineLoading, isLoadingReviews]);

	// If outside peer review period, show warning
	if (!isTimelineLoading && !isWithinPeerReviewPeriod) {
		return (
			<Alert className="mb-6">
				<Clock className="h-4 w-4" />
				<AlertTitle>Peer Review Period Inactive</AlertTitle>
				<AlertDescription>
					{timeMessage}
					<div className="mt-4">
						<Button onClick={() => router.push('/student/peer-review')}>
							Return to Dashboard
						</Button>
					</div>
				</AlertDescription>
			</Alert>
		);
	}

	// Show loading state while we determine where to redirect
	return (
		<div className="container mx-auto py-6 flex flex-col items-center justify-center min-h-[400px]">
			<Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
			<p className="text-muted-foreground">Finding your reviews...</p>
		</div>
	);
}

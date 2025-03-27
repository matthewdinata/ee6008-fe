'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { usePeerReviews } from '@/utils/hooks/student/use-peer-reviews';

/**
 * This page acts as a redirect to the appropriate edit page with an ID
 * If the user navigates to /student/peer-review/edit, we'll find their reviews
 * and redirect them to the first one that needs editing
 */
export default function EditReviewRedirectPage() {
	const router = useRouter();
	const { data: peerReviews } = usePeerReviews();

	useEffect(() => {
		// If we have peer reviews data, find the first review that can be edited
		if (peerReviews && peerReviews.teamMembers && peerReviews.teamMembers.length > 0) {
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
	}, [peerReviews, router]);

	// Show loading state while we determine where to redirect
	return (
		<div className="container mx-auto py-6 flex flex-col items-center justify-center min-h-[400px]">
			<Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
			<p className="text-muted-foreground">Finding your reviews...</p>
		</div>
	);
}

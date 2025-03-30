'use client';

import { AlertCircle, Clock, Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useCheckPeerReviewPeriod } from '@/utils/hooks/student/use-check-peer-review-period';
import { usePeerReviewDetails } from '@/utils/hooks/student/use-peer-reviews';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

import ReviewForm from '../../components/review-form';

export default function EditReviewPage() {
	const params = useParams();
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);

	// Parse the review ID from the URL params
	const reviewId = params.id ? parseInt(params.id as string, 10) : undefined;

	// Fetch the review details using the custom hook
	const {
		data: reviewDetails,
		isLoading,
		isError,
		error: reviewError,
	} = usePeerReviewDetails(reviewId);

	const {
		isWithinPeerReviewPeriod,
		timeMessage,
		isLoading: isTimelineLoading,
	} = useCheckPeerReviewPeriod();

	// Redirect if outside of peer review period
	useEffect(() => {
		if (!isTimelineLoading && !isWithinPeerReviewPeriod) {
			router.push('/student/peer-review');
		}
	}, [isTimelineLoading, isWithinPeerReviewPeriod, router]);

	// Handle errors and missing data
	useEffect(() => {
		if (isError) {
			setError(
				reviewError instanceof Error ? reviewError.message : 'Failed to load review details'
			);
		} else if (!reviewId) {
			setError('No review ID provided');
		}
	}, [isError, reviewError, reviewId]);

	// Show loading state
	if (isLoading || isTimelineLoading) {
		return (
			<div className="container mx-auto py-6 flex flex-col items-center justify-center min-h-[400px]">
				<Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
				<p className="text-muted-foreground">Loading review details...</p>
			</div>
		);
	}

	// Show timeline restriction message
	if (!isWithinPeerReviewPeriod) {
		return (
			<div className="container mx-auto py-6">
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
			</div>
		);
	}

	// Show error state
	if (error || !reviewDetails) {
		return (
			<div className="container mx-auto py-6">
				<Alert className="mb-6">
					<AlertCircle className="h-4 w-4" />
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>
						{error || 'Unable to load review details'}
						<div className="mt-4">
							<Button onClick={() => router.push('/student/peer-review')}>
								Return to Dashboard
							</Button>
						</div>
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	// Render the review form with the fetched data
	return (
		<div className="container mx-auto py-6">
			<ReviewForm
				reviewId={reviewId}
				isEdit={true}
				projectId={reviewDetails.projectId}
				revieweeId={reviewDetails.revieweeId}
				revieweeName={reviewDetails.revieweeName}
			/>
		</div>
	);
}

'use client';

import { format } from 'date-fns';
import { ArrowLeft, Edit, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { usePeerReviewDetails } from '@/utils/hooks/student/use-peer-reviews';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface ReviewDetailsProps {
	reviewId: number;
}

export default function ReviewDetails({ reviewId }: ReviewDetailsProps) {
	const router = useRouter();
	const { data: review, isLoading, isError, error } = usePeerReviewDetails(reviewId);

	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[400px]">
				<Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
				<p className="text-muted-foreground">Loading review details...</p>
			</div>
		);
	}

	if (isError || !review) {
		return (
			<Alert variant="destructive" className="mb-6">
				<AlertTitle>Error</AlertTitle>
				<AlertDescription>
					{error instanceof Error
						? error.message
						: 'Failed to load review details. Please try again.'}
				</AlertDescription>
				<Button
					variant="outline"
					size="sm"
					onClick={() => router.push('/student/peer-review')}
					className="mt-2"
				>
					Return to Dashboard
				</Button>
			</Alert>
		);
	}

	// Format dates for display
	const submissionDate = new Date(review.submissionDate);
	const lastUpdatedDate = new Date(review.lastUpdatedDate);
	const formattedSubmissionDate = format(submissionDate, 'PPP');
	const formattedSubmissionTime = format(submissionDate, 'p');
	const formattedLastUpdatedDate = format(lastUpdatedDate, 'PPP');
	const formattedLastUpdatedTime = format(lastUpdatedDate, 'p');

	// Determine if the review has been updated after submission
	const hasBeenUpdated = review.submissionDate !== review.lastUpdatedDate;

	return (
		<div className="space-y-6">
			<div className="flex items-center">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => router.push('/student/peer-review')}
					className="mr-2"
				>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Back
				</Button>
				<h1 className="text-2xl font-bold tracking-tight">Review Details</h1>
			</div>

			<Card>
				<CardHeader>
					<div className="flex justify-between items-start">
						<CardTitle>Peer Review for {review.revieweeName}</CardTitle>
						<Badge variant="outline">Score: {review.score}/10</Badge>
					</div>
				</CardHeader>
				<CardContent className="space-y-6">
					<div>
						<h3 className="text-sm font-medium text-muted-foreground mb-2">
							Reviewee Information
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<p className="text-sm font-medium">Name</p>
								<p className="text-sm">{review.revieweeName}</p>
							</div>
							<div>
								<p className="text-sm font-medium">Email</p>
								<p className="text-sm">{review.revieweeEmail}</p>
							</div>
						</div>
					</div>

					<Separator />

					<div>
						<h3 className="text-sm font-medium text-muted-foreground mb-2">
							Review Score
						</h3>
						<div className="flex items-center space-x-2">
							<div className="text-3xl font-bold">{review.score}</div>
							<div className="text-sm text-muted-foreground">out of 10</div>
						</div>
					</div>

					<Separator />

					<div>
						<h3 className="text-sm font-medium text-muted-foreground mb-2">Comments</h3>
						<div className="bg-muted p-4 rounded-md">
							<p className="text-sm whitespace-pre-wrap">{review.comments}</p>
						</div>
					</div>

					<Separator />

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<h3 className="text-sm font-medium text-muted-foreground mb-2">
								Submitted On
							</h3>
							<p className="text-sm">
								{formattedSubmissionDate} at {formattedSubmissionTime}
							</p>
						</div>
						{hasBeenUpdated && (
							<div>
								<h3 className="text-sm font-medium text-muted-foreground mb-2">
									Last Updated
								</h3>
								<p className="text-sm">
									{formattedLastUpdatedDate} at {formattedLastUpdatedTime}
								</p>
							</div>
						)}
					</div>
				</CardContent>
				<CardFooter>
					<Button
						onClick={() => router.push(`/student/peer-review/edit/${review.id}`)}
						className="w-full"
					>
						<Edit className="mr-2 h-4 w-4" />
						Edit Review
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}

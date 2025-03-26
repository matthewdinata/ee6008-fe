'use client';

import { useParams } from 'next/navigation';

import ReviewDetails from '../../components/review-details';

export default function ViewReviewPage() {
	const params = useParams();
	const reviewId = params.id ? parseInt(params.id as string, 10) : 0;

	return (
		<div className="container mx-auto py-6">
			<ReviewDetails reviewId={reviewId} />
		</div>
	);
}

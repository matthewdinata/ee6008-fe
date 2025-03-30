'use client';

import { AlertCircle, Clock, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { TeamMember } from '@/utils/actions/student/types';
import { useCheckPeerReviewPeriod } from '@/utils/hooks/student/use-check-peer-review-period';
import { usePeerReviews } from '@/utils/hooks/student/use-peer-reviews';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

import ReviewForm from '../components/review-form';

export default function NewReviewPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const revieweeId = searchParams.get('revieweeId');
	const [teamMember, setTeamMember] = useState<TeamMember | undefined>(undefined);
	const [error, setError] = useState<string | null>(null);

	const { data: peerReviewsData, isLoading, isError, error: peerReviewsError } = usePeerReviews();
	const {
		isWithinPeerReviewPeriod,
		timeMessage,
		isLoading: isTimelineLoading,
	} = useCheckPeerReviewPeriod();

	useEffect(() => {
		// Redirect to dashboard if outside peer review period
		if (!isTimelineLoading && !isWithinPeerReviewPeriod) {
			router.push('/student/peer-review');
		}
	}, [isTimelineLoading, isWithinPeerReviewPeriod, router]);

	useEffect(() => {
		if (isError) {
			setError(
				peerReviewsError instanceof Error
					? peerReviewsError.message
					: 'Failed to load peer review data'
			);
			return;
		}

		if (!isLoading && peerReviewsData) {
			if (!revieweeId) {
				setError('No team member specified for review');
				return;
			}

			const revieweeIdNum = parseInt(revieweeId, 10);
			const member = peerReviewsData.teamMembers.find((m) => m.id === revieweeIdNum);

			if (!member) {
				setError('Team member not found');
				return;
			}

			if (member.reviewed) {
				setError('You have already reviewed this team member');
				return;
			}

			setTeamMember(member);
		}
	}, [isLoading, isError, peerReviewsData, peerReviewsError, revieweeId]);

	if (isLoading || isTimelineLoading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[400px]">
				<Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
				<p className="text-muted-foreground">Loading...</p>
			</div>
		);
	}

	if (!isWithinPeerReviewPeriod) {
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

	if (error) {
		return (
			<Alert variant="destructive" className="mb-6">
				<AlertCircle className="h-4 w-4" />
				<AlertTitle>Error</AlertTitle>
				<AlertDescription>
					{error}
					<div className="mt-4">
						<Button onClick={() => router.push('/student/peer-review')}>
							Return to Dashboard
						</Button>
					</div>
				</AlertDescription>
			</Alert>
		);
	}

	if (!teamMember) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[400px]">
				<p className="text-muted-foreground">No team member found to review.</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold mb-4">Peer Review for {teamMember.name}</h1>
			<ReviewForm teamMember={teamMember} />
		</div>
	);
}

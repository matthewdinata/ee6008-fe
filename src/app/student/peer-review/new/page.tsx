'use client';

import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { TeamMember } from '@/utils/actions/student/types';
import { usePeerReviews } from '@/utils/hooks/student/use-peer-reviews';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import ReviewForm from '../components/review-form';

export default function NewReviewPage() {
	const searchParams = useSearchParams();
	const revieweeId = searchParams.get('revieweeId');
	const [teamMember, setTeamMember] = useState<TeamMember | undefined>(undefined);
	const [error, setError] = useState<string | null>(null);

	const { data: peerReviewsData, isLoading, isError, error: peerReviewsError } = usePeerReviews();

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
	}, [isLoading, isError, peerReviewsData, revieweeId, peerReviewsError]);

	if (isLoading) {
		return (
			<div className="container mx-auto py-6 flex flex-col items-center justify-center min-h-[400px]">
				<Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
				<p className="text-muted-foreground">Loading...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto py-6">
				<Alert variant="destructive">
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			</div>
		);
	}

	if (!teamMember || !peerReviewsData) {
		return (
			<div className="container mx-auto py-6">
				<Alert variant="destructive">
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>Unable to load team member data</AlertDescription>
				</Alert>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-6">
			<ReviewForm
				revieweeId={teamMember.id}
				revieweeName={teamMember.name}
				projectId={peerReviewsData.projectId}
				teamMember={teamMember}
			/>
		</div>
	);
}

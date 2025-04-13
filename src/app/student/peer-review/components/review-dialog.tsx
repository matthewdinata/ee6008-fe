'use client';

import { AlertCircle, Clock, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { TeamMember } from '@/utils/actions/student/types';
import { useCheckPeerReviewPeriod } from '@/utils/hooks/student/use-check-peer-review-period';
import { usePeerReviewDetails } from '@/utils/hooks/student/use-peer-reviews';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';

import ReviewForm from './review-form';

interface ReviewDialogProps {
	isOpen: boolean;
	onClose: () => void;
	reviewId?: number;
	revieweeId?: number;
	teamMember?: TeamMember;
	projectId?: number;
}

export default function ReviewDialog({
	isOpen,
	onClose,
	reviewId,
	teamMember,
	projectId,
}: ReviewDialogProps) {
	const [error, setError] = useState<string | null>(null);
	const isEdit = !!reviewId;

	// Check if peer review period is active
	const {
		isWithinPeerReviewPeriod,
		timeMessage,
		isLoading: isTimelineLoading,
	} = useCheckPeerReviewPeriod();

	// Fetch review details if editing
	const {
		data: reviewDetails,
		isLoading: isLoadingDetails,
		isError: isErrorDetails,
		error: detailsError,
	} = usePeerReviewDetails(reviewId);

	// Handle errors for edit mode
	useEffect(() => {
		if (isEdit && isErrorDetails) {
			setError(
				detailsError instanceof Error
					? detailsError.message
					: 'Failed to load review details'
			);
		} else if (!isEdit && !teamMember) {
			setError('Team member information is missing');
		} else {
			setError(null);
		}
	}, [isEdit, isErrorDetails, detailsError, teamMember]);

	// Close dialog if outside peer review period
	useEffect(() => {
		if (!isTimelineLoading && !isWithinPeerReviewPeriod) {
			onClose();
		}
	}, [isTimelineLoading, isWithinPeerReviewPeriod, onClose]);

	const isLoading = isTimelineLoading || (isEdit && isLoadingDetails);

	// Content to display in dialog
	const dialogContent = () => {
		if (isLoading) {
			return (
				<div className="flex flex-col items-center justify-center py-8">
					<Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
					<p className="text-muted-foreground">
						{isEdit ? 'Loading review details...' : 'Loading...'}
					</p>
				</div>
			);
		}

		if (!isWithinPeerReviewPeriod) {
			return (
				<Alert className="mb-6">
					<Clock className="h-4 w-4" />
					<AlertTitle>Peer Review Period Inactive</AlertTitle>
					<AlertDescription>{timeMessage}</AlertDescription>
				</Alert>
			);
		}

		if (error) {
			return (
				<Alert variant="destructive" className="mb-6">
					<AlertCircle className="h-4 w-4" />
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			);
		}

		if (isEdit && reviewDetails) {
			return (
				<ReviewForm
					reviewId={reviewId}
					revieweeId={reviewDetails.revieweeId}
					revieweeName={reviewDetails.revieweeName}
					projectId={reviewDetails.projectId}
					isEdit={true}
					onComplete={onClose}
				/>
			);
		}

		if (!isEdit && teamMember && projectId) {
			return (
				<ReviewForm
					revieweeId={teamMember.id}
					revieweeName={teamMember.name}
					projectId={projectId}
					teamMember={teamMember}
					onComplete={onClose}
				/>
			);
		}

		return (
			<Alert variant="destructive" className="mb-6">
				<AlertCircle className="h-4 w-4" />
				<AlertTitle>Error</AlertTitle>
				<AlertDescription>Insufficient data to display the review form.</AlertDescription>
			</Alert>
		);
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{isEdit ? 'Edit Peer Review' : 'New Peer Review'}</DialogTitle>
					<DialogDescription>
						{isEdit
							? `Editing review for ${reviewDetails?.revieweeName || 'team member'}`
							: `Reviewing ${teamMember?.name || 'team member'}`}
					</DialogDescription>
				</DialogHeader>
				{dialogContent()}
			</DialogContent>
		</Dialog>
	);
}

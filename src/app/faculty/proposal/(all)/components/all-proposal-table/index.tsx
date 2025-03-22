'use client';

import { useQueryClient } from '@tanstack/react-query';
import { Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useGetActiveSemesterTimeline } from '@/utils/hooks/faculty/use-get-active-semester-timeline';
import { useGetAllProposals } from '@/utils/hooks/faculty/use-get-all-proposals';
import { useUpdateProposalStatus } from '@/utils/hooks/faculty/use-update-proposal-status';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DataTable } from '@/components/ui/data-table';
import { Skeleton } from '@/components/ui/skeleton';

import { createColumns } from './columns';

export default function AllProposalTable() {
	const queryClient = useQueryClient();
	const { data, isLoading, refetch } = useGetAllProposals();
	const { data: semesterTimeline, isPending: isLoadingSemesterTimeline } =
		useGetActiveSemesterTimeline();

	const [isProcessing, setIsProcessing] = useState(false);
	const [processingId, setProcessingId] = useState<number | null>(null);
	const [isWithinReviewPeriod, setIsWithinReviewPeriod] = useState(false);
	const [timeMessage, setTimeMessage] = useState('');

	const { mutate: updateStatus } = useUpdateProposalStatus();

	// Check if current time is within the admin review period
	useEffect(() => {
		if (semesterTimeline) {
			const now = new Date();
			const startDate = new Date(semesterTimeline.facultyProposalReviewStart);
			const endDate = new Date(semesterTimeline.facultyProposalReviewEnd);

			if (now < startDate) {
				setIsWithinReviewPeriod(false);
				const formattedStartDate = new Intl.DateTimeFormat('en-US', {
					dateStyle: 'full',
					timeStyle: 'long',
				}).format(startDate);
				setTimeMessage(`Proposal review period will begin on ${formattedStartDate}`);
			} else if (now > endDate) {
				setIsWithinReviewPeriod(false);
				setTimeMessage('The proposal review period has ended.');
			} else {
				setIsWithinReviewPeriod(true);
				const formattedEndDate = new Intl.DateTimeFormat('en-US', {
					dateStyle: 'full',
					timeStyle: 'long',
				}).format(endDate);
				setTimeMessage(`Proposal review period ends on ${formattedEndDate}`);
			}
		}
	}, [semesterTimeline]);

	const handleApprove = (proposalId: number) => {
		// Check if we're within the admin period before proceeding
		if (isProcessing || !isWithinReviewPeriod) return;

		setIsProcessing(true);
		setProcessingId(proposalId);

		updateStatus(
			{
				proposalId,
				status: 'approved',
			},
			{
				onSuccess: () => {
					// Show toast
					toast.success('Proposal approved successfully');

					// Force a refresh of the proposals data
					queryClient.invalidateQueries({ queryKey: ['proposals'] });

					refetch();
				},
				onError: (error) => {
					toast.error(
						error instanceof Error ? error.message : 'Failed to approve proposal'
					);
				},
				onSettled: () => {
					setIsProcessing(false);
					setProcessingId(null);
				},
			}
		);
	};

	const handleReject = (proposalId: number, reason: string) => {
		if (isProcessing || !isWithinReviewPeriod) return;

		// Set our local processing state
		setIsProcessing(true);
		setProcessingId(proposalId);

		updateStatus(
			{
				proposalId,
				status: 'rejected',
				reason: reason,
			},
			{
				onSuccess: () => {
					toast.success('Proposal rejected successfully');

					// Force a refresh of the proposals data
					queryClient.invalidateQueries({ queryKey: ['proposals'] });

					refetch();
				},
				onError: (error) => {
					toast.error(
						error instanceof Error ? error.message : 'Failed to reject proposal'
					);
				},
				onSettled: () => {
					setIsProcessing(false);
					setProcessingId(null);
				},
			}
		);
	};

	// Generate columns with our approval/rejection handlers and admin period status
	const columns = createColumns(
		handleApprove,
		handleReject,
		isProcessing || !isWithinReviewPeriod, // Pass combined status to disable buttons
		processingId
	);

	if (isLoading || isLoadingSemesterTimeline) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-24 w-full" />
				<Skeleton className="h-48 w-full" />
			</div>
		);
	}

	return (
		<div className="mx-auto space-y-6">
			{/* Display time-based alert */}
			<Alert className={`${isWithinReviewPeriod ? 'bg-blue-300/10' : 'bg-amber-300/10'}`}>
				<Clock
					className={`h-4 w-4 ${isWithinReviewPeriod ? 'text-blue-600' : 'text-amber-600'}`}
				/>
				<AlertTitle>
					{isWithinReviewPeriod
						? 'Proposal Review Period Active'
						: 'Proposal Review Period Inactive'}
				</AlertTitle>
				<AlertDescription>{timeMessage}</AlertDescription>
			</Alert>
			<DataTable columns={columns} data={data ?? []} filterBy="title" pageSize={6} />
		</div>
	);
}

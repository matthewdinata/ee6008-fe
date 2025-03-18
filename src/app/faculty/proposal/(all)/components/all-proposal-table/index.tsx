'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

import { useGetAllProposals } from '@/utils/hooks/faculty/use-get-all-proposals';
import { useUpdateProposalStatus } from '@/utils/hooks/faculty/use-update-proposal-status';

import { DataTable } from '@/components/ui/data-table';
import { Skeleton } from '@/components/ui/skeleton';

import { createColumns } from './columns';

export default function AllProposalTable() {
	const queryClient = useQueryClient();
	const { data, isLoading, refetch } = useGetAllProposals();

	const [isProcessing, setIsProcessing] = useState(false);
	const [processingId, setProcessingId] = useState<number | null>(null);

	const { mutate: updateStatus } = useUpdateProposalStatus();

	const handleApprove = (proposalId: number) => {
		if (isProcessing) return;

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

	const handleReject = (proposalId: number) => {
		if (isProcessing) return;

		// Set our local processing state
		setIsProcessing(true);
		setProcessingId(proposalId);

		updateStatus(
			{
				proposalId,
				status: 'rejected',
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

	// Generate columns with our approval/rejection handlers
	const columns = createColumns(handleApprove, handleReject, isProcessing, processingId);

	return (
		<div className="mx-auto">
			{isLoading ? (
				<Skeleton className="h-96 w-full" />
			) : (
				<DataTable columns={columns} data={data ?? []} filterBy="title" pageSize={6} />
			)}
		</div>
	);
}

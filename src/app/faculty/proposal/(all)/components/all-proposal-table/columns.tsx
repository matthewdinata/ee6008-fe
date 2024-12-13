'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { Proposal, ProposalStatus } from './types';

export const columns: ColumnDef<Proposal>[] = [
	{
		accessorKey: 'title',
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
					className="px-0 hover:bg-transparent"
				>
					Title
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
	},
	{
		accessorKey: 'semester',
		header: 'Semester',
	},
	{
		accessorKey: 'programme',
		header: 'Programme',
	},
	{
		accessorKey: 'proposer',
		header: 'Proposer',
	},
	{
		accessorKey: 'status',
		header: 'Status',
		cell: ({ row }) => {
			const status = row.original.status;
			let variant: 'outline' | 'outlineSuccess' | 'outlinePending' | 'outlineFail' =
				'outline';

			if (status === ProposalStatus.APPROVED) {
				variant = 'outlineSuccess';
			} else if (status === ProposalStatus.PENDING) {
				variant = 'outlinePending';
			} else if (status === ProposalStatus.REJECTED) {
				variant = 'outlineFail';
			}

			return <Badge variant={variant}>{status}</Badge>;
		},
	},
];

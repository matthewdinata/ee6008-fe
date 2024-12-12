'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Proposal, ProposalStatus } from './types';

export const columns: ColumnDef<Proposal>[] = [
	{
		accessorKey: 'title',
		header: 'Title',
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
		accessorKey: 'reviewer',
		header: 'Reviewer',
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
	{
		id: 'actions',
		enableHiding: false,
		cell: ({ row }) => {
			const proposal = row.original;

			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="h-8 w-8 p-0">
							<span className="sr-only">Open menu</span>
							<MoreHorizontal />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem>Edit</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => console.log(`Deleting proposal (ID: ${proposal.id})`)}
						>
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];

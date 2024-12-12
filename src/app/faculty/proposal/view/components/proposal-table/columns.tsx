'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Proposal } from './types';

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

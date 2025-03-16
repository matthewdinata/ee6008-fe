'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';

import { ProposalStatus } from '@/types/faculty';
import { ProposalResponse } from '@/utils/actions/faculty/get-all-proposals';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const columns: ColumnDef<ProposalResponse>[] = [
	{
		accessorKey: 'title',
		id: 'title',
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
		meta: {
			header: 'Title',
		},
	},
	{
		accessorKey: 'semester.name',
		id: 'semester',
		header: 'Semester',
		cell: ({ row }) => {
			const semesterName = row.original.semester.name;
			const semesterNumber = semesterName.split(' ')[1];
			return <span>{semesterNumber}</span>;
		},
		meta: {
			header: 'Semester',
		},
	},
	{
		accessorKey: 'semester.academicYear',
		id: 'academicYear',
		header: 'Year',
		meta: {
			header: 'Year',
		},
	},
	{
		accessorKey: 'programme.name',
		id: 'programme',
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
					className="px-0 hover:bg-transparent"
				>
					Programme
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
		meta: {
			header: 'Programme',
		},
	},
	{
		accessorKey: 'professor.name',
		id: 'professor',
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
					className="px-0 hover:bg-transparent"
				>
					Proposer
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
		meta: {
			header: 'Proposer',
		},
	},
	{
		accessorKey: 'status',
		id: 'status',
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
					className="px-0 hover:bg-transparent"
				>
					Status
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
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

			return (
				<Badge variant={variant} className="capitalize">
					{status}
				</Badge>
			);
		},
		meta: {
			header: 'Status',
		},
	},
	{
		id: 'actions',
		enableHiding: false,
		cell: ({ row }) => {
			const project = row.original;

			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="h-8 w-8 p-0">
							<span className="sr-only">Open menu</span>
							<MoreHorizontal />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={() => console.log('Viewing', project)}>
							View details
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];

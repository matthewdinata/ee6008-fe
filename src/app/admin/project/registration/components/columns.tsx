'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Registration } from './types';

export const columns: ColumnDef<Registration>[] = [
	{
		accessorKey: 'projectId',
		id: 'projectId',
		header: 'Project ID',
		meta: {
			header: 'Project ID',
		},
	},
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
		accessorKey: 'totalSignUps',
		header: 'Total Sign Ups',
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

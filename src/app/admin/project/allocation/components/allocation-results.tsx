import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

import { Allocation, AllocationData } from '../types';

const columns: ColumnDef<Allocation>[] = [
	{
		accessorKey: 'studentId',
		id: 'studentId',
		accessorFn: (row) => `${row.studentId.toString()}`,
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
					className="px-0 hover:bg-transparent"
				>
					Student ID
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
		meta: {
			header: 'Student ID',
		},
	},
	{
		accessorKey: 'projectId',
		id: 'projectId',
		meta: {
			header: 'Project ID',
		},
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
					className="px-0 hover:bg-transparent"
				>
					Project ID
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
	},
	{
		accessorKey: 'priority',
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
					className="px-0 hover:bg-transparent"
				>
					Priority
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
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

type AllocationResultsProps = {
	data: AllocationData | null;
	isGenerating: boolean;
};

export function AllocationResults({ data, isGenerating }: AllocationResultsProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Allocation Results</CardTitle>
			</CardHeader>
			{/* TODO: Implement the allocation results */}
			<CardContent>
				{isGenerating ? (
					<Skeleton className="w-full h-96" />
				) : (
					data && (
						<DataTable
							columns={columns}
							data={data.allocations}
							filterBy="studentId"
							filterName="student ID"
							pageSize={6}
							// TODO: handle dynamic data
						/>
					)
				)}
			</CardContent>
		</Card>
	);
}

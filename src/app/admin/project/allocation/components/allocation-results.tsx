import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Skeleton } from '@/components/ui/skeleton';

import { Allocation, AllocationData } from '../types';

const columns: ColumnDef<Allocation>[] = [
	{
		accessorKey: 'matriculationNumber',
		id: 'matriculationNumber',
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
					className="px-0 hover:bg-transparent"
				>
					Matric No.
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
		meta: {
			header: 'Matric No.',
		},
	},
	{
		accessorKey: 'name',
		id: 'name',
		meta: {
			header: 'Name',
		},
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
					className="px-0 hover:bg-transparent"
				>
					Name
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
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
							filterBy="name"
							filterName="name"
							pageSize={6}
						/>
					)
				)}
			</CardContent>
		</Card>
	);
}

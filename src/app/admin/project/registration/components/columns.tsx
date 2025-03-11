'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';

import { useGetRegistrationsByProjectId } from '@/utils/hooks/use-get-registrations-by-project-id';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

import { Registration } from './types';

function Details({ projectId }: { projectId: number }) {
	const { data, isLoading, isError } = useGetRegistrationsByProjectId(projectId);

	if (isLoading) return <Skeleton className="h-48 w-full" />;

	if (isError)
		return (
			<div className="bg-red-50 text-red-800 p-4 rounded-md text-sm">
				Failed to load registration data. Please try again later.
			</div>
		);

	return (
		<div className="max-h-[400px] overflow-y-auto">
			<div>
				{data && data.length === 0 && (
					<div className="text-center py-4 text-muted-foreground">
						No registrations made for this project.
					</div>
				)}

				{data && data.length > 0 && (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-[100px]">Matric No.</TableHead>
								<TableHead>Name</TableHead>
								<TableHead>Priority</TableHead>
								<TableHead>Status</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{data.map((reg) => (
								<TableRow key={reg.id}>
									<TableCell key="matriculationNumber" className="font-medium">
										{reg.matriculationNumber}
									</TableCell>
									<TableCell key="name">{reg.name}</TableCell>
									<TableCell key="priority">{reg.priority}</TableCell>
									<TableCell key="status" className="capitalize">
										{reg.status}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</div>
		</div>
	);
}

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
				<Dialog>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="h-8 w-8 p-0">
								<span className="sr-only">Open menu</span>
								<MoreHorizontal />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DialogTrigger asChild>
								<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
									View details
								</DropdownMenuItem>
							</DialogTrigger>
						</DropdownMenuContent>
					</DropdownMenu>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Registration Details</DialogTitle>
							<DialogDescription>
								View the registrations of this project.
							</DialogDescription>
						</DialogHeader>
						<Details projectId={project.projectId} />
						<DialogClose asChild className="mt-1">
							<Button>Close</Button>
						</DialogClose>
					</DialogContent>
				</Dialog>
			);
		},
	},
];

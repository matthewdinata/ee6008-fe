'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';

import { ProposalStatus } from '@/types/faculty';
import { ProposalResponse } from '@/utils/actions/faculty/get-all-proposals';

import { Badge } from '@/components/ui/badge';
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

function ProjectDetails({ project }: { project: ProposalResponse }) {
	if (!project) return <Skeleton className="h-48 w-full" />;

	const getBadgeVariant = (status: ProposalStatus) => {
		if (status === ProposalStatus.APPROVED) {
			return 'outlineSuccess';
		} else if (status === ProposalStatus.PENDING) {
			return 'outlinePending';
		} else if (status === ProposalStatus.REJECTED) {
			return 'outlineFail';
		}
		return 'outline';
	};

	return (
		<div className="max-h-[500px] overflow-y-auto space-y-4">
			<div>
				<h3 className="font-semibold">Professor</h3>
				<p className="text-sm text-muted-foreground">
					{project.professor?.name || 'Unknown Professor'}
				</p>
			</div>

			<div>
				<h3 className="font-semibold">Programme</h3>
				<p className="text-sm text-muted-foreground">{project.programme?.name}</p>
			</div>

			<div>
				<h3 className="font-semibold">Semester & Year</h3>
				<p className="text-sm text-muted-foreground">
					{project.semester?.name}, {project.semester?.academicYear}
				</p>
			</div>

			<div>
				<h3 className="font-semibold">Venue</h3>
				<p className="text-sm text-muted-foreground">{project.venue?.name}</p>
			</div>

			<div>
				<h3 className="font-semibold">Dates</h3>
				<div className="grid grid-cols-2 gap-4 mt-1">
					<div>
						{/* TODO: check timezone */}
						<p className="text-sm">
							{new Date(project.createdAt).toLocaleDateString()}
						</p>
						<p className="text-xs text-muted-foreground">Created</p>
					</div>
					<div>
						<p className="text-sm">
							{new Date(project.updatedAt).toLocaleDateString()}
						</p>
						<p className="text-xs text-muted-foreground">Updated</p>
					</div>
				</div>
			</div>

			<div>
				<h3 className="font-semibold">Status</h3>
				<Badge variant={getBadgeVariant(project.status)} className="capitalize">
					{project.status}
				</Badge>
			</div>

			<div>
				<h3 className="font-semibold">Description</h3>
				<div className="rounded-md bg-secondary p-3">
					<p className="text-sm">{project.description}</p>
				</div>
			</div>
		</div>
	);
}

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
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle>{project.title}</DialogTitle>
							<DialogDescription>Project details and information</DialogDescription>
						</DialogHeader>
						<ProjectDetails project={project} />
						<DialogClose asChild className="mt-4">
							<Button>Close</Button>
						</DialogClose>
					</DialogContent>
				</Dialog>
			);
		},
	},
];

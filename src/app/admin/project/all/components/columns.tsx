'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { createContext, useState } from 'react';

import { Programme, Project, User } from '@/utils/actions/admin/types';

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

import AssignModeratorDialog from './assign-moderator-dialog';

// Create ProgrammeContext
export const ProgrammeContext = createContext<Programme[]>([]);

// Create FacultyContext
export const FacultyContext = createContext<User[]>([]);

// Map the Project status to ProposalStatus equivalent
export enum ProjectStatus {
	APPROVED = 'approved',
	REJECTED = 'rejected',
	PENDING = 'pending',
}

// Enhanced Project type that matches the structure of ProposalResponse
export type EnhancedProject = Project & {
	professor: {
		id: number;
		name: string;
	};
	programme: {
		id: number;
		name: string;
	};
	moderator?: {
		id: number;
		name: string;
	} | null;
	status: ProjectStatus;
};

// Helper function to find faculty by various ID properties
const findFacultyById = (faculty: User[], id: number | null | undefined): User | undefined => {
	if (id === null || id === undefined) return undefined;

	// Try to find faculty by professor_id first (this is from the updated API)
	const byProfessorId = faculty.find((f) => f.professor_id === id);
	if (byProfessorId) {
		return byProfessorId;
	}

	// Fallback to other ID fields for backward compatibility
	const byOtherId = faculty.find(
		(f) =>
			f.id === id ||
			f.userId === id ||
			(f.professor && (f.professor.id === id || f.professor.user_id === id))
	);

	return byOtherId;
};

// Function to get faculty name from ID
export const getFacultyName = (faculty: User[], facultyId: number | null | undefined): string => {
	if (facultyId === null || facultyId === undefined) return 'Not assigned';

	// Check the faculty list
	const user = findFacultyById(faculty, facultyId);
	if (user) {
		return user.name;
	}

	return `Faculty ID: ${facultyId}`;
};

function ProjectDetails({ project }: { project: EnhancedProject }) {
	if (!project) return <Skeleton className="h-48 w-full" />;

	return (
		<div className="max-h-[500px] overflow-y-auto space-y-4">
			<div>
				<h3 className="font-semibold">Supervisor</h3>
				<FacultyContext.Consumer>
					{(faculty) => (
						<p className="text-sm text-muted-foreground">
							{getFacultyName(faculty, project.professor_id)}
						</p>
					)}
				</FacultyContext.Consumer>
			</div>

			<div>
				<h3 className="font-semibold">Moderator</h3>
				<FacultyContext.Consumer>
					{(faculty) => (
						<p className="text-sm text-muted-foreground">
							{getFacultyName(faculty, project.moderator_id)}
						</p>
					)}
				</FacultyContext.Consumer>
			</div>

			<div>
				<h3 className="font-semibold">Programme</h3>
				<ProgrammeContext.Consumer>
					{(programmes) => {
						const programmeId = project.programme_id;
						const programme = programmes.find((p) => p.id === programmeId);
						return (
							<p className="text-sm text-muted-foreground">
								{programme ? programme.name : `Programme ${programmeId}`}
							</p>
						);
					}}
				</ProgrammeContext.Consumer>
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

const ActionCell = ({ project }: { project: EnhancedProject }) => {
	const [isAssignModeratorOpen, setIsAssignModeratorOpen] = useState(false);

	return (
		<>
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
						<DropdownMenuItem
							onSelect={(e) => {
								e.preventDefault();
								setIsAssignModeratorOpen(true);
							}}
						>
							Assign Moderator
						</DropdownMenuItem>
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

			{isAssignModeratorOpen && (
				<AssignModeratorDialog
					open={isAssignModeratorOpen}
					onOpenChange={(open) => setIsAssignModeratorOpen(open)}
					project={project as unknown as Project}
					onAssigned={() => {
						// The update will be handled by the parent component refresh
						setIsAssignModeratorOpen(false);
					}}
				/>
			)}
		</>
	);
};

export const columns: ColumnDef<EnhancedProject>[] = [
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
		accessorKey: 'programme_id',
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
		cell: ({ row }) => {
			return (
				<ProgrammeContext.Consumer>
					{(programmes) => {
						const programmeId = row.original.programme_id;
						const programme = programmes.find((p) => p.id === programmeId);
						return programme ? programme.name : `Programme ${programmeId}`;
					}}
				</ProgrammeContext.Consumer>
			);
		},
		meta: {
			header: 'Programme',
		},
	},
	{
		accessorKey: 'professor_id',
		id: 'supervisor',
		header: 'Supervisor',
		cell: ({ row }) => {
			return (
				<FacultyContext.Consumer>
					{(faculty) => getFacultyName(faculty, row.original.professor_id)}
				</FacultyContext.Consumer>
			);
		},
		meta: {
			header: 'Supervisor',
		},
	},
	{
		accessorKey: 'moderator_id',
		id: 'moderator',
		header: 'Moderator',
		cell: ({ row }) => {
			return (
				<FacultyContext.Consumer>
					{(faculty) => getFacultyName(faculty, row.original.moderator_id)}
				</FacultyContext.Consumer>
			);
		},
		meta: {
			header: 'Moderator',
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
			const status = row.original.status || ProjectStatus.PENDING;
			let variant: 'outline' | 'outlineSuccess' | 'outlinePending' | 'outlineFail' =
				'outline';

			if (status === ProjectStatus.APPROVED) {
				variant = 'outlineSuccess';
			} else if (status === ProjectStatus.PENDING) {
				variant = 'outlinePending';
			} else if (status === ProjectStatus.REJECTED) {
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
			return <ActionCell project={project} />;
		},
	},
];

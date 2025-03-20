'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, BookOpen, MapPin, MoreHorizontal, User } from 'lucide-react';

import { ProjectResponse } from '@/utils/actions/student/get-active-projects';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function ProjectDetails({ project }: { project: ProjectResponse }) {
	if (!project) return <Skeleton className="h-48 w-full" />;

	return (
		<Tabs defaultValue="overview" className="w-full">
			<TabsList className="grid w-full grid-cols-2">
				<TabsTrigger value="overview">Overview</TabsTrigger>
				<TabsTrigger value="details">Details</TabsTrigger>
			</TabsList>
			<TabsContent value="overview" className="mt-4">
				<Card>
					<CardContent className="pt-6 space-y-4">
						<h3 className="font-medium text-lg">{project.title}</h3>

						<div className="flex items-center gap-2">
							<User className="h-4 w-4 text-muted-foreground" />
							<div>
								<p className="text-xs text-muted-foreground">Supervisor</p>
								<p className="text-sm font-medium">
									{project.professor?.name || 'Unassigned'}
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<BookOpen className="h-4 w-4 text-muted-foreground" />
							<div>
								<p className="text-xs text-muted-foreground">Programme</p>
								<p className="text-sm font-medium">
									{project.programme?.name || 'Not specified'}
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<MapPin className="h-4 w-4 text-muted-foreground" />
							<div>
								<p className="text-xs text-muted-foreground">Venue</p>
								<p className="text-sm font-medium">
									{project.venue?.name || 'Not specified'}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</TabsContent>
			<TabsContent value="details" className="mt-4">
				<Card>
					<CardContent className="pt-6 space-y-4">
						<div>
							<p className="text-sm text-muted-foreground mb-2">Description</p>
							{project.description ? (
								<ScrollArea className="h-64 rounded-md border p-4 bg-background">
									<p className="text-sm leading-relaxed">{project.description}</p>
								</ScrollArea>
							) : (
								<p className="text-sm text-muted-foreground">
									No description available
								</p>
							)}
						</div>

						<Separator />

						<div>
							<h3 className="text-sm font-medium">Requirements</h3>
							<ul className="mt-2 space-y-2 text-sm">
								<li className="flex items-start gap-2">
									<div className="h-5 w-5 flex items-center justify-center rounded-full bg-primary/10 text-primary mt-0.5">
										<CheckIcon className="h-3 w-3" />
									</div>
									<span>Prior knowledge of relevant field</span>
								</li>
								<li className="flex items-start gap-2">
									<div className="h-5 w-5 flex items-center justify-center rounded-full bg-primary/10 text-primary mt-0.5">
										<CheckIcon className="h-3 w-3" />
									</div>
									<span>Commitment to project timeline</span>
								</li>
								<li className="flex items-start gap-2">
									<div className="h-5 w-5 flex items-center justify-center rounded-full bg-primary/10 text-primary mt-0.5">
										<CheckIcon className="h-3 w-3" />
									</div>
									<span>Ability to work in a team environment</span>
								</li>
							</ul>
						</div>
					</CardContent>
				</Card>
			</TabsContent>
		</Tabs>
	);
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<polyline points="20 6 9 17 4 12" />
		</svg>
	);
}

export const columns: ColumnDef<ProjectResponse>[] = [
	{
		id: 'select',
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && 'indeterminate')
				}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label="Select all"
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label="Select row"
			/>
		),
		enableSorting: false,
		enableHiding: false,
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
		cell: ({ row }) => {
			const title = row.getValue('title') as string;
			return (
				<div className="flex items-center gap-2">
					<span className="font-medium">{title}</span>
				</div>
			);
		},
	},
	{
		accessorFn: (row) => row.professor?.name || 'Unassigned',
		id: 'supervisor',
		header: () => {
			return (
				<div className="flex items-center gap-2">
					<span>Supervisor</span>
				</div>
			);
		},
		cell: ({ row }) => {
			const supervisor = row.getValue('supervisor') as string;
			return (
				<div className="flex items-center gap-2">
					<span>{supervisor || 'Unassigned'}</span>
				</div>
			);
		},
		meta: {
			header: 'Supervisor',
		},
	},
	{
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
		accessorFn: (row) => row.programme?.name || 'Not specified',
		cell: ({ row }) => {
			const programme = row.getValue('programme') as string;
			return (
				<div className="flex items-center gap-2">
					<span>{programme}</span>
				</div>
			);
		},
		meta: {
			header: 'Programme',
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
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DialogTrigger asChild>
								<DropdownMenuItem
									onSelect={(e) => e.preventDefault()}
									className="cursor-pointer"
								>
									View details
								</DropdownMenuItem>
							</DialogTrigger>
						</DropdownMenuContent>
					</DropdownMenu>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle>Project Details</DialogTitle>
							<DialogDescription>Explore this project opportunity</DialogDescription>
						</DialogHeader>
						<ProjectDetails project={project} />
						<div className="flex justify-end mt-4">
							<DialogClose asChild>
								<Button>Close</Button>
							</DialogClose>
						</div>
					</DialogContent>
				</Dialog>
			);
		},
	},
];

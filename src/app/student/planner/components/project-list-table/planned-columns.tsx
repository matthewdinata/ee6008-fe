'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { PlannedProject } from '@/utils/actions/student/get-planned-projects';
import { useDeleteProjectFromPlanner } from '@/utils/hooks/student/use-delete-project-from-planner';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const ActionsCell = ({ row }: { row: { original: PlannedProject } }) => {
	const { mutate: deleteProject, isPending } = useDeleteProjectFromPlanner();

	const handleDelete = () => {
		deleteProject(row.original.id, {
			onSuccess: () => {
				toast.success(`"${row.original.title}" removed from your plan.`);
			},
			onError: (error) => {
				toast.error(`Failed to remove project: ${error.message}`);
			},
		});
	};

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button variant="ghost" size="icon" onClick={handleDelete} disabled={isPending}>
						<Trash2 className="h-4 w-4 text-destructive" />
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>Remove from plan</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};

export const plannedColumns: ColumnDef<PlannedProject>[] = [
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
		id: 'title',
		cell: ({ row }) => <div className="font-medium">{row.getValue('title')}</div>,
	},
	{
		accessorKey: 'professorName',
		header: 'Supervisor',
		id: 'professorName',
		cell: ({ row }) => <div>{row.getValue('professorName') || 'Unassigned'}</div>,
		meta: {
			header: 'Supervisor',
		},
	},
	{
		accessorKey: 'programmeName',
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
		id: 'programmeName',
		cell: ({ row }) => <div>{row.getValue('programmeName') || 'Not specified'}</div>,
		meta: {
			header: 'Programme',
		},
	},
	{
		enableHiding: false,
		id: 'actions',
		cell: ActionsCell,
	},
];

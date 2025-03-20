'use client';

import { ColumnDef } from '@tanstack/react-table';

import { RegisteredProject } from '@/utils/actions/student/get-registrations';

import { Badge } from '@/components/ui/badge';

export const registeredColumns: ColumnDef<RegisteredProject>[] = [
	{
		accessorKey: 'title',
		header: 'Project Title',
		cell: ({ row }) => {
			const title = row.getValue('title') as string;
			return (
				<div className="font-medium max-w-xs truncate" title={title}>
					{title}
				</div>
			);
		},
	},
	{
		accessorKey: 'professorName',
		header: 'Professor',
		cell: ({ row }) => {
			const professor = row.getValue('professorName') as string;
			return <div className="max-w-[200px] truncate">{professor}</div>;
		},
	},
	{
		accessorKey: 'priority',
		header: 'Priority',
		cell: ({ row }) => {
			const priority = row.getValue('priority') as number;
			return <div className="text-center">{priority}</div>;
		},
	},
	{
		accessorKey: 'status',
		header: 'Status',
		cell: ({ row }) => {
			const status = row.getValue('status') as string;

			let color:
				| 'default'
				| 'destructive'
				| 'secondary'
				| 'outlineSuccess'
				| 'outlinePending'
				| 'outlineFail'
				| null = null;
			switch (status.toLowerCase()) {
				case 'approved':
					color = 'outlineSuccess';
					break;
				case 'pending':
					color = 'outlinePending';
					break;
				case 'rejected':
					color = 'outlineFail';
					break;
				default:
					color = 'default';
			}

			return (
				<Badge variant={color} className="capitalize">
					{status}
				</Badge>
			);
		},
	},
	{
		accessorKey: 'moderatorName',
		header: 'Moderator',
		cell: ({ row }) => {
			const moderator = row.getValue('moderatorName') as string;
			return <div className="max-w-[200px] truncate">{moderator}</div>;
		},
	},
];

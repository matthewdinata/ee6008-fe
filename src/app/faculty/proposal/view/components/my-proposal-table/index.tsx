'use client';

import { useGetProposalsByFacultyId } from '@/utils/hooks/faculty/use-get-proposals-by-faculty-id';

import { DataTable } from '@/components/ui/data-table';
import { Skeleton } from '@/components/ui/skeleton';

import { columns } from './columns';

export default function MyProposalTable() {
	// TODO: replace faculty ID with actual faculty ID
	const { data, isLoading } = useGetProposalsByFacultyId(56);

	return (
		<div className="mx-auto">
			{isLoading ? (
				<Skeleton className="h-96 w-full" />
			) : (
				<DataTable columns={columns} data={data ?? []} filterBy="title" pageSize={6} />
			)}
		</div>
	);
}

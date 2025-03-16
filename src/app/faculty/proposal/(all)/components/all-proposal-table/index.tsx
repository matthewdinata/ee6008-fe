'use client';

import { useGetAllProposals } from '@/utils/hooks/faculty/use-get-all-proposals';

import { DataTable } from '@/components/ui/data-table';
import { Skeleton } from '@/components/ui/skeleton';

import { columns } from './columns';

export default function AllProposalTable() {
	const { data, isLoading } = useGetAllProposals();

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

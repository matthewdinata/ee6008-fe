'use client';

import { useGetMyProposals } from '@/utils/hooks/faculty/use-get-my-proposals';

import { DataTable } from '@/components/ui/data-table';
import { Skeleton } from '@/components/ui/skeleton';

import { columns } from './columns';

export default function MyProposalTable() {
	const { data, isLoading } = useGetMyProposals();

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

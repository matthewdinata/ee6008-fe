'use client';

import { useGetRegistrationsGroupByProjects } from '@/utils/hooks/use-get-registrations-group-by-projects';

import { DataTable } from '@/components/ui/data-table';
import { Skeleton } from '@/components/ui/skeleton';

import { columns } from './columns';

export function RegistrationListDataTable() {
	const { data, isLoading } = useGetRegistrationsGroupByProjects();

	if (isLoading) {
		return <Skeleton className="h-96 w-full" />;
	}

	return (
		data && (
			<DataTable
				columns={columns}
				data={data}
				filterBy="title"
				pageSize={6}
				// TODO: handle dynamic data
			/>
		)
	);
}

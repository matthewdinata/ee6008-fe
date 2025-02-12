'use client';

import { DataTable } from '@/components/ui/data-table';

import { columns } from './columns';
import { Registration } from './types';

interface RegistrationListDataTableProps {
	data: Registration[];
}

export function RegistrationListDataTable({ data }: RegistrationListDataTableProps) {
	return (
		<DataTable
			columns={columns}
			data={data}
			filterBy="title"
			pageSize={6}
			// TODO: handle dynamic data
		/>
	);
}

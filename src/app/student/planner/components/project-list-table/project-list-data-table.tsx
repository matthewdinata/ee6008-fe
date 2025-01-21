'use client';

import { DataTable } from '@/components/ui/data-table';

import { columns } from './columns';
import { Project } from './types';

interface ProjectListDataTableProps {
	data: Project[];
}

export function ProjectListDataTable({ data }: ProjectListDataTableProps) {
	return (
		<DataTable
			columns={columns}
			data={data}
			filterBy="title"
			pageSize={6}
			showRowSelection={true}
			selectionButtonText="Add to plan"
			// TODO: handle dynamic data
			onSelectionButtonClick={(selectedData) => console.log(selectedData)}
		/>
	);
}

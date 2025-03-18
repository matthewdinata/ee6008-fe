'use client';

import { useGetActiveProjects } from '@/utils/hooks/student/use-get-active-projects';

import { DataTable } from '@/components/ui/data-table';

import { columns } from './columns';

export function ProjectListDataTable() {
	const { data } = useGetActiveProjects();
	return (
		<DataTable
			columns={columns}
			data={data ?? []}
			filterBy="title"
			pageSize={6}
			showRowSelection={true}
			selectionButtonText="Add to plan"
			// TODO: handle dynamic data
			onSelectionButtonClick={(selectedData) => console.log(selectedData)}
		/>
	);
}

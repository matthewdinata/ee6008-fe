import { DataTable } from '@/components/ui/data-table';

import { columns } from './columns';
import { Proposal, ProposalStatus } from './types';

async function getData(): Promise<Proposal[]> {
	// TODO: fetch real data
	return Promise.resolve([
		{
			id: '1',
			title: 'AI-Driven Traffic Management System',
			semester: 'Fall 2023',
			programme: 'Computer Science',
			reviewer: 'Dr. Smith',
			status: ProposalStatus.APPROVED,
		},
		{
			id: '2',
			title: 'Renewable Energy Integration in Smart Grids',
			semester: 'Spring 2024',
			programme: 'Electrical Engineering',
			reviewer: 'Dr. Johnson',
			status: ProposalStatus.PENDING,
		},
		{
			id: '3',
			title: 'Autonomous Vehicle Navigation System',
			semester: 'Fall 2023',
			programme: 'Mechanical Engineering',
			reviewer: 'Dr. Brown',
			status: ProposalStatus.REJECTED,
		},
		// ...
	]);
}

export default async function ProposalTable() {
	const data = await getData();

	return (
		<div className="container mx-auto py-10">
			<DataTable columns={columns} data={data} />
		</div>
	);
}

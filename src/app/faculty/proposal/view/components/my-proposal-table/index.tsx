import { DataTable } from '@/components/ui/data-table';

import { columns } from './columns';
import { Proposal, ProposalStatus } from './types';

async function getData(): Promise<Proposal[]> {
	// TODO: fetch real data
	return Promise.resolve([
		{
			id: '1',
			title: 'AI-Powered Healthcare System',
			semester: '24S1',
			programme: 'Biomedical Engineering',
			reviewer: 'Prof. Adams',
			status: ProposalStatus.APPROVED,
		},
		{
			id: '2',
			title: 'Smart Home Automation',
			semester: '24S2',
			programme: 'Electrical Engineering',
			reviewer: 'Assoc. Prof. Baker',
			status: ProposalStatus.PENDING,
		},
		{
			id: '3',
			title: 'Advanced Robotics for Manufacturing',
			semester: '24S1',
			programme: 'Mechanical Engineering',
			reviewer: 'Asst. Prof. Clark',
			status: ProposalStatus.REJECTED,
		},
		{
			id: '4',
			title: 'Blockchain for Supply Chain Management',
			semester: '25S1',
			programme: 'Information Technology',
			reviewer: 'Prof. Davis',
			status: ProposalStatus.APPROVED,
		},
		{
			id: '5',
			title: 'IoT in Urban Farming',
			semester: '24S1',
			programme: 'Agricultural Engineering',
			reviewer: 'Assoc. Prof. Evans',
			status: ProposalStatus.REJECTED,
		},
	]);
}

export default async function MyProposalTable() {
	const data = await getData();

	return (
		<div className="container mx-auto">
			<DataTable columns={columns} data={data} filterBy="title" pageSize={6} />
		</div>
	);
}

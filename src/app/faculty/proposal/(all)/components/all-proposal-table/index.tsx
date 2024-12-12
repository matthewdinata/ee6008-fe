import { DataTable } from '@/components/ui/data-table';

import { columns } from './columns';
import { Proposal, ProposalStatus } from './types';

async function getData(): Promise<Proposal[]> {
	// TODO: fetch real data
	return Promise.resolve([
		{
			id: '1',
			title: 'AI-Driven Traffic Management System',
			semester: '24S1',
			programme: 'Computer Science',
			proposer: 'Prof. Smith',
			status: ProposalStatus.REJECTED,
		},
		{
			id: '2',
			title: 'Renewable Energy Integration in Smart Grids',
			semester: '24S2',
			programme: 'Electrical Engineering',
			proposer: 'Assoc. Prof. Johnson',
			status: ProposalStatus.PENDING,
		},
		{
			id: '3',
			title: 'Autonomous Vehicle Navigation System',
			semester: '24S1',
			programme: 'Mechanical Engineering',
			proposer: 'Dr. Brown',
			status: ProposalStatus.REJECTED,
		},
		{
			id: '4',
			title: 'Blockchain-Based Voting System',
			semester: '24S2',
			programme: 'Information Technology',
			proposer: 'Prof. White',
			status: ProposalStatus.APPROVED,
		},
		{
			id: '5',
			title: 'IoT for Smart Agriculture',
			semester: '24S1',
			programme: 'Agricultural Engineering',
			proposer: 'Assoc. Prof. Green',
			status: ProposalStatus.PENDING,
		},
		{
			id: '6',
			title: 'Cybersecurity in Financial Services',
			semester: '24S2',
			programme: 'Cybersecurity',
			proposer: 'Dr. Black',
			status: ProposalStatus.APPROVED,
		},
		{
			id: '7',
			title: 'Machine Learning for Healthcare Diagnostics',
			semester: '24S1',
			programme: 'Biomedical Engineering',
			proposer: 'Prof. Grey',
			status: ProposalStatus.APPROVED,
		},
		{
			id: '8',
			title: 'Augmented Reality in Education',
			semester: '24S2',
			programme: 'Educational Technology',
			proposer: 'Assoc. Prof. Blue',
			status: ProposalStatus.PENDING,
		},
		{
			id: '9',
			title: 'Quantum Computing Algorithms',
			semester: '24S1',
			programme: 'Computer Science',
			proposer: 'Dr. Violet',
			status: ProposalStatus.REJECTED,
		},
		{
			id: '10',
			title: '5G Network Optimization',
			semester: '24S2',
			programme: 'Telecommunications',
			proposer: 'Prof. Indigo',
			status: ProposalStatus.APPROVED,
		},
		{
			id: '11',
			title: 'Wearable Technology for Health Monitoring',
			semester: '24S1',
			programme: 'Biomedical Engineering',
			proposer: 'Assoc. Prof. Brown',
			status: ProposalStatus.PENDING,
		},
		{
			id: '12',
			title: 'Big Data Analytics in Retail',
			semester: '24S2',
			programme: 'Data Science',
			proposer: 'Dr. Orange',
			status: ProposalStatus.REJECTED,
		},
		{
			id: '13',
			title: 'Robotics for Disaster Management',
			semester: '24S1',
			programme: 'Mechanical Engineering',
			proposer: 'Prof. Yellow',
			status: ProposalStatus.APPROVED,
		},
		// ...
	]);
}

export default async function AllProposalTable() {
	const data = await getData();

	return (
		<div className="container mx-auto">
			<DataTable columns={columns} data={data} filterBy="title" pageSize={6} />
		</div>
	);
}

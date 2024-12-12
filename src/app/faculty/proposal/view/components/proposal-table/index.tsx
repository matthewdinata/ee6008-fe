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
		{
			id: '4',
			title: 'Blockchain-Based Voting System',
			semester: 'Spring 2024',
			programme: 'Information Technology',
			reviewer: 'Dr. White',
			status: ProposalStatus.APPROVED,
		},
		{
			id: '5',
			title: 'IoT for Smart Agriculture',
			semester: 'Fall 2023',
			programme: 'Agricultural Engineering',
			reviewer: 'Dr. Green',
			status: ProposalStatus.PENDING,
		},
		{
			id: '6',
			title: 'Cybersecurity in Financial Services',
			semester: 'Spring 2024',
			programme: 'Cybersecurity',
			reviewer: 'Dr. Black',
			status: ProposalStatus.REJECTED,
		},
		{
			id: '7',
			title: 'Machine Learning for Healthcare Diagnostics',
			semester: 'Fall 2023',
			programme: 'Biomedical Engineering',
			reviewer: 'Dr. Grey',
			status: ProposalStatus.APPROVED,
		},
		{
			id: '8',
			title: 'Augmented Reality in Education',
			semester: 'Spring 2024',
			programme: 'Educational Technology',
			reviewer: 'Dr. Blue',
			status: ProposalStatus.PENDING,
		},
		{
			id: '9',
			title: 'Quantum Computing Algorithms',
			semester: 'Fall 2023',
			programme: 'Computer Science',
			reviewer: 'Dr. Violet',
			status: ProposalStatus.REJECTED,
		},
		{
			id: '10',
			title: '5G Network Optimization',
			semester: 'Spring 2024',
			programme: 'Telecommunications',
			reviewer: 'Dr. Indigo',
			status: ProposalStatus.APPROVED,
		},
		{
			id: '11',
			title: 'Wearable Technology for Health Monitoring',
			semester: 'Fall 2023',
			programme: 'Biomedical Engineering',
			reviewer: 'Dr. Brown',
			status: ProposalStatus.PENDING,
		},
		{
			id: '12',
			title: 'Big Data Analytics in Retail',
			semester: 'Spring 2024',
			programme: 'Data Science',
			reviewer: 'Dr. Orange',
			status: ProposalStatus.REJECTED,
		},
		{
			id: '13',
			title: 'Robotics for Disaster Management',
			semester: 'Fall 2023',
			programme: 'Mechanical Engineering',
			reviewer: 'Dr. Yellow',
			status: ProposalStatus.APPROVED,
		},
		// ...
	]);
}

export default async function ProposalTable() {
	const data = await getData();

	return (
		<div className="container mx-auto">
			<DataTable columns={columns} data={data} filterBy="title" pageSize={6} />
		</div>
	);
}

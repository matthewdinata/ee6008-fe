import { RegistrationListDataTable } from './registration-list-table';
import { Registration } from './types';

async function getData(): Promise<Registration[]> {
	// TODO: fetch real data
	return Promise.resolve([
		{
			id: '1',
			projectId: 'P001',
			title: 'AI-Powered Healthcare System',
			totalSignUps: 10,
		},
		{
			id: '2',
			projectId: 'P002',
			title: 'Smart Home Automation',
			totalSignUps: 15,
		},
		{
			id: '3',
			projectId: 'P003',
			title: 'Advanced Robotics for Manufacturing',
			totalSignUps: 8,
		},
		{
			id: '4',
			projectId: 'P004',
			title: 'Blockchain for Supply Chain Management',
			totalSignUps: 12,
		},
		{
			id: '5',
			projectId: 'P005',
			title: 'IoT in Urban Farming',
			totalSignUps: 20,
		},
		{
			id: '6',
			projectId: 'P006',
			title: 'Renewable Energy Systems',
			totalSignUps: 18,
		},
		{
			id: '7',
			projectId: 'P007',
			title: 'Cybersecurity in Financial Services',
			totalSignUps: 25,
		},
		{
			id: '8',
			projectId: 'P008',
			title: 'Autonomous Vehicle Technology',
			totalSignUps: 22,
		},
		{
			id: '9',
			projectId: 'P009',
			title: 'Wearable Health Monitoring Devices',
			totalSignUps: 30,
		},
		{
			id: '10',
			projectId: 'P010',
			title: 'Big Data Analytics for Smart Cities',
			totalSignUps: 17,
		},
	]);
}

export default async function RegistrationListTable() {
	const data = await getData();

	return (
		<div className="mx-auto">
			<RegistrationListDataTable data={data} />
		</div>
	);
}

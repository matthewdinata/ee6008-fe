import { ProjectListDataTable } from './project-list-data-table';
import { Project } from './types';

async function getData(): Promise<Project[]> {
	// TODO: fetch real data
	return Promise.resolve([
		{
			id: '1',
			title: 'AI-Powered Healthcare System',
			semester: '24S1',
			faculty: 'Prof. Adams',
			programme: 'Biomedical Engineering',
		},
		{
			id: '2',
			title: 'Smart Home Automation',
			semester: '24S2',
			faculty: 'Assoc. Prof. Baker',
			programme: 'Electrical Engineering',
		},
		{
			id: '3',
			title: 'Advanced Robotics for Manufacturing',
			semester: '24S1',
			faculty: 'Asst. Prof. Clark',
			programme: 'Mechanical Engineering',
		},
		{
			id: '4',
			title: 'Blockchain for Supply Chain Management',
			semester: '25S1',
			faculty: 'Prof. Davis',
			programme: 'Information Technology',
		},
		{
			id: '5',
			title: 'IoT in Urban Farming',
			semester: '24S1',
			faculty: 'Assoc. Prof. Evans',
			programme: 'Agricultural Engineering',
		},
		{
			id: '6',
			title: 'Renewable Energy Systems',
			semester: '25S2',
			faculty: 'Prof. Foster',
			programme: 'Environmental Engineering',
		},
		{
			id: '7',
			title: 'Cybersecurity in Financial Services',
			semester: '24S2',
			faculty: 'Assoc. Prof. Green',
			programme: 'Computer Science',
		},
		{
			id: '8',
			title: 'Autonomous Vehicle Technology',
			semester: '25S1',
			faculty: 'Asst. Prof. Harris',
			programme: 'Automotive Engineering',
		},
		{
			id: '9',
			title: 'Wearable Health Monitoring Devices',
			semester: '24S1',
			faculty: 'Prof. Johnson',
			programme: 'Biomedical Engineering',
		},
		{
			id: '10',
			title: 'Big Data Analytics for Smart Cities',
			semester: '25S2',
			faculty: 'Assoc. Prof. King',
			programme: 'Data Science',
		},
	]);
}

export default async function ProjectListTable() {
	const data = await getData();

	return (
		<div className="mx-auto">
			<ProjectListDataTable data={data} />
		</div>
	);
}

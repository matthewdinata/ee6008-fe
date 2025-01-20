import React from 'react';

import ProjectSortablePriority from './components/project-sortable-priority';

const mockProjects = [
	{
		id: '1',
		title: 'AI-Powered Healthcare System',
		faculty: 'Prof. Adams',
		programme: 'Biomedical Engineering',
	},
	{
		id: '2',
		title: 'Smart Home Automation',
		faculty: 'Assoc. Prof. Baker',
		programme: 'Electrical Engineering',
	},
	{
		id: '3',
		title: 'Advanced Robotics for Manufacturing',
		faculty: 'Asst. Prof. Clark',
		programme: 'Mechanical Engineering',
	},
	{
		id: '4',
		title: 'Blockchain for Supply Chain Management',
		faculty: 'Prof. Davis',
		programme: 'Information Technology',
	},
	{
		id: '5',
		title: 'IoT in Urban Farming',
		faculty: 'Assoc. Prof. Evans',
		programme: 'Agricultural Engineering',
	},
	{
		id: '6',
		title: 'Renewable Energy Systems',
		faculty: 'Prof. Foster',
		programme: 'Environmental Engineering',
	},
	{
		id: '7',
		title: 'Cybersecurity in Financial Services',
		faculty: 'Assoc. Prof. Green',
		programme: 'Computer Science',
	},
];

const ProjectRegistration = () => {
	return (
		<div>
			<p className="text-muted-foreground mb-4 text-sm">
				Select up to 5 projects in order of preference.
				<br />
				Click and drag any project card to reorder priorities.
			</p>

			<ProjectSortablePriority initialProjects={mockProjects} />
		</div>
	);
};

export default ProjectRegistration;

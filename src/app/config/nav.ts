import {
	CalendarCog,
	FileSliders,
	FileUser,
	FolderGit2,
	FolderOpenDot,
	SquareRadical,
	UserRoundPen,
} from 'lucide-react';

import { NavMainItemsConfig } from '@/components/layout/nav-main';

// TODO: use dynamic user config
export const userConfig = {
	name: 'shadcn',
	email: 'm@example.com',
	avatar: '/avatars/shadcn.jpg',
};

export const navConfig: NavMainItemsConfig = {
	student: [
		{
			title: 'Registration',
			icon: FileUser,
			items: [
				{
					title: 'Planner',
					url: '/student/planner',
					headerTitle: 'Registration Planner',
					headerSubtitle: 'Plan your registration for the upcoming semester',
				},
				{
					title: 'Registration',
					url: '/student/registration',
					headerTitle: 'Course Registration',
					headerSubtitle: 'Register for your selected projects',
				},
			],
		},
		{
			title: 'Project Management',
			icon: FolderGit2,
			items: [
				{
					title: 'Allocated project',
					url: '/student/allocated-project',
					headerTitle: 'Your Allocated Project',
					headerSubtitle: 'View and manage your assigned project',
				},
				{
					title: 'Peer review',
					url: '/student/peer-review',
					headerTitle: 'Project Peer Review',
					headerSubtitle: 'Review and provide feedback on peers',
				},
			],
		},
	],
	faculty: [
		{
			title: 'Proposal',
			icon: FileSliders,
			items: [
				{
					title: 'Add proposal',
					url: '/faculty/proposal/add',
					headerTitle: 'Create New Proposal',
					headerSubtitle: 'Submit a new project proposal',
				},
				{
					title: 'My proposals',
					url: '/faculty/proposal/view',
					headerTitle: 'My Project Proposals',
					headerSubtitle: 'View and manage your submitted proposals',
				},
				{
					title: 'All proposals',
					url: '/faculty/proposal',
					headerTitle: 'All Project Proposals',
					headerSubtitle: 'Browse all submitted project proposals',
				},
			],
		},
		{
			title: 'Project',
			icon: FolderOpenDot,
			items: [
				{
					title: 'My projects',
					url: '/faculty/project/view',
					headerTitle: 'My Active Projects',
					headerSubtitle: 'View and manage your ongoing projects',
				},
				{
					title: 'All projects',
					url: '/faculty/project/all',
					headerTitle: 'All Active Projects',
					headerSubtitle: 'Overview of all ongoing projects',
				},
			],
		},
		{
			title: 'Grade',
			icon: SquareRadical,
			items: [
				{
					title: 'Evaluation',
					url: '/faculty/grade/evaluation',
					headerTitle: 'Project Evaluation',
					headerSubtitle: 'Grade and provide feedback on student projects',
				},
				{
					title: 'Analytics',
					url: '/faculty/grade/analytics',
					headerTitle: 'Grade Analytics',
					headerSubtitle: 'View statistical analysis of project grades',
				},
			],
		},
	],
	admin: [
		{
			title: 'User',
			icon: UserRoundPen,
			items: [
				{
					title: 'Faculty',
					url: '/admin/user/faculty',
					headerTitle: 'Faculty Management',
					headerSubtitle: 'Manage faculty accounts and permissions',
				},
				{
					title: 'Student',
					url: '/admin/user/student',
					headerTitle: 'Student Management',
					headerSubtitle: 'Manage student accounts and enrollments',
				},
			],
		},
		{
			title: 'Semester',
			icon: CalendarCog,
			items: [
				{
					title: 'Manage',
					url: '/admin/semester/manage',
					headerTitle: 'Semester Management',
					headerSubtitle: 'Configure semester settings and timelines',
				},
				{
					title: 'Venue details',
					url: '/admin/semester/venue',
					headerTitle: 'Venue Configuration',
					headerSubtitle: 'Manage venue details and availability',
				},
			],
		},
		{
			title: 'Project',
			icon: FolderOpenDot,
			items: [
				{
					title: 'Approved projects',
					url: '/admin/project/all',
					headerTitle: 'Approved Projects List',
					headerSubtitle: 'View all approved project proposals',
				},
				{
					title: 'Student registrations',
					url: '/admin/project/registration',
					headerTitle: 'Project Registrations',
					headerSubtitle: 'Manage active students',
				},
				{
					title: 'Generate allocation',
					url: '/admin/project/allocation',
					headerTitle: 'Project Allocation',
					headerSubtitle: 'Generate and manage project allocations',
				},
			],
		},
	],
};

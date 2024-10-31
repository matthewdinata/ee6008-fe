import {
	CalendarCog,
	FileSliders,
	FileUser,
	FolderGit2,
	FolderOpenDot,
	SquareRadical,
	UserRoundPen,
} from 'lucide-react';

import { NavMainItemsConfig } from '@/components/nav-main';

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
				},
				{
					title: 'Registration',
					url: '/student/registration',
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
				},
				{
					title: 'Peer review',
					url: '/student/peer-review',
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
				},
				{
					title: 'My proposals',
					url: '/faculty/proposal/view',
				},
				{
					title: 'All proposals',
					url: '/faculty/proposal/all',
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
				},
				// Show full data only to programme directors; otherwise show only project names
				{
					title: 'All projects',
					url: '/faculty/project/all',
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
				},
				{
					title: 'Analytics',
					url: '/faculty/grade/analytics',
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
				},
				{
					title: 'Student',
					url: '/admin/user/student',
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
				},
				{
					title: 'Venue details',
					url: '/admin/semester/venue',
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
				},
				{
					title: 'Student registrations',
					url: '/admin/project/registration',
				},
				{
					title: 'Generate allocation',
					url: '/admin/project/allocation',
				},
			],
		},
	],
};

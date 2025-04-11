import {
	CalendarCog,
	FileSliders,
	FileUser,
	FolderGit2,
	FolderOpenDot,
	Mail,
	SquareRadical,
	UserRoundPen,
} from 'lucide-react';

import { NavMainItemsConfig } from '@/components/layout/nav-main';

export type UserSession = {
	name?: string;
	email?: string;
	avatar_url?: string;
};

// Function to generate user config from session
export const getUserConfig = (session: UserSession) => ({
	name: session.name || 'Anonymous User',
	email: session.email || 'no-email@example.com',
	avatar: session.avatar_url || '/avatars/default.jpg',
});

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
					headerTitle: 'Project Registration',
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
					excludeChildrenFromNav: true,
					children: [
						{
							title: 'Edit Review',
							url: '/student/peer-review/edit/[id]',
							headerTitle: 'Edit Peer Review',
							headerSubtitle: 'Update your feedback for team members',
							dynamic: true,
						},
						{
							title: 'New Review',
							url: '/student/peer-review/new',
							headerTitle: 'New Peer Review',
							headerSubtitle: 'Provide feedback for team members',
						},
						{
							title: 'View Review',
							url: '/student/peer-review/view',
							headerTitle: 'View Peer Review',
							headerSubtitle: 'View your submitted feedback',
						},
					],
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
		{
			title: 'Email',
			icon: Mail,
			items: [
				{
					title: 'Template Management',
					url: '/faculty/email',
					headerTitle: 'Template Management',
					headerSubtitle: 'Create and manage email templates and notifications',
				},
				{
					title: 'Email Manager',
					url: '/faculty/manual',
					headerTitle: 'Email Manager',
					headerSubtitle: 'Send and schedule emails to students and faculty',
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
					title: 'Manage faculty',
					url: '/admin/user/faculty',
					headerTitle: 'Faculty Management',
					headerSubtitle: 'Manage faculty accounts and permissions',
				},
				{
					title: 'Manage students',
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
					title: 'Manage semester',
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
					headerSubtitle: 'View and manage student project registrations',
				},
				{
					title: 'Generate allocation',
					url: '/admin/project/allocation',
					headerTitle: 'Project Allocation',
					headerSubtitle: 'Generate and manage project allocations',
				},
			],
		},
		{
			title: 'Grade',
			icon: SquareRadical,
			items: [
				{
					title: 'View Project Grades',
					url: '/admin/grade/evaluation',
					headerTitle: 'Project Evaluation',
					headerSubtitle: 'Grade and provide feedback on student projects',
				},
				{
					title: 'View Grades Analytics',
					url: '/admin/grade/analytics',
					headerTitle: 'Grade Analytics',
					headerSubtitle: 'View statistical analysis of project grades',
				},
			],
		},
		{
			title: 'Email',
			icon: Mail,
			items: [
				{
					title: 'Template Management',
					url: '/admin/email',
					headerTitle: 'Email Template Management',
					headerSubtitle: 'Create and manage email templates and notifications',
				},
				{
					title: 'Email Manager',
					url: '/admin/manual',
					headerTitle: 'Email Manager',
					headerSubtitle: 'Send and schedule emails to students and faculty',
				},
			],
		},
	],
};

import { Bot, SquareTerminal } from 'lucide-react';

import { NavMainItemsConfig } from '@/components/nav-main';

// TODO: use dynamic user config
export const userConfig = {
	name: 'shadcn',
	email: 'm@example.com',
	avatar: '/avatars/shadcn.jpg',
};

// TODO: update real routes
export const navConfig: NavMainItemsConfig = {
	student: [
		{
			title: 'Playground',
			icon: SquareTerminal,
			items: [
				{
					title: 'History',
					url: '/student/history',
				},
				{
					title: 'Starred',
					url: '/student/starred',
				},
				{
					title: 'Settings',
					url: '/student/settings',
				},
			],
		},
		{
			title: 'Models',
			icon: Bot,
			items: [
				{
					title: 'Genesis',
					url: '/student/genesis',
				},
				{
					title: 'Explorer',
					url: '/student/explorer',
				},
				{
					title: 'Mechanics',
					url: '/student/mechanics',
				},
			],
		},
	],
	faculty: [
		{
			title: 'Models',
			icon: Bot,
			items: [
				{
					title: 'Genesis',
					url: '/faculty/genesis',
				},
				{
					title: 'Explorer',
					url: '/faculty/explorer',
				},
				{
					title: 'Quantum',
					url: '/faculty/quantum',
				},
			],
		},
	],
	admin: [
		{
			title: 'Playground',
			icon: SquareTerminal,
			items: [
				{
					title: 'History',
					url: '/admin/history',
				},
				{
					title: 'Starred',
					url: '/admin/starred',
				},
				{
					title: 'Settings',
					url: '/admin/settings',
				},
			],
		},
	],
};

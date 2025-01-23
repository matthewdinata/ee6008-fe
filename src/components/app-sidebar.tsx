'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { FolderRoot } from 'lucide-react';
import * as React from 'react';
import { useEffect, useState } from 'react';

import NavMain from '@/components/nav-main';
import NavUser from '@/components/nav-user';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from '@/components/ui/sidebar';

import { navConfig } from '@/app/config/nav';

interface User {
	id: number;
	name: string;
	email: string;
	role: string;
	created_at: string;
	updated_at: string;
}

export default function AppSidebar({
	role,
	...props
}: React.ComponentProps<typeof Sidebar> & { role: string }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const supabase = createClientComponentClient();

	useEffect(() => {
		const fetchUserData = async () => {
			try {
				const {
					data: { session },
				} = await supabase.auth.getSession();

				if (session) {
					const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify`, {
						method: 'POST',
						headers: {
							Authorization: `Bearer ${session.access_token}`,
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							email: session.user.email,
							name: session.user.email?.split('@')[0],
							userId: session.user.id,
						}),
					});

					if (!response.ok) {
						throw new Error('Failed to fetch user data');
					}

					const data = await response.json();
					setUser(data.user);
				}
			} catch (error) {
				console.error('Error fetching user data:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchUserData();
	}, [supabase.auth]);

	// Generate user config from fetched data
	const userConfig = React.useMemo(
		() => ({
			name: user?.name || 'Loading...',
			email: user?.email || '',
			avatar: '/avatars/default.jpg',
			role: user?.role, // You can add avatar_url to your User interface if available
		}),
		[user]
	);

	if (loading) {
		return null; // Or a loading spinner if you prefer
	}

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<a href={`/${role}`}>
							<SidebarMenuButton
								size="lg"
								className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-default"
							>
								<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
									<FolderRoot />
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight font-semibold">
									EE6008
								</div>
							</SidebarMenuButton>
						</a>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={navConfig} role={role} />
			</SidebarContent>
			<SidebarFooter className="flex flex-row justify-between">
				<NavUser user={userConfig} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}

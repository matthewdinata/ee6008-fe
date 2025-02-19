'use client';

import { FolderRoot } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';

import { useAuth } from '@/components/AuthProvider';
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
import { Skeleton } from '@/components/ui/skeleton';

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
	const { user: authUser, isLoading } = useAuth();
	const [user, setUser] = useState<User | null>(null);
	// Add a state to track whether we've already fetched user data
	const hasFetchedRef = useRef(false);
	const pathname = usePathname();

	useEffect(() => {
		// Only fetch once and only when auth is loaded
		if (!isLoading && authUser?.email && !hasFetchedRef.current) {
			const fetchBackendUser = async () => {
				try {
					// Use session token from cookies
					const sessionToken = document.cookie
						.split('; ')
						.find((row) => row.startsWith('session-token='))
						?.split('=')[1];

					if (!sessionToken) {
						console.warn('No session token found in cookies');
						return;
					}

					const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify`, {
						method: 'POST',
						headers: {
							Authorization: `Bearer ${sessionToken}`,
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							email: authUser.email,
							name: authUser.email?.split('@')[0],
							userId: authUser.id,
						}),
					});

					if (!response.ok) {
						throw new Error('Failed to fetch user data');
					}

					const data = await response.json();
					setUser(data.user);
					// Mark that we've fetched the data using ref
					hasFetchedRef.current = true;
				} catch (error) {
					console.error('Error fetching user data:', error);
				}
			};

			fetchBackendUser();
		}
	}, [isLoading, authUser]); // Remove hasFetched from dependencies since we're using a ref

	// Generate user config from fetched data
	const userConfig = React.useMemo(
		() => ({
			name: user?.name || authUser?.email?.split('@')[0] || 'Loading...',
			email: user?.email || authUser?.email || '',
			avatar: '/avatars/default.jpg',
			role: user?.role || role,
		}),
		[user, authUser, role]
	);

	// Only show skeleton on initial load, not on subsequent navigations
	if (isLoading && !hasFetchedRef.current) {
		return (
			<Sidebar collapsible="icon" {...props}>
				{/* Skeleton content */}
				<SidebarHeader>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton size="lg">
								<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary/50 text-sidebar-primary-foreground/50">
									<FolderRoot />
								</div>
								<Skeleton className="h-5 w-20" />
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarHeader>
				<SidebarContent>
					<div className="px-3 py-2">
						<Skeleton className="h-7 w-full mb-2" />
						<Skeleton className="h-7 w-full mb-2" />
						<Skeleton className="h-7 w-full" />
					</div>
				</SidebarContent>
				<SidebarFooter>
					<div className="p-3">
						<Skeleton className="h-10 w-full" />
					</div>
				</SidebarFooter>
				<SidebarRail />
			</Sidebar>
		);
	}

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						{/* Replace <a> with Next.js Link to avoid full page reloads */}
						<Link href={`/${userConfig.role?.toLowerCase() || role}`}>
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
						</Link>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				{/* Pass the current pathname to help with active state */}
				<NavMain
					items={navConfig}
					role={userConfig.role?.toLowerCase() || role}
					currentPath={pathname}
				/>
			</SidebarContent>
			<SidebarFooter className="flex flex-row justify-between">
				<NavUser user={userConfig} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}

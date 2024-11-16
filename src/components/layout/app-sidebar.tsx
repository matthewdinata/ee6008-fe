'use client';

import { FolderRoot } from 'lucide-react';
import * as React from 'react';

import NavMain from '@/components/layout/nav-main';
import NavUser from '@/components/layout/nav-user';
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

import { navConfig, userConfig } from '@/app/config/nav';

export default function AppSidebar({
	role,
	...props
}: React.ComponentProps<typeof Sidebar> & { role: string }) {
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
				{/* TODO: use dynamic user config */}
				<NavUser user={userConfig} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}

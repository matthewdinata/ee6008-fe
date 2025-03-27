'use client';

import { ChevronRight } from 'lucide-react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from '@/components/ui/sidebar';

export type NavSubItem = {
	title: string;
	url: string;
	headerTitle?: string;
	headerSubtitle?: string;
	children?: NavSubItem[];
	excludeChildrenFromNav?: boolean;
	dynamic?: boolean;
};

export type NavItem = {
	title: string;
	icon: React.ComponentType;
	items: NavSubItem[];
};

export type NavMainItemsConfig = {
	[role: string]: NavItem[];
};

export default function NavMain({ items, role }: { items: NavMainItemsConfig; role: string }) {
	return (
		<SidebarGroup>
			<SidebarGroupLabel>
				<span className="capitalize">{role}</span>
			</SidebarGroupLabel>
			<SidebarMenu>
				{items[role].map((item) => (
					<Collapsible key={item.title} asChild defaultOpen className="group/collapsible">
						<SidebarMenuItem>
							<CollapsibleTrigger asChild>
								<SidebarMenuButton tooltip={item.title}>
									{item.icon && <item.icon />}
									<span>{item.title}</span>
									<ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
								</SidebarMenuButton>
							</CollapsibleTrigger>
							<CollapsibleContent>
								<SidebarMenuSub>
									{item.items?.map((subItem) => (
										<SidebarMenuSubItem key={subItem.title}>
											<SidebarMenuSubButton asChild>
												<a href={subItem.url}>
													<span>{subItem.title}</span>
												</a>
											</SidebarMenuSubButton>
										</SidebarMenuSubItem>
									))}
								</SidebarMenuSub>
							</CollapsibleContent>
						</SidebarMenuItem>
					</Collapsible>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}

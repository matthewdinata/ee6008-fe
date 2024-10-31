'use client';

import { usePathname } from 'next/navigation';
import React from 'react';

import { cn } from '@/lib/utils';

import { NavItem, NavSubItem } from '@/components/nav-main';

import { navConfig } from '@/app/config/nav';

function findSubItemByUrl(items: NavSubItem[], url: string): NavSubItem | undefined {
	return items.find((item) => item.url === url);
}

function findItemByUrl(items: NavItem[], url: string): NavSubItem | undefined {
	for (const item of items) {
		const found = findSubItemByUrl(item.items, url);
		if (found) return found;
	}
	return undefined;
}

function isValidPath(config: NavItem[], fullPath: string): boolean {
	// Special case for role-level path (e.g., /student, /faculty)
	if (fullPath.split('/').filter(Boolean).length === 1) {
		return true;
	}
	return findItemByUrl(config, fullPath) !== undefined;
}

export default function AppHeader({ className }: { className?: string }) {
	const pathname = usePathname();
	const pathSegments = pathname.split('/').filter(Boolean);

	const role = pathSegments[0];
	const config = navConfig[role as keyof typeof navConfig];
	const isValidRole = config !== undefined;

	// Get the current page's header information
	const currentPageInfo = React.useMemo(() => {
		// Handle invalid role
		if (!isValidRole) {
			return {
				title: 'EE6008',
				subtitle: 'Project Management System',
			};
		}

		// Check if the path is valid
		const isPathValid = isValidPath(config, pathname);
		if (!isPathValid) {
			// TODO: update title and subtitle
			return {
				title: 'EE6008',
				subtitle: 'Project Management System',
			};
		}

		// Handle role-level pages (e.g., /student, /faculty)
		if (pathSegments.length === 1) {
			return {
				title: role.charAt(0).toUpperCase() + role.slice(1),
				subtitle: 'Dashboard',
			};
		}

		// Get page info for valid routes
		const navItem = findItemByUrl(config, pathname);
		return {
			title: navItem?.headerTitle || navItem?.title || 'Unknown Page',
			subtitle: navItem?.headerSubtitle,
		};
	}, [pathname, config, isValidRole, role, pathSegments.length]);

	return (
		<div className={cn('flex items-start justify-between gap-1', className)}>
			<div className="flex min-w-0 flex-col">
				<h1 className="text-2xl font-semibold md:text-3xl">{currentPageInfo.title}</h1>
				{currentPageInfo.subtitle && (
					<p className="text-muted-foreground">{currentPageInfo.subtitle}</p>
				)}
			</div>
		</div>
	);
}

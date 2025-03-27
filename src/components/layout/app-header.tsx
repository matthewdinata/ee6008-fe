'use client';

import { usePathname } from 'next/navigation';
import React from 'react';

import { cn } from '@/lib/utils';

import { NavItem, NavSubItem } from '@/components/layout/nav-main';

import { navConfig } from '@/app/config/nav';

function findSubItemByUrl(items: NavSubItem[], url: string): NavSubItem | undefined {
	// First try exact match
	const exactMatch = items.find((item) => item.url === url);
	if (exactMatch) return exactMatch;

	// Then try dynamic routes
	for (const item of items) {
		// Check if this is a dynamic route and if the URL matches the pattern
		if (item.dynamic && item.url) {
			// Convert dynamic route pattern to regex
			// e.g., '/student/peer-review/edit/[id]' -> /^\/student\/peer-review\/edit\/[^\/]+$/
			const pattern = item.url.replace(/\[\w+\]/g, '[^/]+');
			const regex = new RegExp(`^${pattern.replace(/\//g, '\\/')}$`);

			if (regex.test(url)) {
				return item;
			}
		}

		// Check children if they exist
		if (item.children) {
			const childMatch = findSubItemByUrl(item.children, url);
			if (childMatch) return childMatch;
		}
	}

	return undefined;
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
	const _pathSegments = fullPath.split('/').filter(Boolean);
	for (const item of config) {
		const found = findSubItemByUrl(item.items, fullPath);
		if (found) return true;
		if (item.items.some((subItem) => subItem.dynamic)) {
			const dynamicPath = item.items.find((subItem) => subItem.dynamic)?.url;
			if (dynamicPath) {
				const pattern = dynamicPath.replace(/\[\w+\]/g, '[^/]+');
				const regex = new RegExp(`^${pattern.replace(/\//g, '\\/')}$`);
				if (regex.test(fullPath)) {
					return true;
				}
			}
		}
	}
	return false;
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
			return {};
		}

		// Check if the path is valid
		const isPathValid = isValidPath(config, pathname);
		if (!isPathValid) {
			return {};
		}

		// Handle role-level pages (e.g., /student, /faculty)
		if (pathSegments.length === 1) {
			return {
				title: 'Dashboard',
			};
		}

		// Get page info for valid routes
		const navItem = findItemByUrl(config, pathname);
		return {
			title: navItem?.headerTitle || navItem?.title || 'Unknown Page',
			subtitle: navItem?.headerSubtitle,
		};
	}, [pathname, config, isValidRole, pathSegments.length]);

	return currentPageInfo.title ? (
		<div className={cn('flex items-start justify-between gap-1', className)}>
			<div className="flex min-w-0 flex-col">
				<h1 className="text-2xl font-semibold md:text-3xl">{currentPageInfo.title}</h1>
				{currentPageInfo.subtitle && (
					<p className="text-muted-foreground">{currentPageInfo.subtitle}</p>
				)}
			</div>
		</div>
	) : (
		<></>
	);
}

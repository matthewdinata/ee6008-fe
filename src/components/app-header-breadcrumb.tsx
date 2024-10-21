'use client';

import { usePathname } from 'next/navigation';
import React from 'react';

import { NavItem, NavSubItem } from '@/components/nav-main';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

import { navConfig } from '@/app/config/nav';

type BreadcrumbItem = {
	path: string;
	title: string;
};

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

export default function AppHeaderBreadcrumb() {
	const pathname = usePathname();
	const pathSegments = pathname.split('/').filter(Boolean);

	const role = pathSegments[0];
	const config = navConfig[role as keyof typeof navConfig];
	const isValidRoute = config !== undefined;

	if (!isValidRoute) {
		return (
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbPage>EE6008</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
		);
	}

	const breadcrumbs = pathSegments.reduce<BreadcrumbItem[]>((acc, segment, index) => {
		const path = `/${pathSegments.slice(0, index + 1).join('/')}`;

		if (index === 0) {
			// First segment is the role
			acc.push({ path, title: segment.charAt(0).toUpperCase() + segment.slice(1) });
		} else {
			const item = findItemByUrl(config, path);
			if (item) {
				acc.push({ path, title: item.title });
			} else {
				return acc;
			}
		}

		return acc;
	}, []);

	return (
		<Breadcrumb>
			<BreadcrumbList>
				{breadcrumbs.map((crumb, index) => (
					<React.Fragment key={crumb.path}>
						<BreadcrumbItem>
							{index === breadcrumbs.length - 1 ? (
								<BreadcrumbPage>{crumb.title}</BreadcrumbPage>
							) : (
								<BreadcrumbLink href={crumb.path}>{crumb.title}</BreadcrumbLink>
							)}
						</BreadcrumbItem>
						{index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
					</React.Fragment>
				))}
			</BreadcrumbList>
		</Breadcrumb>
	);
}

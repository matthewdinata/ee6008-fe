'use client';

import { BadgeCheck, ChevronsUpDown, CreditCard, LogOut, MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from '@/components/ui/sidebar';

import { Skeleton } from '../ui/skeleton';

// Helper function for direct cookie access - prevent duplication
function getCookieValue(name: string): string {
	if (typeof document === 'undefined') return '';

	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) {
		const cookieValue = parts.pop()?.split(';').shift();
		return cookieValue ? decodeURIComponent(cookieValue) : '';
	}
	return '';
}

// Define interface for the user object
interface UserInfo {
	name: string;
	email: string;
	avatar: string;
	role: string;
}

export default function NavUser({ user }: { user: UserInfo }) {
	const { isMobile } = useSidebar();
	const { systemTheme, theme, setTheme } = useTheme();
	const currentTheme = theme === 'system' ? systemTheme : theme;
	const router = useRouter();
	const [mounted, setMounted] = useState(false);
	const [directUser, setDirectUser] = useState<UserInfo | null>(null);

	// Set mounted flag to prevent hydration errors
	useEffect(() => {
		setMounted(true);
	}, []);

	// Direct cookie access as a fallback
	useEffect(() => {
		if (!mounted) return; // Skip during SSR

		try {
			// Get cookies directly
			const cookieName = getCookieValue('user-name');
			const cookieEmail = getCookieValue('user-email');
			const cookieRole = getCookieValue('user-role');

			if (cookieName || cookieEmail) {
				// Only update state if values actually changed
				if (
					!directUser ||
					cookieName !== directUser.name ||
					cookieEmail !== directUser.email ||
					cookieRole !== directUser.role
				) {
					setDirectUser({
						name: cookieName || user.name,
						email: cookieEmail || user.email,
						role: cookieRole || user.role,
						avatar: user.avatar,
					});
				}
			}
		} catch (e) {
			console.error('Error in NavUser cookie check:', e);
		}
	}, [mounted, user, directUser]);

	// Skip rendering if not mounted
	if (!mounted) {
		return (
			<SidebarMenu suppressHydrationWarning>
				<SidebarMenuItem className={isMobile ? 'w-full' : ''}>
					<SidebarMenuButton size="lg" className="justify-between w-full">
						<Skeleton className="w-full h-12" />
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		);
	}

	// Use direct cookie values if available, or fall back to passed props
	const displayUser = directUser || user;

	return (
		<SidebarMenu suppressHydrationWarning>
			<SidebarMenuItem className={isMobile ? 'w-full' : ''}>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton size="lg" className="justify-between w-full">
							<div className="flex items-center gap-2 truncate">
								<Avatar className="h-5 w-5 text-primary">
									<AvatarFallback className="text-xs">
										{displayUser.name?.charAt(0) || 'U'}
									</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 gap-px truncate text-left text-xs leading-none">
									<span className="truncate font-semibold">
										{displayUser.name || 'User'}
									</span>
									<span className="truncate opacity-60">{displayUser.email}</span>
								</div>
							</div>
							<ChevronsUpDown className="size-3 shrink-0 opacity-50" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent side="top" sideOffset={20} className="w-56">
						<DropdownMenuLabel>My Account</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem>
								<BadgeCheck className="mr-2 h-4 w-4 text-blue-500" />
								<span>Verified</span>
								{displayUser.role === 'admin' && (
									<span className="ml-auto rounded bg-red-500 px-1.5 text-[0.625rem] font-medium uppercase text-white">
										Admin
									</span>
								)}
								{displayUser.role === 'faculty' && (
									<span className="ml-auto rounded bg-orange-500 px-1.5 text-[0.625rem] font-medium uppercase text-white">
										Faculty
									</span>
								)}
								{displayUser.role === 'student' && (
									<span className="ml-auto rounded bg-green-500 px-1.5 text-[0.625rem] font-medium uppercase text-white">
										Student
									</span>
								)}
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => router.push(`/${user.role}`)}>
								<CreditCard className="mr-2 h-4 w-4" />
								<span>Account</span>
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem
								onClick={() =>
									setTheme(currentTheme === 'light' ? 'dark' : 'light')
								}
							>
								{currentTheme === 'light' ? (
									<>
										<MoonIcon className="mr-2 h-4 w-4" />
										<span>Dark</span>
									</>
								) : (
									<>
										<SunIcon className="mr-2 h-4 w-4" />
										<span>Light</span>
									</>
								)}
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={async () => {
								try {
									console.log('Starting sign out process...');

									// Create a form to submit to /api/auth/signout - this will ensure server-side cleanup
									const form = document.createElement('form');
									form.method = 'POST';
									form.action = '/api/auth/signout';
									form.style.display = 'none';

									// Add a timestamp to prevent caching
									const timestampField = document.createElement('input');
									timestampField.type = 'hidden';
									timestampField.name = 'timestamp';
									timestampField.value = Date.now().toString();
									form.appendChild(timestampField);

									// Add the form to the document body and submit it
									document.body.appendChild(form);
									form.submit();

									// Don't use client-side redirect - let the server handle it
								} catch (error) {
									console.error('Error during sign out process:', error);
									// Fallback in case the form submission fails - redirect to current origin
									const currentOrigin = window.location.origin;
									window.location.href = `${currentOrigin}/signin?error=signout_failed`;
								}
							}}
						>
							<LogOut className="mr-2 h-4 w-4" />
							<span>Sign out</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}

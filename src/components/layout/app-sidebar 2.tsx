'use client';

import { FolderRoot } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { useEffect, useState } from 'react';

import { useAuth } from '@/components/layout/auth-provider';
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

// Safe sessionStorage access helper
const getSessionItem = (key: string): string | null => {
	if (typeof window !== 'undefined' && window.sessionStorage) {
		return sessionStorage.getItem(key);
	}
	return null;
};

const setSessionItem = (key: string, value: string): void => {
	if (typeof window !== 'undefined' && window.sessionStorage) {
		sessionStorage.setItem(key, value);
	}
};

// Helper function for direct cookie access
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

export default function AppSidebar({
	role,
	...props
}: React.ComponentProps<typeof Sidebar> & { role: string }) {
	const { user: authUser, isLoading: authLoading } = useAuth();
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [hasFetched, setHasFetched] = useState(false);
	const [mounted, setMounted] = useState(false);
	const _pathname = usePathname(); // Keep for potential future use

	// Set mounted state to true once component mounts
	// This prevents hydration errors by not rendering user-dependent content during SSR
	useEffect(() => {
		setMounted(true);
	}, []);

	// Store a reference to the initial render in session storage
	const isInitialRender = typeof window !== 'undefined' && !getSessionItem('hasRenderedSidebar');

	// Direct cookie access on component mount and on every render
	useEffect(() => {
		if (!mounted) return; // Skip this effect during SSR

		try {
			// Get user data directly from cookies (set by middleware)
			const cookieName = getCookieValue('user-name');
			const cookieEmail = getCookieValue('user-email');
			const cookieRole = getCookieValue('user-role');
			const cookieId = getCookieValue('user-id');

			// Log what we found
			console.log('🍪 User cookies:', {
				name: cookieName,
				email: cookieEmail,
				role: cookieRole,
				id: cookieId,
			});

			// If we have cookie data, set the user state directly
			if (cookieName || cookieRole) {
				setUser({
					id: parseInt(cookieId || '0'),
					name: cookieName || '',
					email: cookieEmail || '',
					role: cookieRole || role,
					created_at: '',
					updated_at: '',
				});

				// Also store in session storage for consistent access
				if (cookieName && cookieEmail) {
					const userData = {
						id: parseInt(cookieId || '0'),
						name: cookieName,
						email: cookieEmail,
						role: cookieRole || role,
						created_at: '',
						updated_at: '',
					};
					setSessionItem('ee6008_user_session_data', JSON.stringify(userData));
					setSessionItem('ee6008_prev_user_name', cookieName);
					setSessionItem('ee6008_prev_user_email', cookieEmail);

					// Mark as fetched since we got data from cookies
					setHasFetched(true);
				}

				console.log('✅ Set user from cookies:', {
					name: cookieName,
					email: cookieEmail,
					role: cookieRole,
				});
			}
		} catch (error) {
			console.error('Error accessing cookies:', error);
		}
	}, [mounted, role]); // Re-run when mounted changes

	// Handle user data fetching with proper caching
	useEffect(() => {
		if (!mounted) return; // Skip during SSR

		const getCachedUser = () => {
			// First try sessionStorage (faster and persists during navigation)
			try {
				const sessionUserData = getSessionItem('ee6008_user_session_data');
				if (sessionUserData) {
					const parsedData = JSON.parse(sessionUserData);
					// Check if the cached data is for the current user
					if (parsedData.email === authUser?.email) {
						console.log('Using session cached user data');
						setUser(parsedData);
						setHasFetched(true);
						return true;
					}
				}
			} catch (error) {
				console.error('Error reading session cached user data:', error);
				if (typeof window !== 'undefined' && window.sessionStorage) {
					sessionStorage.removeItem('ee6008_user_session_data');
				}
			}

			// Fall back to localStorage if session data not available
			try {
				if (typeof window !== 'undefined' && window.localStorage) {
					const cachedUserData = localStorage.getItem('ee6008_user_data');
					if (cachedUserData) {
						const parsedData = JSON.parse(cachedUserData);
						// Check if the cached data is for the current user
						if (parsedData.email === authUser?.email) {
							console.log('Using localStorage cached user data');
							setUser(parsedData);
							// Also store in sessionStorage for future navigation
							setSessionItem('ee6008_user_session_data', cachedUserData);
							setHasFetched(true);
							return true;
						}
					}
				}
			} catch (error) {
				console.error('Error reading localStorage user data:', error);
				if (typeof window !== 'undefined' && window.localStorage) {
					localStorage.removeItem('ee6008_user_data');
				}
			}
			return false;
		};

		// Only fetch from backend if auth is loaded and we have a user
		// AND we're on the initial render of the session
		if (!authLoading && authUser?.email && !hasFetched && isInitialRender) {
			// First try to get from cache
			const hasCachedData = getCachedUser();
			// If no cached data, fetch from backend
			if (!hasCachedData) {
				const fetchBackendUser = async () => {
					setIsLoading(true);
					try {
						// Use session token from cookies or local storage
						let sessionToken;
						try {
							// First try to get token from cookies
							sessionToken = getCookieValue('session-token');
							// If no token in cookies, check supabase auth session
							if (!sessionToken && typeof window !== 'undefined') {
								const supabaseSession = localStorage.getItem('supabase.auth.token');
								if (supabaseSession) {
									try {
										const parsed = JSON.parse(supabaseSession);
										sessionToken = parsed?.currentSession?.access_token;
									} catch (e) {
										console.error('Error parsing supabase session:', e);
									}
								}
							}
						} catch (e) {
							console.error('Error getting session token:', e);
						}

						if (!sessionToken) {
							console.warn('No session token found in cookies or local storage');
							setIsLoading(false);
							setHasFetched(true); // Still mark as fetched to avoid infinite retries
							return;
						}

						const response = await fetch(
							`${process.env.NEXT_PUBLIC_API_URL}/auth/verify`,
							{
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
							}
						);

						if (!response.ok) {
							throw new Error('Failed to fetch user data');
						}

						const data = await response.json();
						setUser(data.user);
						// Cache the user data in both localStorage and sessionStorage
						try {
							// Store in localStorage for persistence across browser sessions
							if (typeof window !== 'undefined') {
								localStorage.setItem('ee6008_user_data', JSON.stringify(data.user));
								// Also store in sessionStorage for faster access during navigation
								setSessionItem(
									'ee6008_user_session_data',
									JSON.stringify(data.user)
								);
							}
						} catch (cacheError) {
							console.error('Error caching user data:', cacheError);
						}
					} catch (error) {
						console.error('Error fetching user data:', error);
					} finally {
						setIsLoading(false);
						setHasFetched(true); // Mark as fetched whether successful or not
					}
				};

				fetchBackendUser();
			} else {
				// If we have cached data, we're done
				setHasFetched(true);
			}
		} else if (!authLoading && !authUser) {
			// No authenticated user, clear loading state
			setIsLoading(false);
			setHasFetched(true);
		}
	}, [authLoading, authUser, hasFetched, isInitialRender, mounted]);

	// Generate user config from fetched data with fallback to cached data if available
	const userConfig = React.useMemo(() => {
		// Only access browser APIs if mounted (prevents hydration errors)
		if (!mounted) {
			return {
				name: 'User',
				email: '',
				avatar: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS11c2VyIj48cGF0aCBkPSJNMTkgMjF2LTJhNCA0IDAgMCAwLTQtNEg5YTQgNCAwIDAgMC00IDR2MiIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iNyIgcj0iNCIvPjwvc3ZnPg==',
				role: role,
			};
		}

		// Always check cookies directly inside the memo to ensure we have the latest
		const cookieName = getCookieValue('user-name');
		const cookieEmail = getCookieValue('user-email');
		const cookieRole = getCookieValue('user-role');

		// Skip the fallback to 'User' text completely for a smoother experience
		// Use all available sources of data, prioritizing the most reliable
		let cachedData = null;
		let prevUserName = null;
		let prevUserEmail = null;

		if (typeof window !== 'undefined') {
			try {
				// Try sessionStorage first (best for navigation)
				const sessionData = getSessionItem('ee6008_user_session_data');
				if (sessionData) {
					cachedData = JSON.parse(sessionData);
				} else {
					// Fall back to localStorage if no session data
					try {
						const storedUserData = localStorage.getItem('ee6008_user_data');
						if (storedUserData) {
							cachedData = JSON.parse(storedUserData);
							// Also populate sessionStorage for future navigation
							setSessionItem('ee6008_user_session_data', storedUserData);
						}
					} catch (e) {
						console.error('Error accessing localStorage:', e);
					}
				}
				// Get previous values
				prevUserName = getSessionItem('ee6008_prev_user_name');
				prevUserEmail = getSessionItem('ee6008_prev_user_email');
			} catch (e) {
				console.error('Error parsing cached user data:', e);
			}
		}

		// Use available data with fallbacks in order of priority
		// Construct the user config using all available sources
		const config = {
			name:
				cookieName ||
				user?.name ||
				cachedData?.name ||
				prevUserName || // Get last used name
				'User', // Default fallback
			email:
				cookieEmail ||
				user?.email ||
				cachedData?.email ||
				prevUserEmail || // Get last used email
				authUser?.email ||
				'',
			// Use a data URL for default avatar to prevent 404
			avatar: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS11c2VyIj48cGF0aCBkPSJNMTkgMjF2LTJhNCA0IDAgMCAwLTQtNEg5YTQgNCAwIDAgMC00IDR2MiIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iNyIgcj0iNCIvPjwvc3ZnPg==',
			role: cookieRole || user?.role || cachedData?.role || role,
		};

		// Log user config to confirm what we're using
		console.log('📋 User config:', config);

		// Store the current name and email in sessionStorage to prevent flickering
		if (typeof window !== 'undefined') {
			// Save name if valid
			if (config.name && config.name !== 'User') {
				setSessionItem('ee6008_prev_user_name', config.name);
			}
			// Save email if valid
			if (config.email && config.email.length > 0) {
				setSessionItem('ee6008_prev_user_email', config.email);
			}
		}

		return config;
	}, [user, authUser, role, mounted]);

	// Mark that we've had the initial render
	useEffect(() => {
		if (!mounted) return; // Skip during SSR

		if (typeof window !== 'undefined') {
			setSessionItem('hasRenderedSidebar', 'true');
		}

		// Also immediately set hasFetched to true on subsequent renders
		if (!isInitialRender) {
			setHasFetched(true);
			setIsLoading(false);
		}
	}, [isInitialRender, mounted]);

	// Only show skeleton on very first page load of the session, never on any other interaction
	if (isInitialRender && !hasFetched && (authLoading || isLoading)) {
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
				<NavMain items={navConfig} role={userConfig.role?.toLowerCase() || role} />
			</SidebarContent>
			<SidebarFooter className="flex flex-row justify-between">
				<NavUser user={userConfig} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}

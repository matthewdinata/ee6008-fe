'use client';

import { Clock, LogOut, RefreshCw, Shield, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface User {
	id: number;
	name: string;
	email: string;
	role: string;
	created_at: string;
	updated_at: string;
}

interface TokenInfo {
	expiresAt: string;
	timeUntilExpire: number;
	shouldRefresh: boolean;
}

// Function to get session token info from cookie
function getSessionTokenInfo(): { expiresAt: number | null; timeUntilExpire: number } {
	// Get session token from cookie
	const getSessionCookie = () => {
		if (typeof document === 'undefined') return null;
		const cookies = document.cookie.split(';');
		for (let i = 0; i < cookies.length; i++) {
			const cookie = cookies[i].trim();
			if (cookie.startsWith('session-token=')) {
				return cookie.substring('session-token='.length);
			}
		}
		return null;
	};

	const sessionToken = getSessionCookie();

	// Parse JWT token to get expiration time
	if (sessionToken) {
		try {
			// JWT tokens are in format: header.payload.signature
			// The payload contains the expiration time
			const parts = sessionToken.split('.');
			if (parts.length === 3) {
				const payload = JSON.parse(atob(parts[1]));
				if (payload.exp) {
					const expiresAt = payload.exp * 1000; // Convert to milliseconds
					const timeUntilExpire = expiresAt - Date.now();
					return { expiresAt, timeUntilExpire };
				}
			}
		} catch (e) {
			console.error('Error parsing JWT token:', e);
		}
	}

	return { expiresAt: null, timeUntilExpire: 0 };
}

export function AdminDashboard() {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
	const [lastRefresh, setLastRefresh] = useState<string | null>(null);
	const router = useRouter();

	const formatTimeUntilExpiry = (minutes: number) => {
		if (minutes < 60) return `${Math.round(minutes)} minutes`;
		const hours = Math.floor(minutes / 60);
		const remainingMinutes = Math.round(minutes % 60);
		return `${hours} hours ${remainingMinutes} minutes`;
	};

	const checkTokenStatus = useCallback(() => {
		try {
			const { expiresAt, timeUntilExpire } = getSessionTokenInfo();

			if (!expiresAt) {
				throw new Error('No session found');
			}

			const shouldRefresh = timeUntilExpire < 1000 * 60 * 5; // Refresh if less than 5 minutes left
			const expiresDate = new Date(expiresAt);

			setTokenInfo({
				expiresAt: expiresDate.toLocaleString(),
				timeUntilExpire: timeUntilExpire / (1000 * 60), // Convert to minutes
				shouldRefresh,
			});

			return { shouldRefresh };
		} catch (error) {
			console.error('Error checking token:', error);
			return { shouldRefresh: false };
		}
	}, []);

	const refreshToken = useCallback(async () => {
		try {
			// Call the server API endpoint to refresh the session
			const response = await fetch('/api/auth/refresh', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to refresh session');
			}

			const data = await response.json();

			if (data.success) {
				setLastRefresh(new Date().toLocaleString());
				checkTokenStatus(); // Update token info after refresh
				return true;
			} else {
				throw new Error('Failed to refresh session');
			}
		} catch (error) {
			console.error('Error refreshing token:', error);
			return false;
		}
	}, [checkTokenStatus]);

	const handleLogout = async () => {
		try {
			// Use form submission for server-side logout
			const form = document.createElement('form');
			form.method = 'POST';
			form.action = '/api/auth/signout';
			document.body.appendChild(form);
			form.submit();
		} catch (error) {
			console.error('Error signing out:', error);
			// Fallback to client-side cleanup and redirect
			router.push('/signin');
		}
	}, [supabase, checkAndRefreshToken]);

	const fetchUserData = useCallback(async () => {
		try {
			// Get user data from cookies instead of session
			const getCookieValue = (name: string): string => {
				if (typeof document === 'undefined') return '';
				const cookies = document.cookie.split(';');
				for (let i = 0; i < cookies.length; i++) {
					const cookie = cookies[i].trim();
					if (cookie.startsWith(name + '=')) {
						return cookie.substring(name.length + 1);
					}
				}
				return '';
			};

			const userName = getCookieValue('user-name');
			const userEmail = getCookieValue('user-email');
			const userRole = getCookieValue('user-role');

			if (!userName || !userEmail) {
				throw new Error('User data not found in cookies');
			}

			// Check token status to update UI
			checkTokenStatus();

			// Create user object from cookies
			const mockUser: User = {
				id: 1,
				name: userName,
				email: userEmail,
				role: userRole || 'User',
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			};

			setUser(mockUser);
			setLoading(false);
		} catch (error) {
			console.error('Error fetching user data:', error);
			router.push('/signin');
		}
	}, [checkTokenStatus, router]);

	useEffect(() => {
		fetchUserData();
		// Set up a timer to check token expiry every minute
		const timerInterval = setInterval(async () => {
			const { shouldRefresh } = checkTokenStatus();
			if (shouldRefresh) {
				await refreshToken();
			}
		}, 60000); // Check every minute

		return () => clearInterval(timerInterval);
	}, [checkTokenStatus, fetchUserData, refreshToken]);

	if (loading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
			</div>
		);
	}

	return (
		<div className="container mx-auto text-foreground">
			<div className="space-y-8">
				{/* Welcome Section */}
				<div className="bg-card rounded-lg shadow-sm p-6 border border-border">
					<div className="flex items-center space-x-3 mb-4">
						<User className="h-5 w-5 text-primary" />
						<h2 className="text-xl font-semibold text-foreground">
							Welcome, {user?.name}
						</h2>
					</div>
					<p className="text-muted-foreground">
						This is your administration dashboard, where you can manage students, view
						assignments, and handle course settings. Use the navigation to explore
						different sections.
					</p>
				</div>

				<div className="grid md:grid-cols-2 gap-8">
					{/* Account Information */}
					<div className="bg-card rounded-lg shadow-sm p-6 border border-border">
						<div className="flex items-center space-x-3 mb-4">
							<Shield className="h-5 w-5 text-primary" />
							<h2 className="text-xl font-semibold text-foreground">
								Account Information
							</h2>
						</div>
						<div className="space-y-4">
							<div>
								<p className="text-sm text-muted-foreground">Name</p>
								<p className="text-lg font-medium text-foreground">{user?.name}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Email</p>
								<p className="text-lg font-medium text-foreground">{user?.email}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Role</p>
								<p className="text-lg font-medium text-foreground capitalize">
									{user?.role}
								</p>
							</div>
							<button
								onClick={handleLogout}
								className="mt-4 flex items-center space-x-2 px-4 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 transition-colors"
							>
								<LogOut className="h-4 w-4" />
								<span>Logout</span>
							</button>
						</div>
					</div>

					{/* Session Information */}
					<div className="bg-card rounded-lg shadow-sm p-6 border border-border">
						<div className="flex items-center space-x-3 mb-4">
							<Clock className="h-5 w-5 text-primary" />
							<h2 className="text-xl font-semibold text-foreground">
								Session Information
							</h2>
						</div>
						<div className="space-y-4">
							{tokenInfo && (
								<>
									<div>
										<p className="text-sm text-muted-foreground">
											Session Expires
										</p>
										<p className="text-lg font-medium text-foreground">
											{tokenInfo.expiresAt}
										</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground">
											Time Until Expiry
										</p>
										<p className="text-lg font-medium text-foreground">
											{formatTimeUntilExpiry(tokenInfo.timeUntilExpire)}
										</p>
									</div>
								</>
							)}
							{lastRefresh && (
								<div>
									<p className="text-sm text-muted-foreground">
										Last Token Refresh
									</p>
									<p className="text-lg font-medium text-foreground">
										{lastRefresh}
									</p>
								</div>
							)}
							<button
								onClick={refreshToken}
								className="mt-4 flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
								disabled={
									tokenInfo?.timeUntilExpire
										? tokenInfo.timeUntilExpire > 30
										: true
								}
							>
								<RefreshCw className="h-4 w-4" />
								<span>Refresh Token</span>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

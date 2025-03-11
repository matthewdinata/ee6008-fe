'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
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

export function AdminDashboard() {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
	const [lastRefresh, setLastRefresh] = useState<string | null>(null);
	const router = useRouter();
	const supabase = createClientComponentClient();

	const formatTimeUntilExpiry = (minutes: number) => {
		if (minutes < 60) return `${Math.round(minutes)} minutes`;
		const hours = Math.floor(minutes / 60);
		const remainingMinutes = Math.round(minutes % 60);
		return `${hours} hours ${remainingMinutes} minutes`;
	};

	const checkAndRefreshToken = useCallback(async () => {
		try {
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session) {
				throw new Error('No session found');
			}

			const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
			const timeUntilExpire = expiresAt - Date.now();
			const shouldRefresh = timeUntilExpire < 1000 * 60 * 5; // Refresh if less than 5 minutes left

			const expiresDate = new Date(expiresAt);

			setTokenInfo({
				expiresAt: expiresDate.toLocaleString(),
				timeUntilExpire: timeUntilExpire / (1000 * 60), // Convert to minutes
				shouldRefresh,
			});

			return { session, shouldRefresh };
		} catch (error) {
			console.error('Error checking token:', error);
			return { session: null, shouldRefresh: false };
		}
	}, [supabase]);

	const refreshToken = useCallback(async () => {
		try {
			const { data } = await supabase.auth.refreshSession();
			if (data.session) {
				setLastRefresh(new Date().toLocaleString());
				await checkAndRefreshToken(); // Update token info after refresh
			}
		} catch (error) {
			console.error('Error refreshing token:', error);
		}
	}, [supabase, checkAndRefreshToken]);

	const handleLogout = async () => {
		await supabase.auth.signOut();
		router.push('/signin');
	};

	const fetchUserData = useCallback(async () => {
		try {
			const { session } = await checkAndRefreshToken();
			if (!session) {
				throw new Error('No session found');
			}

			// For demo, create a mock user
			// In a real app, you would fetch this from your database
			const mockUser: User = {
				id: 1,
				name: session.user?.email?.split('@')[0] || 'User',
				email: session.user?.email || 'user@example.com',
				role: 'Admin', // This should come from your DB
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			};

			setUser(mockUser);
			setLoading(false);
		} catch (error) {
			console.error('Error fetching user data:', error);
			router.push('/signin');
		}
	}, [checkAndRefreshToken, router]);

	useEffect(() => {
		fetchUserData();
		// Set up a timer to check token expiry every minute
		const timerInterval = setInterval(async () => {
			const { shouldRefresh } = await checkAndRefreshToken();
			if (shouldRefresh) {
				await refreshToken();
			}
		}, 60000); // Check every minute

		return () => clearInterval(timerInterval);
	}, [checkAndRefreshToken, fetchUserData, refreshToken]);

	if (loading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6 text-foreground">
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

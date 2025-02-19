// 'use client';

// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// import { Clock, LogOut, RefreshCw, Shield, User } from 'lucide-react';
// import { useRouter } from 'next/navigation';
// import { useEffect, useState } from 'react';

// interface User {
// 	id: number;
// 	name: string;
// 	email: string;
// 	role: string;
// 	created_at: string;
// 	updated_at: string;
// }

// interface TokenInfo {
// 	expiresAt: string;
// 	timeUntilExpire: number;
// 	shouldRefresh: boolean;
// }

// export default function Dashboard() {
// 	const [user, setUser] = useState<User | null>(null);
// 	const [loading, setLoading] = useState(true);
// 	const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
// 	const [lastRefresh, setLastRefresh] = useState<string | null>(null);
// 	const router = useRouter();
// 	const supabase = createClientComponentClient();

// 	// Function to format time until expiry
// 	const formatTimeUntilExpiry = (minutes: number) => {
// 		if (minutes < 60) return `${Math.round(minutes)} minutes`;
// 		const hours = Math.floor(minutes / 60);
// 		const remainingMinutes = Math.round(minutes % 60);
// 		return `${hours} hours ${remainingMinutes} minutes`;
// 	};

// 	// Function to check and refresh token if needed
// 	const checkAndRefreshToken = async () => {
// 		try {
// 			console.log('🔄 Checking token status...');
// 			const {
// 				data: { session },
// 			} = await supabase.auth.getSession();

// 			if (!session) {
// 				throw new Error('No session found');
// 			}

// 			// Calculate token expiration info
// 			const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
// 			const timeUntilExpire = expiresAt - Date.now();
// 			const shouldRefresh = timeUntilExpire < 1000 * 60 * 5; // Refresh if less than 1 hour left

// 			setTokenInfo({
// 				expiresAt: new Date(expiresAt).toLocaleString(),
// 				timeUntilExpire: Math.round(timeUntilExpire / 1000 / 60),
// 				shouldRefresh,
// 			});

// 			if (shouldRefresh) {
// 				console.log('🔄 Token needs refresh, refreshing...');
// 				const {
// 					data: { session: newSession },
// 					error: refreshError,
// 				} = await supabase.auth.refreshSession();

// 				if (refreshError) throw refreshError;

// 				if (newSession) {
// 					console.log('✅ Token refreshed successfully');
// 					setLastRefresh(new Date().toLocaleString());
// 					return newSession;
// 				}
// 			}

// 			return session;
// 		} catch (error) {
// 			console.error('❌ Token refresh error:', error);
// 			throw error;
// 		}
// 	};

// 	// Function to verify with backend
// 	// eslint-disable-next-line @typescript-eslint/no-explicit-any
// 	const verifyWithBackend = async (session: any) => {
// 		console.log('🔄 Verifying with backend...');
// 		const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify`, {
// 			method: 'POST',
// 			headers: {
// 				Authorization: `Bearer ${session.access_token}`,
// 				'Content-Type': 'application/json',
// 			},
// 			body: JSON.stringify({
// 				email: session.user.email,
// 				name: session.user.email?.split('@')[0],
// 				userId: session.user.id,
// 			}),
// 		});

// 		if (!response.ok) {
// 			throw new Error('Backend verification failed');
// 		}

// 		const data = await response.json();
// 		console.log('✅ Backend verification successful');
// 		return data;
// 	};

// 	useEffect(() => {
// 		let mounted = true;
// 		let refreshTimer: NodeJS.Timeout;

// 		const initializeSession = async () => {
// 			try {
// 				setLoading(true);

// 				// Check and refresh token if needed
// 				const session = await checkAndRefreshToken();

// 				// Verify with backend
// 				const data = await verifyWithBackend(session);

// 				if (mounted) {
// 					setUser(data.user);
// 					setLoading(false);
// 				}

// 				// Set up periodic token check (every 15 minutes)
// 				refreshTimer = setInterval(
// 					async () => {
// 						try {
// 							await checkAndRefreshToken();
// 						} catch (error) {
// 							console.error('Periodic token refresh failed:', error);
// 							router.push('/signin');
// 						}
// 					},
// 					15 * 60 * 1000
// 				);
// 			} catch (error) {
// 				console.error('Session initialization error:', error);
// 				router.push('/signin');
// 			}
// 		};

// 		// Set up auth state listener
// 		const {
// 			data: { subscription },
// 		} = supabase.auth.onAuthStateChange(async (event, session) => {
// 			console.log('🔄 Auth state changed:', { event, email: session?.user?.email });

// 			if (event === 'SIGNED_OUT') {
// 				if (mounted) {
// 					setUser(null);
// 					router.push('/signin');
// 				}
// 			} else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
// 				initializeSession();
// 			}
// 		});

// 		// Initial session check
// 		initializeSession();

// 		// Cleanup
// 		return () => {
// 			mounted = false;
// 			if (refreshTimer) clearInterval(refreshTimer);
// 			subscription.unsubscribe();
// 		};
// 	}, [router, supabase.auth]);

// 	if (loading) {
// 		return (
// 			<div className="min-h-screen flex items-center justify-center bg-gray-50">
// 				<div className="text-center">
// 					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
// 					<p className="mt-4 text-gray-600">Loading your dashboard...</p>
// 				</div>
// 			</div>
// 		);
// 	}

// 	if (!user) {
// 		return null;
// 	}

// 	return (
// 		<div className="min-h-screen bg-gray-50 py-8">
// 			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
// 				{/* Header */}
// 				<div className="bg-white rounded-lg shadow-sm p-6 mb-6">
// 					<div className="flex items-center justify-between">
// 						<div className="flex items-center space-x-4">
// 							<div className="bg-indigo-100 p-3 rounded-full">
// 								<User className="h-6 w-6 text-indigo-600" />
// 							</div>
// 							<div>
// 								<h1 className="text-2xl font-bold text-gray-900">
// 									Welcome, {user.name}!
// 								</h1>
// 								<p className="text-gray-500">{user.email}</p>
// 							</div>
// 						</div>
// 						<button
// 							onClick={async () => {
// 								await supabase.auth.signOut();
// 								router.push('/signin');
// 							}}
// 							className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
// 						>
// 							<LogOut className="h-4 w-4 mr-2" />
// 							Sign Out
// 						</button>
// 					</div>
// 				</div>

// 				{/* Main Content */}
// 				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// 					{/* User Info Card */}
// 					<div className="bg-white rounded-lg shadow-sm p-6">
// 						<div className="flex items-center space-x-3 mb-4">
// 							<Shield className="h-5 w-5 text-indigo-600" />
// 							<h2 className="text-xl font-semibold">Account Information</h2>
// 						</div>
// 						<div className="space-y-4">
// 							<div>
// 								<p className="text-sm text-gray-500">Role</p>
// 								<p className="text-lg font-medium capitalize">{user.role}</p>
// 							</div>
// 							<div>
// 								<p className="text-sm text-gray-500">Account Created</p>
// 								<p className="text-lg font-medium">
// 									{new Date(user.created_at).toLocaleDateString()}
// 								</p>
// 							</div>
// 							<div>
// 								<p className="text-sm text-gray-500">Last Updated</p>
// 								<p className="text-lg font-medium">
// 									{new Date(user.updated_at).toLocaleDateString()}
// 								</p>
// 							</div>
// 						</div>
// 					</div>

// 					{/* Session Info Card */}
// 					<div className="bg-white rounded-lg shadow-sm p-6">
// 						<div className="flex items-center space-x-3 mb-4">
// 							<Clock className="h-5 w-5 text-indigo-600" />
// 							<h2 className="text-xl font-semibold">Session Information</h2>
// 						</div>
// 						<div className="space-y-4">
// 							{tokenInfo && (
// 								<>
// 									<div>
// 										<p className="text-sm text-gray-500">Session Expires</p>
// 										<p className="text-lg font-medium">{tokenInfo.expiresAt}</p>
// 									</div>
// 									<div>
// 										<p className="text-sm text-gray-500">Time Until Expiry</p>
// 										<p className="text-lg font-medium">
// 											{formatTimeUntilExpiry(tokenInfo.timeUntilExpire)}
// 										</p>
// 									</div>
// 								</>
// 							)}
// 							{lastRefresh && (
// 								<div>
// 									<p className="text-sm text-gray-500">Last Token Refresh</p>
// 									<p className="text-lg font-medium">{lastRefresh}</p>
// 								</div>
// 							)}
// 							<button
// 								onClick={() => checkAndRefreshToken()}
// 								className="flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors w-full justify-center mt-4"
// 							>
// 								<RefreshCw className="h-4 w-4 mr-2" />
// 								Refresh Token
// 							</button>
// 						</div>
// 					</div>
// 				</div>
// 			</div>
// 		</div>
// 	);
// }
// 'use client';

// import { User } from '@supabase/auth-helpers-nextjs';
// import React, { useEffect, useState } from 'react';

// import { supabase } from '@/lib/supabase';

// export default function DebugMetadataPage() {
// 	const [user, setUser] = useState<User | null>(null);

// 	useEffect(() => {
// 		(async () => {
// 			const {
// 				data: { user },
// 				error,
// 			} = await supabase.auth.getUser();
// 			if (error) {
// 				console.error('Error getting user:', error);
// 			} else {
// 				setUser(user);
// 				console.log('Current user:', user);
// 				console.log('User metadata:', user?.user_metadata);
// 			}
// 		})();
// 	}, []);

// 	return (
// 		<div>
// 			<h1>Debug Metadata</h1>
// 			<pre>{JSON.stringify(user, null, 2)}</pre>
// 		</div>
// 	);
// }

'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { RefreshCw } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

// TESTING ONLY: Import commented out
// import { verifyAuth } from '@/utils/actions/auth';
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

// TimeLeft in seconds before showing the dialog
const SHOW_WARNING_BEFORE = 5 * 60; // 5 minutes before expiry
const CHECK_INTERVAL = 60 * 1000; // Check every minute

// Utility function to get cookie value by name - kept for reference but using getAllCookies instead
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getCookie(name: string): string | null {
	const cookies = document.cookie.split(';');
	for (let i = 0; i < cookies.length; i++) {
		const cookie = cookies[i].trim();
		if (cookie.startsWith(name + '=')) {
			return cookie.substring(name.length + 1);
		}
	}
	return null;
}

// Utility function to get all cookies as an object
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getAllCookies(): Record<string, string> {
	const result: Record<string, string> = {};
	const cookies = document.cookie.split(';');
	for (let i = 0; i < cookies.length; i++) {
		const cookie = cookies[i].trim();
		const equalPos = cookie.indexOf('=');
		if (equalPos > 0) {
			const name = cookie.substring(0, equalPos);
			const value = cookie.substring(equalPos + 1);
			result[name] = value;
		}
	}
	return result;
}

export function TokenExpiryAlert() {
	const { theme } = useTheme();
	const supabase = createClientComponentClient();
	const [open, setOpen] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		// Log cookies initially for debugging
		// const allCookies = getAllCookies();
		// console.log(
		// 	'%c🍪 ALL COOKIES AT STARTUP:',
		// 	'font-size: 14px; font-weight: bold; color: green;'
		// );
		// console.table(allCookies);

		// Check for Supabase session
		supabase.auth.getSession().then(({ data: _sessionData }) => {
			// if (data.session) {
			// 	console.log(
			// 		'%c🔑 CURRENT SUPABASE SESSION:',
			// 		'font-size: 14px; font-weight: bold; color: blue;',
			// 		{
			// 			accessToken: data.session.access_token.substring(0, 15) + '...',
			// 			refreshToken: data.session.refresh_token.substring(0, 15) + '...',
			// 			expiresAt: data.session.expires_at
			// 				? new Date(data.session.expires_at * 1000).toLocaleString()
			// 				: 'unknown',
			// 		}
			// 	);
			// } else {
			// 	console.log(
			// 		'%c❌ NO SUPABASE SESSION FOUND',
			// 		'font-size: 14px; font-weight: bold; color: red;'
			// 	);
			// }
		});

		// Function to check token expiration
		const checkTokenExpiration = async () => {
			// TESTING ONLY: Force dialog to open only once
			// if (!hasShownAlertRef.current) {
			// 	setOpen(true);
			// 	hasShownAlertRef.current = true;
			// 	return;
			// }

			try {
				const { data: sessionData } = await supabase.auth.getSession();
				const session = sessionData?.session;

				if (!session) {
					// No session, no need to show warning
					return;
				}

				// Calculate time until expiration in seconds
				const expiresAt = session.expires_at;
				if (!expiresAt) return;

				const expiryTime = new Date(expiresAt * 1000);
				const currentTime = new Date();
				const timeLeftMs = expiryTime.getTime() - currentTime.getTime();
				const timeLeftSeconds = Math.floor(timeLeftMs / 1000);

				// If session will expire within the warning threshold, show dialog
				if (timeLeftSeconds > 0 && timeLeftSeconds <= SHOW_WARNING_BEFORE) {
					setOpen(true);
				}
			} catch (err) {
				// console.error('Error checking token expiration:', err);
			}
		};

		// Initial check
		checkTokenExpiration();

		// Set up interval for periodic checks
		const intervalId = setInterval(checkTokenExpiration, CHECK_INTERVAL);

		// Clean up interval on component unmount
		return () => clearInterval(intervalId);
	}, [supabase.auth]);

	const handleRefreshToken = async () => {
		setRefreshing(true);
		setError(null);

		try {
			// Refresh the session
			const { data, error: refreshError } = await supabase.auth.refreshSession();

			if (refreshError) {
				throw refreshError;
			}

			if (data.session) {
				// Get the new access token
				const newAccessToken = data.session.access_token;

				// Set cookie to store the new session token
				document.cookie = `session-token=${newAccessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

				// TESTING ONLY: Skip backend verification
				// await verifyAuth(newAccessToken);
				// console.log('TEST MODE: Skipping backend verification');

				// Log session and cookies after refresh
				// console.log(
				// 	'%c✅ SESSION REFRESHED! NEW TOKEN:',
				// 	'font-size: 16px; font-weight: bold; color: green;',
				// 	{
				// 		newAccessToken: newAccessToken.substring(0, 15) + '...',
				// 		expiresAt: data.session.expires_at
				// 			? new Date(data.session.expires_at * 1000).toLocaleString()
				// 			: 'unknown',
				// 	}
				// );

				// Log all cookies after refresh
				// const allCookiesAfterRefresh = getAllCookies();
				// console.log(
				// 	'%c🍪 ALL COOKIES AFTER REFRESH:',
				// 	'font-size: 14px; font-weight: bold; color: green;'
				// );
				// console.table(allCookiesAfterRefresh);

				// Close the dialog
				setOpen(false);

				// Refresh the page to ensure all components have the new token
				window.location.reload();
			} else {
				throw new Error('Failed to refresh session');
			}
		} catch (err) {
			// console.error('Error refreshing token:', err);
			setError('Unable to refresh your session. Please sign in again.');
		} finally {
			setRefreshing(false);
		}
	};

	const handleSignOut = async () => {
		try {
			// Sign out from Supabase
			await supabase.auth.signOut();

			// Clear cookies
			document.cookie = 'session-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
			document.cookie = 'user-role=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
			document.cookie = 'user-id=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
			document.cookie = 'user-name=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
			document.cookie = 'user-email=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';

			// Clear storage
			sessionStorage.removeItem('ee6008_user_session_data');
			sessionStorage.removeItem('ee6008_prev_user_name');
			sessionStorage.removeItem('ee6008_prev_user_email');
			sessionStorage.removeItem('hasRenderedSidebar');
			localStorage.removeItem('ee6008_user_data');

			// Redirect to sign in
			window.location.href = '/signin';
		} catch (error) {
			// console.error('Error signing out:', error);
		}
	};

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogContent
				className={
					theme === 'dark'
						? 'bg-secondary dark:bg-secondary dark:text-primary-foreground border border-border'
						: 'bg-background text-foreground border border-border'
				}
			>
				<AlertDialogHeader>
					<AlertDialogTitle className="text-foreground dark:text-primary-foreground">
						Session Expiring Soon
					</AlertDialogTitle>
					<AlertDialogDescription className="text-muted-foreground dark:text-muted-foreground">
						Your session is about to expire. Would you like to continue working?
						{error && (
							<div className="mt-2 text-red-500 text-sm font-medium">{error}</div>
						)}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel
						onClick={handleSignOut}
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
					>
						No
					</AlertDialogCancel>
					<Button
						disabled={refreshing}
						onClick={handleRefreshToken}
						className="bg-primary text-primary-foreground hover:bg-primary/90"
					>
						{refreshing ? (
							<>
								<RefreshCw className="mr-2 h-4 w-4 animate-spin" />
								Refreshing...
							</>
						) : (
							'Yes'
						)}
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

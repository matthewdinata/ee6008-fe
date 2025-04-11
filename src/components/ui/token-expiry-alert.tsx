// 'use client';

// import { RefreshCw } from 'lucide-react';
// import { useTheme } from 'next-themes';
// import { useEffect, useState } from 'react';

// // TESTING ONLY: Import commented out
// // import { verifyAuth } from '@/utils/actions/auth';
// import {
// 	AlertDialog,
// 	AlertDialogCancel,
// 	AlertDialogContent,
// 	AlertDialogDescription,
// 	AlertDialogFooter,
// 	AlertDialogHeader,
// 	AlertDialogTitle,
// } from '@/components/ui/alert-dialog';
// import { Button } from '@/components/ui/button';

// // TimeLeft in seconds before showing the dialog
// const SHOW_WARNING_BEFORE = 5 * 60; // 5 minutes before expiry
// const CHECK_INTERVAL = 60 * 1000; // Check every minute

// // Utility function to get cookie value by name - kept for reference but using getAllCookies instead
// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// function getCookie(name: string): string | null {
// 	const cookies = document.cookie.split(';');
// 	for (let i = 0; i < cookies.length; i++) {
// 		const cookie = cookies[i].trim();
// 		if (cookie.startsWith(name + '=')) {
// 			return cookie.substring(name.length + 1);
// 		}
// 	}
// 	return null;
// }

// // Utility function to get all cookies as an object
// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// function getAllCookies(): Record<string, string> {
// 	const result: Record<string, string> = {};
// 	const cookies = document.cookie.split(';');
// 	for (let i = 0; i < cookies.length; i++) {
// 		const cookie = cookies[i].trim();
// 		const equalPos = cookie.indexOf('=');
// 		if (equalPos > 0) {
// 			const name = cookie.substring(0, equalPos);
// 			const value = cookie.substring(equalPos + 1);
// 			result[name] = value;
// 		}
// 	}
// 	return result;
// }

// // Function to check if session token exists and when it expires
// function getSessionTokenInfo(): { token: string | null; expiresAt: number | null } {
// 	const sessionToken = getCookie('session-token');

// 	// Parse JWT token to get expiration time
// 	if (sessionToken) {
// 		try {
// 			// JWT tokens are in format: header.payload.signature
// 			// The payload contains the expiration time
// 			const parts = sessionToken.split('.');
// 			if (parts.length === 3) {
// 				const payload = JSON.parse(atob(parts[1]));
// 				if (payload.exp) {
// 					return { token: sessionToken, expiresAt: payload.exp };
// 				}
// 			}
// 		} catch (e) {
// 			console.error('Error parsing JWT token:', e);
// 		}
// 	}

// 	return { token: sessionToken, expiresAt: null };
// }

// export function TokenExpiryAlert() {
// 	const { theme } = useTheme();
// 	const [open, setOpen] = useState(false);
// 	const [refreshing, setRefreshing] = useState(false);
// 	const [error, setError] = useState<string | null>(null);

// 	useEffect(() => {
// 		// Function to check token expiration
// 		const checkTokenExpiration = async () => {
// 			try {
// 				const { token, expiresAt } = getSessionTokenInfo();

// 				if (!token || !expiresAt) {
// 					// No valid session token or expiration time, no need to show warning

// 		// Log cookies initially for debugging
// 		// const allCookies = getAllCookies();
// 		// console.log(
// 		// 	'%c🍪 ALL COOKIES AT STARTUP:',
// 		// 	'font-size: 14px; font-weight: bold; color: green;'
// 		// );
// 		// console.table(allCookies);

// 		// Check for Supabase session
// 		supabase.auth.getSession().then(({ data: _sessionData }) => {
// 			// if (data.session) {
// 			// 	console.log(
// 			// 		'%c🔑 CURRENT SUPABASE SESSION:',
// 			// 		'font-size: 14px; font-weight: bold; color: blue;',
// 			// 		{
// 			// 			accessToken: data.session.access_token.substring(0, 15) + '...',
// 			// 			refreshToken: data.session.refresh_token.substring(0, 15) + '...',
// 			// 			expiresAt: data.session.expires_at
// 			// 				? new Date(data.session.expires_at * 1000).toLocaleString()
// 			// 				: 'unknown',
// 			// 		}
// 			// 	);
// 			// } else {
// 			// 	console.log(
// 			// 		'%c❌ NO SUPABASE SESSION FOUND',
// 			// 		'font-size: 14px; font-weight: bold; color: red;'
// 			// 	);
// 			// }
// 		});

// =======
// >>>>>>> 0104e15 (discard deprecated supabase-auth-helper)
// 		// Function to check token expiration
// 		const checkTokenExpiration = async () => {
// 			try {
// 				const { token, expiresAt } = getSessionTokenInfo();

// <<<<<<< HEAD
// 				if (!session) {
// 					// No session, no need to show warning
// >>>>>>> b3c3c62 (used server actions for api call)
// =======
// 				if (!token || !expiresAt) {
// 					// No valid session token or expiration time, no need to show warning
// >>>>>>> 0104e15 (discard deprecated supabase-auth-helper)
// 					return;
// 				}

// 				// Calculate time until expiration in seconds
// <<<<<<< HEAD
// <<<<<<< HEAD
// =======
// 				const expiresAt = session.expires_at;
// 				if (!expiresAt) return;

// >>>>>>> b3c3c62 (used server actions for api call)
// =======
// >>>>>>> 0104e15 (discard deprecated supabase-auth-helper)
// 				const expiryTime = new Date(expiresAt * 1000);
// 				const currentTime = new Date();
// 				const timeLeftMs = expiryTime.getTime() - currentTime.getTime();
// 				const timeLeftSeconds = Math.floor(timeLeftMs / 1000);

// 				// If session will expire within the warning threshold, show dialog
// 				if (timeLeftSeconds > 0 && timeLeftSeconds <= SHOW_WARNING_BEFORE) {
// 					setOpen(true);
// 				}
// 			} catch (err) {
// 				// console.error('Error checking token expiration:', err);
// 			}
// 		};

// 		// Initial check
// 		checkTokenExpiration();

// 		// Set up interval for periodic checks
// 		const intervalId = setInterval(checkTokenExpiration, CHECK_INTERVAL);

// 		// Clean up interval on component unmount
// 		return () => clearInterval(intervalId);
// <<<<<<< HEAD
// <<<<<<< HEAD
// 	}, []);
// =======
// 	}, [supabase.auth]);
// >>>>>>> b3c3c62 (used server actions for api call)
// =======
// 	}, []);
// >>>>>>> 0104e15 (discard deprecated supabase-auth-helper)

// 	const handleRefreshToken = async () => {
// 		setRefreshing(true);
// 		setError(null);

// 		try {
// <<<<<<< HEAD
// <<<<<<< HEAD
// =======
// >>>>>>> 0104e15 (discard deprecated supabase-auth-helper)
// 			// Call the server API endpoint to refresh the session
// 			const response = await fetch('/api/auth/refresh', {
// 				method: 'POST',
// 				headers: {
// 					'Content-Type': 'application/json',
// 				},
// 			});
// <<<<<<< HEAD

// 			if (!response.ok) {
// 				const errorData = await response.json();
// 				throw new Error(errorData.error || 'Failed to refresh session');
// 			}

// 			const data = await response.json();

// 			if (data.success) {
// =======
// 			// Refresh the session
// 			const { data, error: refreshError } = await supabase.auth.refreshSession();
// =======
// >>>>>>> 0104e15 (discard deprecated supabase-auth-helper)

// 			if (!response.ok) {
// 				const errorData = await response.json();
// 				throw new Error(errorData.error || 'Failed to refresh session');
// 			}

// 			const data = await response.json();

// <<<<<<< HEAD
// >>>>>>> b3c3c62 (used server actions for api call)
// =======
// 			if (data.success) {
// >>>>>>> 0104e15 (discard deprecated supabase-auth-helper)
// 				// Close the dialog
// 				setOpen(false);

// 				// Refresh the page to ensure all components have the new token
// 				window.location.reload();
// 			} else {
// 				throw new Error('Failed to refresh session');
// 			}
// 		} catch (err) {
// 			// console.error('Error refreshing token:', err);
// 			setError('Unable to refresh your session. Please sign in again.');
// 		} finally {
// 			setRefreshing(false);
// 		}
// 	};

// 	const handleSignOut = async () => {
// 		try {
// <<<<<<< HEAD
// <<<<<<< HEAD
// =======
// >>>>>>> 0104e15 (discard deprecated supabase-auth-helper)
// 			// Use form submission for server-side logout
// 			const form = document.createElement('form');
// 			form.method = 'POST';
// 			form.action = '/api/auth/signout';
// 			document.body.appendChild(form);
// 			form.submit();
// 		} catch (error) {
// 			// console.error('Error signing out:', error);
// 			// Fallback to client-side cleanup if the form submission fails
// <<<<<<< HEAD
// =======
// 			// Sign out from Supabase
// 			await supabase.auth.signOut();

// 			// Clear cookies
// >>>>>>> b3c3c62 (used server actions for api call)
// =======
// >>>>>>> 0104e15 (discard deprecated supabase-auth-helper)
// 			document.cookie = 'session-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
// 			document.cookie = 'user-role=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
// 			document.cookie = 'user-id=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
// 			document.cookie = 'user-name=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
// 			document.cookie = 'user-email=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';

// <<<<<<< HEAD
// <<<<<<< HEAD
// 			// Redirect to sign in with current origin preserved
// 			const currentOrigin = window.location.origin;
// 			window.location.href = `${currentOrigin}/signin`;
// =======
// 			// Clear storage
// 			sessionStorage.removeItem('ee6008_user_session_data');
// 			sessionStorage.removeItem('ee6008_prev_user_name');
// 			sessionStorage.removeItem('ee6008_prev_user_email');
// 			sessionStorage.removeItem('hasRenderedSidebar');
// 			localStorage.removeItem('ee6008_user_data');

// 			// Redirect to sign in
// 			window.location.href = '/signin';
// 		} catch (error) {
// 			// console.error('Error signing out:', error);
// >>>>>>> b3c3c62 (used server actions for api call)
// =======
// 			// Redirect to sign in
// 			window.location.href = '/signin';
// >>>>>>> 0104e15 (discard deprecated supabase-auth-helper)
// 		}
// 	};

// 	return (
// 		<AlertDialog open={open} onOpenChange={setOpen}>
// 			<AlertDialogContent
// 				className={
// 					theme === 'dark'
// 						? 'bg-secondary dark:bg-secondary dark:text-primary-foreground border border-border'
// 						: 'bg-background text-foreground border border-border'
// 				}
// 			>
// 				<AlertDialogHeader>
// 					<AlertDialogTitle className="text-foreground dark:text-primary-foreground">
// 						Session Expiring Soon
// 					</AlertDialogTitle>
// 					<AlertDialogDescription className="text-muted-foreground dark:text-muted-foreground">
// 						Your session is about to expire. Would you like to continue working?
// 						{error && (
// 							<div className="mt-2 text-red-500 text-sm font-medium">{error}</div>
// 						)}
// 					</AlertDialogDescription>
// 				</AlertDialogHeader>
// 				<AlertDialogFooter>
// 					<AlertDialogCancel
// 						onClick={handleSignOut}
// 						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
// 					>
// 						No
// 					</AlertDialogCancel>
// 					<Button
// 						disabled={refreshing}
// 						onClick={handleRefreshToken}
// 						className="bg-primary text-primary-foreground hover:bg-primary/90"
// 					>
// 						{refreshing ? (
// 							<>
// 								<RefreshCw className="mr-2 h-4 w-4 animate-spin" />
// 								Refreshing...
// 							</>
// 						) : (
// 							'Yes'
// 						)}
// 					</Button>
// 				</AlertDialogFooter>
// 			</AlertDialogContent>
// 		</AlertDialog>
// 	);
// }

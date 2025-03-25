import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
	try {
		// Get cookieStore and session token
		const cookieStore = cookies();
		const accessToken = cookieStore.get('session-token')?.value;

		if (!accessToken) {
			console.error('No session token found in cookies');
			return NextResponse.json(
				{ success: false, error: 'No active session found' },
				{ status: 401 }
			);
		}

		// Create a Supabase client with the token
		const supabase = createClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
			{
				global: {
					headers: { Authorization: `Bearer ${accessToken}` },
				},
			}
		);

		// Get the current session
		const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

		if (sessionError || !sessionData.session) {
			console.error('No session found during refresh attempt:', sessionError);
			return NextResponse.json(
				{ success: false, error: 'No active session found' },
				{ status: 401 }
			);
		}

		// Refresh the session
		const { data, error } = await supabase.auth.refreshSession();

		if (error || !data.session) {
			console.error('Error refreshing session:', error);
			return NextResponse.json(
				{ success: false, error: error?.message || 'Session refresh failed' },
				{ status: 500 }
			);
		}

		// Get the new tokens
		const { access_token } = data.session;

		// Set the session cookie with the new token
		cookies().set('session-token', access_token, {
			path: '/',
			maxAge: 60 * 60 * 24 * 7, // 1 week
			sameSite: 'lax',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
		});

		// Create and set user cookies for client-side access
		if (data.user) {
			// Set user-related cookies (non-sensitive data only for UI)
			cookies().set('user-id', data.user.id, {
				path: '/',
				maxAge: 60 * 60 * 24 * 7,
				sameSite: 'lax',
			});

			cookies().set('user-email', data.user.email || '', {
				path: '/',
				maxAge: 60 * 60 * 24 * 7,
				sameSite: 'lax',
			});

			// Get user role from user metadata
			const userRole = data.user.user_metadata?.role || 'user';
			cookies().set('user-role', userRole, {
				path: '/',
				maxAge: 60 * 60 * 24 * 7,
				sameSite: 'lax',
			});

			// Get user name from user metadata
			const userName =
				data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User';
			cookies().set('user-name', userName, {
				path: '/',
				maxAge: 60 * 60 * 24 * 7,
				sameSite: 'lax',
			});
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Unexpected error during session refresh:', error);
		return NextResponse.json(
			{ success: false, error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

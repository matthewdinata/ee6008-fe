import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	try {
		const requestUrl = new URL(request.url);
		const token_hash = requestUrl.searchParams.get('token_hash');
		const type = requestUrl.searchParams.get('type') || 'magiclink';

		// Create a Supabase client with the anon key
		const supabase = createClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
		);

		if (!token_hash) throw new Error('Missing token_hash');

		const { data, error } = await supabase.auth.verifyOtp({
			token_hash,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			type: type as any,
		});

		if (error) {
			throw error;
		}

		const session = data.session;
		if (!session) throw new Error('No session returned from Supabase');

		// Create an authenticated client to fetch user data
		const authenticatedClient = createClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
			{
				global: {
					headers: {
						Authorization: `Bearer ${session.access_token}`,
					},
				},
			}
		);

		// Get user role from database
		const { data: userData, error: userError } = await authenticatedClient
			.from('users')
			.select('role')
			.eq('email', session.user.email)
			.single();

		if (userError) {
			console.error('Error fetching user role:', userError);
		}

		// Determine redirect URL based on role
		let redirectUrl = '/dashboard'; // Default fallback

		if (userData?.role) {
			switch (userData.role.toLowerCase()) {
				case 'admin':
					redirectUrl = '/admin';
					break;
				case 'student':
					redirectUrl = '/student';
					break;
				case 'faculty':
					redirectUrl = '/faculty';
					break;
				default:
					redirectUrl = '/dashboard';
			}
		}

		const response = NextResponse.redirect(new URL(redirectUrl, request.url));

		const cookieOptions = {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax' as const,
			maxAge: 60 * 60 * 24 * 7,
			path: '/',
		};

		response.cookies.set('session-token', session.access_token, cookieOptions);
		response.cookies.set('refresh-token', session.refresh_token || '', cookieOptions);

		response.cookies.set('auth-callback-completed', 'true', {
			...cookieOptions,
			httpOnly: false,
			maxAge: 60,
		});

		// Set user metadata cookies for client access
		if (session.user.email) {
			response.cookies.set('user-email', session.user.email, {
				...cookieOptions,
				httpOnly: false,
			});
		}

		if (session.user.id) {
			response.cookies.set('user-id', session.user.id, {
				...cookieOptions,
				httpOnly: false,
			});
		}

		// Set user role cookie if available
		if (userData?.role) {
			response.cookies.set('user-role', userData.role.toLowerCase(), {
				...cookieOptions,
				httpOnly: false,
			});
		}

		// Set user name cookie if available
		const userName = session.user.user_metadata?.name || session.user.user_metadata?.full_name;
		if (userName) {
			response.cookies.set('user-name', userName, {
				...cookieOptions,
				httpOnly: false,
			});
		}

		return response;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		const encodedError = encodeURIComponent(errorMessage.substring(0, 100));
		return NextResponse.redirect(
			new URL(`/signin?error=auth_callback_error&details=${encodedError}`, request.url)
		);
	}
}

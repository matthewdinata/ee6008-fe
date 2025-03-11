import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	try {
		const requestUrl = new URL(request.url);
		const token_hash = requestUrl.searchParams.get('token_hash');
		const type = requestUrl.searchParams.get('type') || 'magiclink';

		const supabase = createRouteHandlerClient({ cookies });

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

		// Get user role from database
		const { data: userData, error: userError } = await supabase
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

		if (session.user.email) {
			response.cookies.set('user-email', session.user.email, {
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

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
	try {
		// Get cookieStore
		const cookieStore = cookies();
		const accessToken = cookieStore.get('session-token')?.value;

		// Create a Supabase client with the token if available
		const supabase = createClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
			{
				global: {
					headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
				},
			}
		);

		// Sign out from Supabase auth
		await supabase.auth.signOut();

		// Create response with redirect
		const response = NextResponse.redirect(new URL('/signin', request.url));

		// Clear all authentication cookies
		const cookiesToClear = [
			'session-token',
			'refresh-token',
			'user-role',
			'user-id',
			'user-name',
			'user-email',
			'auth-callback-completed',
			'sb-access-token',
			'sb-refresh-token',
			'supabase-auth-token',
		];

		// Clear each cookie on the response
		cookiesToClear.forEach((name) => {
			response.cookies.delete(name);
		});

		return response;
	} catch (error) {
		console.error('Error in signout API route:', error);

		// Return redirect even if there's an error
		const response = NextResponse.redirect(new URL('/signin?error=signout_error', request.url));

		// Still try to clear cookies in case of error
		const cookiesToClear = [
			'session-token',
			'refresh-token',
			'user-role',
			'user-id',
			'user-name',
			'user-email',
		];

		cookiesToClear.forEach((name) => {
			response.cookies.delete(name);
		});

		return response;
	}
}

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

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

		// Extract the origin from the request URL to maintain the same site
		const url = new URL(request.url);
		const origin = url.origin;

		// Create response with redirect to the same origin
		const response = NextResponse.redirect(`${origin}/signin`);

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

		// Extract the origin from the request URL even for error case
		const url = new URL(request.url);
		const origin = url.origin;

		// Return redirect even if there's an error, but to the same origin
		const response = NextResponse.redirect(`${origin}/signin?error=signout_error`);

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

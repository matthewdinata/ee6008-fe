// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
	try {
		console.log('\n🔵 ===== Middleware Check =====');
		console.log('📍 Path:', request.nextUrl.pathname);

		const res = NextResponse.next();
		const supabase = createMiddlewareClient({ req: request, res });

		// Get the authenticated user
		const {
			data: { user },
			error,
		} = await supabase.auth.getUser();

		if (error) {
			console.error('❌ Error retrieving user:', error);
			return NextResponse.redirect(new URL('/signin', request.url));
		}

		if (user) {
			console.log('✅ User authenticated:', { userId: user.id, email: user.email });

			// Calculate token expiry if access token is available
			const {
				data: { session },
			} = await supabase.auth.getSession();
			const expiresAt = session?.expires_at ? session.expires_at * 1000 : 0;
			const timeUntilExpire = expiresAt - Date.now();
			const shouldRefresh = timeUntilExpire < 1000 * 60 * 5; // Refresh if less than 5 minutes left

			console.log('🔑 Token Status:', {
				expiresAt: new Date(expiresAt).toLocaleString(),
				timeUntilExpire: Math.round(timeUntilExpire / 1000 / 60) + ' minutes',
				shouldRefresh,
			});

			if (shouldRefresh) {
				console.log('🔄 Refreshing token...');
				const {
					data: { session: newSession },
					error: refreshError,
				} = await supabase.auth.refreshSession();

				if (refreshError) {
					console.error('❌ Token refresh failed:', refreshError);
					return NextResponse.redirect(new URL('/signin', request.url));
				}

				if (newSession) {
					console.log('✅ Token refreshed successfully');
					console.log(
						'📅 New expiry:',
						new Date(newSession.expires_at! * 1000).toLocaleString()
					);

					// Verify the new session token with the backend
					try {
						const backendResponse = await fetch(
							`${process.env.NEXT_PUBLIC_API_URL}/auth/verify`,
							{
								method: 'POST',
								headers: {
									Authorization: `Bearer ${newSession.access_token}`,
									'Content-Type': 'application/json',
								},
								body: JSON.stringify({
									email: newSession.user.email,
									name: newSession.user.email?.split('@')[0],
									userId: newSession.user.id,
								}),
							}
						);

						if (!backendResponse.ok) {
							throw new Error('Backend verification failed');
						}

						const data = await backendResponse.json();
						console.log('✅ Backend verification successful with new token:', {
							role: data.user.role,
							userId: data.user.id,
						});
					} catch (error) {
						console.error('❌ Backend verification failed with new token:', error);
						return NextResponse.redirect(new URL('/signin', request.url));
					}
				}
			}
		} else {
			console.log('❌ User is not authenticated');
			return NextResponse.redirect(new URL('/signin', request.url));
		}

		return res;
	} catch (error) {
		console.error('❌ Middleware error:', error);
		return NextResponse.redirect(new URL('/signin', request.url));
	}
}

export const config = {
	matcher: [
		'/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
	],
};

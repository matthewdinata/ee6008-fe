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

		// Get user details
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser();
		const {
			data: { session },
		} = await supabase.auth.getSession();

		console.log('\n👤 User State:');
		if (user) {
			console.log({
				id: user.id,
				email: user.email,
				emailVerified: user.email_confirmed_at,
				lastSignIn: user.last_sign_in_at,
				metadata: user.user_metadata,
			});
		} else {
			console.log('No authenticated user');
		}

		if (userError) {
			console.error('❌ Auth Error:', userError);
		}

		// Session details
		console.log('\n🔑 Session State:');
		if (session) {
			console.log({
				accessToken: session.access_token?.substring(0, 10) + '...',
				tokenExpiry: new Date(session.expires_at! * 1000).toLocaleString(),
				provider: session.user.app_metadata.provider,
			});
		} else {
			console.log('No active session');
		}

		const publicRoutes = ['/signin', '/signup', '/auth/callback', '/auth/error'];
		const isPublicRoute = publicRoutes.some((route) =>
			request.nextUrl.pathname.startsWith(route)
		);

		console.log('\n🛣️ Route Info:', {
			path: request.nextUrl.pathname,
			isPublic: isPublicRoute,
			hasUser: !!user,
			hasSession: !!session,
		});

		// Allow callback route
		if (request.nextUrl.pathname.includes('/auth/callback')) {
			console.log('✅ Allowing callback route to pass through');
			return res;
		}

		// Protected route checks
		if (!user && !isPublicRoute) {
			console.log('❌ Access denied: No authenticated user');
			return NextResponse.redirect(new URL('/signin', request.url));
		}

		// Verify with backend for protected routes
		if (user && !isPublicRoute) {
			try {
				console.log('\n🔄 Verifying with backend...');

				const backendResponse = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/auth/verify`,
					{
						method: 'POST',
						headers: {
							Authorization: `Bearer ${session?.access_token}`,
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							email: user.email,
							name: user.email?.split('@')[0],
							userId: user.id,
						}),
					}
				);

				const data = await backendResponse.json();
				console.log('✅ Backend verification:', {
					status: backendResponse.status,
					role: data.user?.role,
					userId: data.user?.id,
				});
			} catch (error) {
				console.error('❌ Backend verification failed:', error);
				await supabase.auth.signOut();
				return NextResponse.redirect(new URL('/signin', request.url));
			}
		}

		console.log('\n✅ Middleware check completed');
		return res;
	} catch (error) {
		console.error('\n❌ Middleware error:', error);
		return NextResponse.redirect(new URL('/signin', request.url));
	}
}

export const config = {
	matcher: [
		'/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
	],
};

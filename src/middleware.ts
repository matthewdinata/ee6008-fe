import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Supabase client with token
const createSupabaseClient = (token: string) => {
	return createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			global: {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		}
	);
};

export async function middleware(request: NextRequest) {
	// Get token from cookies
	const accessToken = request.cookies.get('session-token')?.value;

	// If no token, redirect to signin
	if (!accessToken) {
		return NextResponse.redirect(new URL('/signin', request.url));
	}

	try {
		// Extract the requested path
		const requestedPath = request.nextUrl.pathname;

		// Create Supabase client with the token
		const supabase = createSupabaseClient(accessToken);

		// Verify token by getting user data
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser();

		if (userError || !user) {
			console.error('Invalid token:', userError?.message);
			throw new Error('Invalid token');
		}

		// Get user role from database
		const { data: userData, error: roleError } = await supabase
			.from('users')
			.select('role, name, id')
			.eq('email', user.email)
			.single();

		if (roleError || !userData) {
			console.error('❌ Failed to get user role:', roleError?.message);
			throw new Error('Failed to get user role');
		}

		const { role } = userData;

		// Simple role-based path authorization
		const hasAccess = checkPathAccess(role, requestedPath);

		if (!hasAccess) {
			return NextResponse.redirect(new URL('/unauthorized', request.url));
		}

		// User is authenticated and authorized - update cookies with user info
		const response = NextResponse.next();

		response.cookies.set('user-role', userData.role, {
			httpOnly: false, // Allow frontend access
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
		});

		response.cookies.set('user-id', userData.id.toString(), {
			httpOnly: false,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
		});

		response.cookies.set('user-name', userData.name, {
			httpOnly: false,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
		});

		return response;
	} catch (error) {
		console.error('⚠️ Authorization check error:', error);

		// Clear the invalid cookies
		const response = NextResponse.redirect(new URL('/signin', request.url));
		response.cookies.delete('session-token');
		response.cookies.delete('user-role');
		response.cookies.delete('user-id');
		response.cookies.delete('user-name');

		return response;
	}
}

function checkPathAccess(role: string, path: string): boolean {
	// Public paths that are accessible to all authenticated users
	const publicPaths = ['/signin', '/unauthorized'];
	if (publicPaths.some((p) => path.startsWith(p))) {
		return true;
	}

	// Role-based path checking - each role can only access their own paths
	switch (role) {
		case 'admin':
			return path.startsWith('/admin');

		case 'faculty':
			return path.startsWith('/faculty');

		case 'student':
			return path.startsWith('/student');

		default:
			return false;
	}
}

export const config = {
	matcher: [
		'/((?!_next/|favicon.ico|assets/|avatars/|images/|fonts/|api/|auth/|signin|unauthorized).*)',
	],
};

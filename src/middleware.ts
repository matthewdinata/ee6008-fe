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
		const url = new URL(request.url);
		const origin = url.origin;
		return NextResponse.redirect(`${origin}/signin`);
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

		// Get user role from database - using email as the lookup field
		let { data: userData, error: roleError } = await supabase
			.from('users')
			.select('role, name, id')
			.eq('email', user.email)
			.single();

		// If user doesn't exist in the database yet, create one with default role
		if (roleError && roleError.code === 'PGRST116') {
			console.log('User not found in database, creating new user record in middleware...');

			// Extract username from email
			const name = user.email?.split('@')[0] || 'User';

			// Create a new user record with default role
			const { data: newUser, error: createError } = await supabase
				.from('users')
				.insert([
					{
						id: user.id,
						email: user.email,
						name,
						role: 'student', // Default role - modify as needed
					},
				])
				.select('role, name, id')
				.single();

			if (createError) {
				console.error('Error creating user record:', createError);
				throw new Error('Failed to create user record');
			} else {
				userData = newUser;
				roleError = null;
			}
		} else if (roleError) {
			console.error('❌ Failed to get user role:', roleError?.message);
			throw new Error('Failed to get user role');
		}

		// Ensure userData is not null before accessing properties
		if (!userData) {
			throw new Error('User data is null, even after attempting to create user');
		}

		const { role } = userData;

		const hasAccess = checkPathAccess(role, requestedPath);

		if (!hasAccess) {
			const url = new URL(request.url);
			const origin = url.origin;
			return NextResponse.redirect(`${origin}/unauthorized`);
		}

		// User is authenticated and authorized - update cookies with user info
		const response = NextResponse.next();

		response.cookies.set('user-role', userData.role, {
			httpOnly: false, // Allow frontend access
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
		});

		response.cookies.set('user-id', user.id, {
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

		response.cookies.set('user-email', user.email || '', {
			httpOnly: false,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
		});

		return response;
	} catch (error) {
		console.error('⚠️ Authorization check error:', error);

		// Clear the invalid cookies
		const url = new URL(request.url);
		const origin = url.origin;
		const response = NextResponse.redirect(`${origin}/signin`);
		response.cookies.delete('session-token');
		response.cookies.delete('user-role');
		response.cookies.delete('user-id');
		response.cookies.delete('user-name');
		response.cookies.delete('user-email');

		return response;
	}
}

function checkPathAccess(role: string, path: string): boolean {
	const publicPaths = [
		'/signin',
		'/unauthorized',
		'/dashboard',
		'/googlee217630cb03f37b2.html',
		'/robots.txt',
		'/sitemap.xml',
	];

	// Check if path is in public paths list
	if (publicPaths.some((p) => path === p || path.startsWith(p))) {
		return true;
	}

	if (path === '/') {
		return true;
	}

	switch (role) {
		case 'admin':
			return path.startsWith('/admin') || path === '/';

		case 'faculty':
			return path.startsWith('/faculty') || path === '/';

		case 'student':
			return path.startsWith('/student') || path === '/';

		default:
			return false;
	}
}

export const config = {
	matcher: [
		'/((?!_next/|favicon.ico|assets/|avatars/|images/|fonts/|api/|auth/|signin|unauthorized|googlee217630cb03f37b2.html|robots.txt|sitemap.xml).*)',
	],
};

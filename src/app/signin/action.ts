'use server';

import { cookies } from 'next/headers';

import { checkAuth } from '@/utils/actions/auth';

import { createClient } from '@/app/utils/supabase/server';

export async function checkEligibility(email: string): Promise<boolean> {
	try {
		const result = await checkAuth(email);
		const data = result;
		return data.isEligible;
	} catch (error) {
		console.error('Eligibility check error:', error);
		return false;
	}
}

export async function login(formData: FormData) {
	const supabase = await createClient();
	const email = formData.get('email') as string;

	if (!email) {
		return { error: 'Email is required' };
	}

	try {
		const isEligible = await checkEligibility(email);

		if (!isEligible) {
			return {
				error: "You're not registered in EE6008. Please contact the course administrator.",
			};
		}

		// Use OTP instead of magic link
		const { error } = await supabase.auth.signInWithOtp({
			email,
			options: {
				// Using OTP without redirect URL
				shouldCreateUser: true,
			},
		});

		if (error) {
			return { error: error.message };
		}

		return {
			success: `✓ OTP code sent! Check your email ${email} for the verification code. The code will expire in 10 minutes.`,
		};
	} catch (error) {
		console.error('Login error:', error);
		return {
			error: error instanceof Error ? error.message : 'An unexpected error occurred',
		};
	}
}

export async function verifyOtp(formData: FormData) {
	const supabase = await createClient();
	const email = formData.get('email') as string;
	const otp = formData.get('otp') as string;

	if (!email || !otp) {
		return { error: 'Email and OTP code are required' };
	}

	try {
		// Verify the OTP
		const { data, error } = await supabase.auth.verifyOtp({
			email,
			token: otp,
			type: 'email',
		});

		if (error) {
			return { error: error.message };
		}

		if (!data.session) {
			return { error: 'Authentication failed. Please try again.' };
		}

		// Get user role from database
		const { data: userData, error: userError } = await supabase
			.from('users')
			.select('role')
			.eq('email', email)
			.single();

		if (userError) {
			console.error('Error fetching user role:', userError);
			// Still continue but with a default role
		}

		// Set session cookies
		const cookieStore = cookies();
		cookieStore.set('session-token', data.session.access_token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7, // 1 week
			path: '/',
		});

		if (data.session.refresh_token) {
			cookieStore.set('refresh-token', data.session.refresh_token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 30, // 30 days
				path: '/',
			});
		}

		// Set user metadata cookies (non-httpOnly so they can be accessed by client)
		if (data.session.user.email) {
			cookieStore.set('user-email', data.session.user.email, {
				httpOnly: false,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 7, // 1 week
				path: '/',
			});
		}

		// Determine redirect URL based on role
		let redirectTo = '/'; // Default fallback

		if (userData?.role) {
			const role = userData.role.toLowerCase();

			// Set user role cookie
			cookieStore.set('user-role', role, {
				httpOnly: false,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 7, // 1 week
				path: '/',
			});

			switch (role) {
				case 'admin':
					redirectTo = '/admin';
					break;
				case 'student':
					redirectTo = '/student';
					break;
				case 'faculty':
					redirectTo = '/faculty';
					break;
				default:
					redirectTo = '/';
			}
		}

		return {
			success: 'Successfully authenticated',
			redirectTo,
		};
	} catch (error) {
		console.error('OTP verification error:', error);
		return {
			error: error instanceof Error ? error.message : 'Failed to verify OTP',
		};
	}
}

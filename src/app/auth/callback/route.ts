// app/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	try {
		console.log('\n🔵 ===== Auth Callback =====');

		const requestUrl = new URL(request.url);
		const code = requestUrl.searchParams.get('code');
		const token_hash = requestUrl.searchParams.get('token_hash');
		const type = requestUrl.searchParams.get('type') || 'magiclink';

		console.log('📝 Auth Parameters:', {
			hasCode: !!code,
			token_hash: token_hash ? token_hash.substring(0, 10) + '...' : null,
			type,
			fullUrl: request.url,
		});

		const supabase = createRouteHandlerClient({ cookies });
		console.log('🔗 Supabase client initialized');

		let session;

		if (code) {
			console.log('🔄 Exchanging code for session...');
			const { data, error } = await supabase.auth.exchangeCodeForSession(code);
			if (error) throw error;
			session = data.session;
		} else if (token_hash) {
			console.log('🔄 Verifying OTP token...');
			const { data, error } = await supabase.auth.verifyOtp({
				token_hash,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				type: type as any,
			});
			if (error) throw error;
			session = data.session;
		}

		if (!session) {
			throw new Error('No session established');
		}

		console.log('\n👤 User Details:', {
			id: session.user.id,
			email: session.user.email,
			emailVerified: session.user.email_confirmed_at,
			metadata: session.user.user_metadata,
		});

		console.log('\n🔑 Session Details:', {
			accessToken: session.access_token.substring(0, 10) + '...',
			expiresAt: new Date(session.expires_at! * 1000).toLocaleString(),
			provider: session.user.app_metadata.provider,
		});

		// Verify with backend
		console.log('\n🔄 Verifying with backend...');
		const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${session.access_token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				email: session.user.email,
				name: session.user.email?.split('@')[0],
				userId: session.user.id,
			}),
		});

		const data = await backendResponse.json();
		console.log('✅ Backend Response:', {
			status: backendResponse.status,
			success: data.success,
			role: data.user?.role,
			userId: data.user?.id,
		});

		// Create response with redirect
		const response = NextResponse.redirect(
			new URL(`${data.user?.role}/dashboard`, request.url)
		);

		console.log('\n✅ Authentication flow completed successfully');
		return response;
	} catch (error) {
		console.error('\n❌ Callback error:', error);
		return NextResponse.redirect(new URL('/signin?error=auth_callback_error', request.url));
	}
}

// app/api/auth/check-eligibility/route.ts
import { NextResponse } from 'next/server';

import { checkAuth } from '@/utils/actions/auth';

export async function POST(request: Request) {
	try {
		const { email } = await request.json();

		const result = await checkAuth(email);
		const data = result;

		return NextResponse.json(data);
	} catch (error) {
		return NextResponse.json({ error: 'Failed to check eligibility' }, { status: 500 });
	}
}

// app/api/auth/check-eligibility/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
	try {
		const { email } = await request.json();

		const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/check`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ email }),
		});

		const data = await response.json();

		return NextResponse.json(data);
	} catch (error) {
		return NextResponse.json({ error: 'Failed to check eligibility' }, { status: 500 });
	}
}

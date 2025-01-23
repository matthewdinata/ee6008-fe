/* eslint-disable prettier/prettier */
// app/auth/error/page.tsx
'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

/* eslint-disable prettier/prettier */
// app/auth/error/page.tsx

// app/auth/error/page.tsx

interface ErrorDetails {
	error: string;
	description: string;
	hashParams: Record<string, string>;
}

export default function ErrorPage() {
	const searchParams = useSearchParams();
	const [errorDetails, setErrorDetails] = useState<ErrorDetails>({
		error: searchParams?.get('error') || 'unknown',
		description: searchParams?.get('description') || 'An unknown error occurred',
		hashParams: {},
	});

	useEffect(() => {
		// Parse hash params on client side
		const hash = window.location.hash.slice(1);
		const params = new URLSearchParams(hash);
		const paramsObj: Record<string, string> = {};

		params.forEach((value, key) => {
			paramsObj[key] = value;
		});

		setErrorDetails((prev) => ({
			...prev,
			hashParams: paramsObj,
		}));
	}, []);

	const getErrorMessage = () => {
		switch (errorDetails.error) {
			case 'no_code':
				return 'Authentication code is missing. This might happen if the link is incomplete or malformed.';
			case 'expired_link':
				return 'The authentication link has expired. Please request a new one.';
			case 'invalid_link':
				return 'The authentication link is invalid. Please request a new one.';
			case 'session_error':
				return 'Failed to create a session. Please try signing in again.';
			case 'backend_error':
				return 'Failed to verify with the backend service. Please try again.';
			default:
				return errorDetails.description;
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
			<div className="max-w-md w-full space-y-8">
				<div>
					<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
						Authentication Error
					</h2>
					<div className="mt-2 text-center text-sm text-gray-600">
						{getErrorMessage()}
					</div>
				</div>

				<div className="mt-8 space-y-6">
					<div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
						<div className="flex">
							<div className="ml-3">
								<p className="text-sm text-yellow-700">
									Error type: {errorDetails.error}
								</p>
							</div>
						</div>
					</div>

					<div className="flex justify-center">
						<Link
							href="/signin"
							className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
						>
							Return to Sign In
						</Link>
					</div>

					{process.env.NODE_ENV === 'development' && (
						<div className="mt-8">
							<h3 className="text-lg font-medium text-gray-900 mb-2">
								Debug Information
							</h3>
							<pre className="bg-gray-800 text-white p-4 rounded-md overflow-x-auto text-sm">
								{JSON.stringify(
									{
										error: errorDetails.error,
										description: errorDetails.description,
										hashParams: errorDetails.hashParams,
									},
									null,
									2
								)}
							</pre>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

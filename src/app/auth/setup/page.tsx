// pages/auth/setup.tsx
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function SetupPage() {
	const router = useRouter();

	useEffect(() => {
		// Simulate setup tasks
		setTimeout(() => {
			router.push('/dashboard');
		}, 3000); // Adjust time as needed for any real setup tasks
	}, [router]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="max-w-md w-full p-8 bg-white rounded-lg shadow text-center">
				<h3 className="text-lg font-medium text-gray-900">
					Welcome! Completing your setup...
				</h3>
				<p className="mt-2 text-gray-500">You ll be redirected shortly.</p>
			</div>
		</div>
	);
}

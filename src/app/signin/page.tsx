'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

type MessageType = {
	text: string;
	type: 'success' | 'error' | 'info';
};

const AuthPage = () => {
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<MessageType>({ text: '', type: 'info' });
	const [debugLog, setDebugLog] = useState<string[]>([]);

	useEffect(() => {
		const checkSession = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (session) {
				router.push('/dashboard');
			}
		};

		checkSession();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			if (session) {
				router.push('/dashboard');
			}
		});

		return () => subscription.unsubscribe();
	}, [router]);

	const addDebugMessage = (msg: string) => {
		const timestamp = new Date().toLocaleTimeString();
		setDebugLog((prev) => [...prev, `${timestamp}: ${msg}`]);
	};

	const checkEligibility = async (email: string): Promise<boolean> => {
		try {
			addDebugMessage('Checking eligibility...');
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/check`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email }),
			});

			if (!response.ok) {
				throw new Error('Failed to check eligibility');
			}

			const data = await response.json();
			return data.isEligible;
		} catch (error) {
			console.error('Eligibility check error:', error);
			return false;
		}
	};

	const handleAuth = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setMessage({ text: '', type: 'info' });
		setDebugLog([]);

		try {
			const isEligible = await checkEligibility(email);

			if (!isEligible) {
				setMessage({
					text: "You're not registered in EE6008. Please contact the course administrator.",
					type: 'error',
				});
				return;
			}

			addDebugMessage('Starting authentication process');

			const { error } = await supabase.auth.signInWithOtp({
				email,
				options: {
					emailRedirectTo: `${window.location.origin}/auth/callback`,
					shouldCreateUser: true,
				},
			});

			if (error) throw error;

			addDebugMessage('Magic link sent successfully');
			setMessage({
				text: `✓Link sent! Check your email ${email} to sign in. The link will expire in 1 hour.`,
				type: 'success',
			});
			setEmail('');
		} catch (error) {
			console.error('Authentication error:', error);
			setMessage({
				text:
					error instanceof Error
						? error.message
						: 'An error occurred during authentication',
				type: 'error',
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
			<div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
				<div>
					<h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
						Welcome to EE6008
					</h2>
					<p className="mt-2 text-center text-sm text-gray-600">
						Sign in with your registered email address
					</p>
				</div>

				<form onSubmit={handleAuth} className="mt-8 space-y-6">
					<div>
						<label htmlFor="email" className="block text-sm font-medium text-gray-700">
							Email address
						</label>
						<div className="mt-1">
							<input
								id="email"
								name="email"
								type="email"
								autoComplete="email"
								required
								value={email}
								onChange={(e) => setEmail(e.target.value.toLowerCase())}
								className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
								placeholder="name@e.ntu.edu.sg"
							/>
						</div>
					</div>

					{message.text && (
						<div
							className={`rounded-md p-4 ${
								message.type === 'success'
									? 'bg-green-50'
									: message.type === 'error'
										? 'bg-red-50'
										: 'bg-blue-50'
							}`}
						>
							<div className="flex">
								<div className="flex-shrink-0">
									{message.type === 'success' ? (
										<svg
											className="h-5 w-5 text-green-400"
											viewBox="0 0 20 20"
											fill="currentColor"
										>
											<path
												fillRule="evenodd"
												d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
												clipRule="evenodd"
											/>
										</svg>
									) : (
										message.type === 'error' && (
											<svg
												className="h-5 w-5 text-red-400"
												viewBox="0 0 20 20"
												fill="currentColor"
											>
												<path
													fillRule="evenodd"
													d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
													clipRule="evenodd"
												/>
											</svg>
										)
									)}
								</div>
								<div className="ml-3">
									<p
										className={`text-sm ${
											message.type === 'success'
												? 'text-green-800'
												: message.type === 'error'
													? 'text-red-800'
													: 'text-blue-800'
										}`}
									>
										{message.text}
									</p>
								</div>
							</div>
						</div>
					)}

					<button
						type="submit"
						disabled={loading}
						className={`flex w-full justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium text-white shadow-sm ${
							loading
								? 'bg-indigo-400 cursor-not-allowed'
								: 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
						}`}
					>
						{loading ? (
							<span className="flex items-center">
								<svg
									className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
								>
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
									/>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									/>
								</svg>
								Sending magic link...
							</span>
						) : (
							'Send magic link'
						)}
					</button>
				</form>

				{process.env.NODE_ENV === 'development' && debugLog.length > 0 && (
					<div className="mt-8 p-4 bg-gray-50 rounded-md">
						<h3 className="text-sm font-medium text-gray-700 mb-2">Debug Log:</h3>
						<pre className="text-xs text-gray-600 whitespace-pre-wrap">
							{debugLog.join('\n')}
						</pre>
					</div>
				)}
			</div>
		</div>
	);
};

export default AuthPage;

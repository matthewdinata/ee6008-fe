'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { login } from './action';

type MessageType = {
	text: string;
	type: 'success' | 'error' | 'info';
};

const AuthPage = () => {
	const [email, setEmail] = useState('');
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<MessageType>({ text: '', type: 'info' });
	const [debugLog, setDebugLog] = useState<string[]>([]);
	const router = useRouter();
	const supabase = createClientComponentClient();

	// Check if user is already logged in and redirect if they are
	useEffect(() => {
		const checkSession = async () => {
			setLoading(true);
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (session) {
				// User is already logged in, redirect to dashboard
				console.log('User already logged in, redirecting to dashboard');
				router.push('/dashboard');
			} else {
				setLoading(false);
			}
		};
		checkSession();
	}, [router, supabase.auth]);

	const addDebugMessage = (msg: string) => {
		const timestamp = new Date().toLocaleTimeString();
		setDebugLog((prev) => [...prev, `${timestamp}: ${msg}`]);
	};

	const handleAuth = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setMessage({ text: '', type: 'info' });
		setDebugLog([]);

		try {
			addDebugMessage('Starting authentication process');

			const formData = new FormData();
			formData.append('email', email);

			const result = await login(formData);

			if (result.error) {
				throw new Error(result.error);
			}

			addDebugMessage('Magic link sent successfully');
			setMessage({ text: result.success || 'Success', type: 'success' });
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
		<div className="min-h-screen flex items-center justify-center bg-background p-4">
			<div className="max-w-md w-full space-y-8 p-8 bg-card rounded-lg shadow">
				<div>
					<h2 className="text-center text-3xl font-bold tracking-tight text-foreground">
						Welcome to EE6008
					</h2>
					<p className="mt-2 text-center text-sm text-muted-foreground">
						Sign in with your registered email address
					</p>
				</div>

				<form onSubmit={handleAuth} className="mt-8 space-y-6">
					<div>
						<label
							htmlFor="email"
							className="block text-sm font-medium text-foreground"
						>
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
								className="block w-full appearance-none rounded-md border border-input bg-background px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
								placeholder="name@e.ntu.edu.sg"
							/>
						</div>
					</div>

					{message.text && (
						<div
							className={`rounded-md p-4 ${
								message.type === 'success'
									? 'bg-green-100 dark:bg-green-950'
									: message.type === 'error'
										? 'bg-destructive/10'
										: 'bg-blue-100 dark:bg-blue-950'
							}`}
						>
							<div className="flex">
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
						className={`flex w-full justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium text-primary-foreground shadow-sm ${
							loading
								? 'bg-primary/70 cursor-not-allowed'
								: 'bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
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
					<div className="mt-8 p-4 bg-muted rounded-md">
						<h3 className="text-sm font-medium text-foreground mb-2">Debug Log:</h3>
						<pre className="text-xs text-muted-foreground whitespace-pre-wrap">
							{debugLog.join('\n')}
						</pre>
					</div>
				)}
			</div>
		</div>
	);
};

export default AuthPage;

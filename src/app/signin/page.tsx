'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { createClient } from '@/app/utils/supabase/client';

import { login, verifyOtp } from './action';

type MessageType = {
	text: string;
	type: 'success' | 'error' | 'info';
};

const AuthPage = () => {
	const [email, setEmail] = useState('');
	const [otp, setOtp] = useState('');
	const [loading, setLoading] = useState(false);
	const [otpSent, setOtpSent] = useState(false);
	const [sessionLoading, setSessionLoading] = useState(true);
	const [message, setMessage] = useState<MessageType>({ text: '', type: 'info' });
	const [debugLog, setDebugLog] = useState<string[]>([]);
	const router = useRouter();

	// Get the Supabase client
	const supabase = createClient();

	// Check if user is already logged in and redirect if they are
	useEffect(() => {
		const checkSession = async () => {
			try {
				setSessionLoading(true);
				const {
					data: { session },
					error,
				} = await supabase.auth.getSession();

				if (error) {
					console.error('Session check error:', error);
					addDebugMessage(`Session error: ${error.message}`);
				}

				if (session) {
					// User is already logged in, redirect to dashboard
					console.log('User already logged in, redirecting to dashboard');
					addDebugMessage('User already logged in, redirecting to dashboard');

					router.push(`/${session?.user?.role?.toLowerCase}/`);
				}
			} catch (err) {
				console.error('Session check exception:', err);
				addDebugMessage(
					`Session check exception: ${err instanceof Error ? err.message : String(err)}`
				);
			} finally {
				setSessionLoading(false);
			}
		};

		checkSession();
	}, [router, supabase.auth]);

	const addDebugMessage = (msg: string) => {
		const timestamp = new Date().toLocaleTimeString();
		setDebugLog((prev) => [...prev, `${timestamp}: ${msg}`]);
	};

	const handleSendOtp = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setMessage({ text: '', type: 'info' });
		setDebugLog([]);

		try {
			addDebugMessage('Starting OTP request process');

			const formData = new FormData();
			formData.append('email', email);

			const result = await login(formData);

			if (result.error) {
				throw new Error(result.error);
			}

			addDebugMessage('OTP sent successfully');
			setMessage({ text: result.success || 'Success', type: 'success' });
			setOtpSent(true);
		} catch (error) {
			console.error('Authentication error:', error);
			addDebugMessage(
				`Authentication error: ${error instanceof Error ? error.message : String(error)}`
			);
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

	const handleVerifyOtp = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setMessage({ text: '', type: 'info' });

		try {
			addDebugMessage('Starting OTP verification process');

			const formData = new FormData();
			formData.append('email', email);
			formData.append('otp', otp);

			const result = await verifyOtp(formData);

			if (result.error) {
				throw new Error(result.error);
			}

			addDebugMessage('OTP verified successfully');
			setMessage({ text: 'Logging you in...', type: 'success' });

			// Redirect will be handled by the server action or the useEffect
			if (result.redirectTo) {
				router.push(result.redirectTo);
			}
		} catch (error) {
			console.error('Verification error:', error);
			addDebugMessage(
				`Verification error: ${error instanceof Error ? error.message : String(error)}`
			);
			setMessage({
				text:
					error instanceof Error
						? error.message
						: 'An error occurred during verification',
				type: 'error',
			});
		} finally {
			setLoading(false);
		}
	};

	// Show a loading indicator while checking the session
	if (sessionLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background p-4">
				<div className="flex flex-col items-center space-y-4">
					<Loader2 className="h-10 w-10 text-primary animate-spin" />
					<p className="text-muted-foreground">Checking session...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-background p-4">
			<div className="gradient-background absolute inset-0 -z-10" />

			<Card className="max-w-md w-full">
				<CardHeader className="space-y-1">
					<CardTitle className="text-center text-3xl font-bold">
						Welcome to EE6008
					</CardTitle>
					<CardDescription className="text-center">
						{otpSent
							? 'Enter the OTP code sent to your email'
							: 'Sign in with your registered email address'}
					</CardDescription>
				</CardHeader>

				<CardContent>
					{!otpSent ? (
						<form onSubmit={handleSendOtp} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="email">Email address</Label>
								<Input
									id="email"
									name="email"
									type="email"
									autoComplete="email"
									required
									value={email}
									onChange={(e) => setEmail(e.target.value.toLowerCase())}
									placeholder="name@e.ntu.edu.sg"
									disabled={loading}
									className="bg-background"
								/>
							</div>

							{message.text && (
								<Alert
									className={`text-foreground ${
										message.type === 'success'
											? 'text-green-800 dark:text-green-400 bg-green-100 dark:bg-green-950'
											: message.type === 'error'
												? 'bg-destructive/20'
												: 'text-blue-800 dark:text-blue-400 bg-blue-100 dark:bg-blue-950'
									}`}
								>
									<AlertDescription>{message.text}</AlertDescription>
								</Alert>
							)}

							<Button type="submit" className="w-full" disabled={loading}>
								{loading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Sending OTP code...
									</>
								) : (
									'Send OTP code'
								)}
							</Button>
						</form>
					) : (
						<form onSubmit={handleVerifyOtp} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="otp">OTP Code</Label>
								<Input
									id="otp"
									name="otp"
									type="text"
									autoComplete="one-time-code"
									required
									value={otp}
									onChange={(e) => setOtp(e.target.value)}
									placeholder="Enter your OTP code"
									disabled={loading}
									className="bg-background"
								/>
							</div>

							{message.text && (
								<Alert
									className={`text-foreground ${
										message.type === 'success'
											? 'text-green-800 dark:text-green-400 bg-green-100 dark:bg-green-950'
											: message.type === 'error'
												? 'bg-destructive/20'
												: 'text-blue-800 dark:text-blue-400 bg-blue-100 dark:bg-blue-950'
									}`}
								>
									<AlertDescription>{message.text}</AlertDescription>
								</Alert>
							)}

							<div className="space-y-2">
								<Button type="submit" className="w-full" disabled={loading}>
									{loading ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Verifying...
										</>
									) : (
										'Verify and Sign In'
									)}
								</Button>

								<div className="flex justify-between mt-2">
									<Button
										type="button"
										variant="link"
										size="sm"
										className="text-primary px-0"
										onClick={() => {
											if (!loading) {
												setOtpSent(false);
												setOtp('');
												setMessage({ text: '', type: 'info' });
											}
										}}
										disabled={loading}
									>
										Try a different email
									</Button>

									<Button
										type="button"
										variant="link"
										size="sm"
										className="text-primary px-0"
										onClick={(e) => {
											if (!loading) {
												handleSendOtp(
													e as React.MouseEvent<HTMLButtonElement>
												);
											}
										}}
										disabled={loading}
									>
										Resend OTP
									</Button>
								</div>
							</div>
						</form>
					)}
				</CardContent>

				{process.env.NODE_ENV === 'development' && debugLog.length > 0 && (
					<CardFooter>
						<div className="w-full p-3 bg-muted rounded-md">
							<h3 className="text-sm font-medium text-foreground mb-2">Debug Log:</h3>
							<pre className="text-xs text-muted-foreground whitespace-pre-wrap">
								{debugLog.join('\n')}
							</pre>
						</div>
					</CardFooter>
				)}
			</Card>
		</div>
	);
};

export default AuthPage;

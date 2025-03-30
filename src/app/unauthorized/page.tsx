/* eslint-disable prettier/prettier */
// app/unauthorized/page.tsx
'use client';

import { AlertCircle, ArrowLeft, Home, Shield } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';

/* eslint-disable prettier/prettier */
// app/unauthorized/page.tsx

/* eslint-disable prettier/prettier */
// app/unauthorized/page.tsx

/* eslint-disable prettier/prettier */
// app/unauthorized/page.tsx

export default function UnauthorizedPage() {
	const router = useRouter();
	const [role, setRole] = useState<string | null>(null);
	const [countdown, setCountdown] = useState(5);

	useEffect(() => {
		// Get user role from cookie
		const roleFromCookie = document.cookie
			.split('; ')
			.find((row) => row.startsWith('user-role='))
			?.split('=')[1];

		setRole(roleFromCookie || null);

		// Start countdown for auto-redirect to appropriate home page
		const timer = setInterval(() => {
			setCountdown((prev) => {
				if (prev <= 1) {
					clearInterval(timer);
					// Redirect to role-specific home page
					if (roleFromCookie) {
						router.push(`/${roleFromCookie.toLowerCase()}`);
					} else {
						router.push('/signin');
					}
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [router]);

	// Get appropriate home path based on role
	const getHomePath = () => {
		if (!role) return '/signin';
		return `/${role.toLowerCase()}`;
	};

	return (
		<div className="container flex flex-col items-center justify-center min-h-[80vh] py-12 px-4 md:px-6">
			<Card className="w-full max-w-md shadow-lg border-destructive/30">
				<CardHeader className="space-y-1 pb-2">
					<div className="flex justify-center mb-4">
						<Shield className="h-16 w-16 text-destructive/70" />
					</div>
					<CardTitle className="text-2xl font-bold text-center">Access Denied</CardTitle>
					<CardDescription className="text-center text-muted-foreground">
						You don&apos;t have permission to access this resource
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-4">
					<Alert
						variant="destructive"
						className="bg-destructive/10 text-destructive border-destructive/20"
					>
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>Unauthorized Access</AlertTitle>
						<AlertDescription>
							Your current role ({role || 'Unknown'}) doesn&apos;t have permission to
							access the requested page. Please return to your designated area.
						</AlertDescription>
					</Alert>

					<div className="text-sm text-muted-foreground">
						<p>Each role has access to specific areas:</p>
						<ul className="list-disc list-inside mt-2 space-y-1">
							<li>
								<span className="font-semibold">Admin:</span> /admin/*
							</li>
							<li>
								<span className="font-semibold">Faculty:</span> /faculty/*
							</li>
							<li>
								<span className="font-semibold">Student:</span> /student/*
							</li>
						</ul>
					</div>
				</CardContent>

				<CardFooter className="flex flex-col space-y-3">
					<div className="grid grid-cols-2 gap-2 w-full">
						<Button
							variant="outline"
							size="sm"
							className="w-full"
							onClick={() => router.back()}
						>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Go Back
						</Button>
						<Button variant="default" size="sm" className="w-full" asChild>
							<Link href={getHomePath()}>
								<Home className="mr-2 h-4 w-4" />
								My Dashboard
							</Link>
						</Button>
					</div>

					<p className="text-center text-sm text-muted-foreground pt-2">
						Redirecting to your dashboard in {countdown} seconds...
					</p>
				</CardFooter>
			</Card>
		</div>
	);
}

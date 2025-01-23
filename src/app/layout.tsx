// app/layout.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { cookies } from 'next/headers';

import AppBreadcrumbs from '@/components/app-breadcrumbs';
import AppHeader from '@/components/app-header';
import AppSidebar from '@/components/app-sidebar';
import Background from '@/components/background';
import ThemeProvider from '@/components/theme-provider';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

import './globals.css';

const geistSans = localFont({
	src: './fonts/GeistVF.woff',
	variable: '--font-geist-sans',
	weight: '100 900',
});

const geistMono = localFont({
	src: './fonts/GeistMonoVF.woff',
	variable: '--font-geist-mono',
	weight: '100 900',
});

export const metadata: Metadata = {
	title: 'EE6008',
	description: 'EE6008 Application',
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	// Initialize Supabase client
	const supabase = createServerComponentClient({ cookies });

	// Get authenticated user data
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();

	// If no authenticated user or error, render basic layout
	if (!user || userError) {
		return (
			<html lang="en">
				<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						{children}
					</ThemeProvider>
				</body>
			</html>
		);
	}

	// Verify user with backend
	try {
		const {
			data: { session },
		} = await supabase.auth.getSession();
		if (!session?.access_token) throw new Error('No access token');

		const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${session.access_token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				email: user.email,
				name: user.email?.split('@')[0],
				userId: user.id,
			}),
		});

		if (!response.ok) {
			throw new Error('Backend verification failed');
		}

		const data = await response.json();
		const role = data.user.role;

		// If user is pending, show basic layout
		if (role === 'pending') {
			return (
				<html lang="en">
					<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
						<ThemeProvider
							attribute="class"
							defaultTheme="system"
							enableSystem
							disableTransitionOnChange
						>
							{children}
						</ThemeProvider>
					</body>
				</html>
			);
		}

		// Full layout for verified users
		return (
			<html lang="en">
				<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						<Background>
							<SidebarProvider>
								<AppSidebar role={role} />
								<SidebarInset>
									<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 fixed top-0 w-full backdrop-blur-sm justify-bet">
										<div className="flex items-center gap-2 px-4">
											<SidebarTrigger className="-ml-1" />
											<Separator
												orientation="vertical"
												className="mr-2 h-4 bg-secondary-foreground/30"
											/>
											<AppBreadcrumbs />
										</div>
									</header>
									<main>
										<AppHeader className="mt-16 px-4" />
										{children}
									</main>
								</SidebarInset>
							</SidebarProvider>
						</Background>
					</ThemeProvider>
				</body>
			</html>
		);
	} catch (error) {
		// On any error, show basic layout
		console.error('Layout error:', error);
		return (
			<html lang="en">
				<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						{children}
					</ThemeProvider>
				</body>
			</html>
		);
	}
}

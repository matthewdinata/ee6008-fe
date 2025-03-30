import { createClient } from '@supabase/supabase-js';
import { Analytics } from '@vercel/analytics/next';
import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { cookies, headers } from 'next/headers';

import { checkEligibility } from '@/utils/actions/auth';

import AppBreadcrumbs from '@/components/layout/app-breadcrumbs';
import AppHeader from '@/components/layout/app-header';
import AppSidebar from '@/components/layout/app-sidebar';
import { AuthProvider } from '@/components/layout/auth-provider';
import Background from '@/components/layout/background';
import CourseStructuredData from '@/components/structured-data';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';

import './globals.css';
import Provider from './provider';

// --------------------
// 1) Font Definitions
// --------------------
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

// ---------------------
// 2) Export Page Metadata
// ---------------------
export const metadata: Metadata = {
	title: 'EE6008 - Collaborative Research and Development Project - NTU',
	description:
		'EE6008 Collaborative Research and Development Project for MSc students at Nanyang Technological University. Gain practical experience in design, implementation, prototyping and testing of electrical and electronic engineering projects.',
	keywords:
		'EE6008, NTU, Nanyang Technological University, Collaborative Research, Development Project, MSc EEE, School of EEE, Electronic Engineering',
	authors: [{ name: 'NTU School of Electrical and Electronic Engineering' }],
	metadataBase: new URL('https://ee6008-fe.vercel.app'),
	openGraph: {
		title: 'EE6008 - Collaborative Research and Development Project - NTU Singapore',
		description:
			'Course management system for EE6008 at Nanyang Technological University School of EEE',
		url: 'https://ee6008-fe.vercel.app',
		siteName: 'EE6008 Course Portal',
		locale: 'en_SG',
		type: 'website',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'EE6008 - Collaborative Research and Development Project - NTU',
		description:
			'MSc course at Nanyang Technological University School of EEE. 3 AUs, AY2023-24 Semester 2.',
	},
	icons: {
		icon: '/favicon.ico',
	},
	robots: {
		index: true,
		follow: true,
	},
};

// Export viewport configuration separately
export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	minimumScale: 1,
};

// ----------------------------------------
// 3) Basic Layout (for unauthenticated or errors)
// ----------------------------------------
function BasicLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<Provider>
					<AuthProvider>
						<CourseStructuredData />
						{children}
						<Analytics />
					</AuthProvider>
				</Provider>
			</body>
		</html>
	);
}

// -----------------------------
// 4) Root Layout (entry point)
// -----------------------------
export default async function RootLayout({ children }: { children: React.ReactNode }) {
	// Get current path to check for auth pages
	const headersList = headers();
	const pathname = headersList.get('x-pathname') || headersList.get('x-url') || '';

	// Check if we're on an auth-related page so we can show a simpler layout
	// Note: Next.js strips the query string from the pathname
	const isAuthPage = pathname.startsWith('/signin');
	const isUnauthorizedPage = pathname.startsWith('/unauthorized');

	// If this is an auth page (signin, etc.), use simplified layout
	if (isAuthPage || isUnauthorizedPage) {
		return (
			<html lang="en">
				<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
					<Provider>
						<AuthProvider>
							<CourseStructuredData />
							{children}
							<Analytics />
						</AuthProvider>
					</Provider>
				</body>
			</html>
		);
	}

	// Get session token from cookies
	const cookieStore = cookies();
	const accessToken = cookieStore.get('session-token')?.value;

	// If no token, render the basic layout
	if (!accessToken) {
		return <BasicLayout>{children}</BasicLayout>;
	}

	try {
		// Create Supabase client with the token
		const supabase = createClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
			{
				global: {
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				},
			}
		);

		// Verify user with token
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser();

		// If no user or error occurs, render the basic layout
		if (!user || userError) {
			console.error('Auth error in layout:', userError?.message);
			return <BasicLayout>{children}</BasicLayout>;
		}

		// Use the checkEligibility server action to get user role
		const userData = {
			email: user.email || '',
			name: user.email?.split('@')[0] || '',
			userId: user.id,
		};

		const data = await checkEligibility(userData, accessToken);
		const role = data.user.role;

		// Return the full layout if the user is verified
		return (
			<html lang="en">
				<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
					<Provider>
						<Background>
							<AuthProvider>
								<SidebarProvider>
									<AppSidebar role={role} />
									<SidebarInset className="w-full overflow-x-hidden">
										<header
											className="flex h-16 shrink-0 items-center gap-2 
                                
                                transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 fixed top-0 w-full backdrop-blur-sm justify-bet"
										>
											<div className="flex items-center gap-2 px-4">
												<SidebarTrigger className="-ml-1" />
												<Separator
													orientation="vertical"
													className="mr-2 h-4 bg-secondary-foreground/30"
												/>
												<AppBreadcrumbs />
											</div>
										</header>
										<AppHeader className="mt-16 mb-4 px-4" />
										<div className="px-4 pb-6 h-full w-full">{children}</div>
									</SidebarInset>
								</SidebarProvider>
							</AuthProvider>
						</Background>
						<Toaster />
						<Analytics />
					</Provider>
				</body>
			</html>
		);
	} catch (error) {
		console.error('Layout error:', error);
		// On error, fall back to the basic layout
		return (
			<AuthProvider>
				<BasicLayout>{children}</BasicLayout>
			</AuthProvider>
		);
	}
}

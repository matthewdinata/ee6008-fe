import type { Viewport } from 'next';

/**
 * Default viewport configuration for all pages
 * This follows Next.js latest best practices by separating viewport from metadata
 */
export const defaultViewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	minimumScale: 1,
	userScalable: true,
};

/**
 * Base metadata properties shared across the application
 * Used for SEO optimization and consistent branding
 */
export const baseMetadata = {
	metadataBase: new URL('https://ee6008-fe.vercel.app'),
	applicationName: 'EE6008 Course Portal',
	creator: 'NTU School of Electrical and Electronic Engineering',
	publisher: 'Nanyang Technological University',
	formatDetection: {
		telephone: false,
	},
	appleWebApp: {
		capable: true,
		title: 'EE6008 NTU',
		statusBarStyle: 'black-translucent',
	},
	icons: {
		icon: '/favicon.ico',
	},
};

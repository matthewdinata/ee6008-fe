import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
	title: 'Unauthorized Access - EE6008 Collaborative Research and Development Project - NTU',
	description:
		'You do not have permission to access this page. EE6008 project portal requires proper authentication and authorization.',
	keywords: 'EE6008 unauthorized, NTU access control, restricted access, EEE MSc permissions',
	openGraph: {
		title: 'Unauthorized Access - EE6008 Course Portal',
		description:
			'Access denied to the EE6008 course portal at Nanyang Technological University',
	},
	robots: {
		index: false,
		follow: false,
	},
};

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	minimumScale: 1,
};

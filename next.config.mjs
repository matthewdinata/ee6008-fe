/** @type {import('next').NextConfig} */
const nextConfig = {
	// Enable image optimization
	images: {
		domains: ['ee6008-fe.vercel.app'],
		formats: ['image/avif', 'image/webp'],
	},

	// Improve performance with compression
	compress: true,

	// Add custom headers for SEO and security
	async headers() {
		return [
			{
				source: '/:path*',
				headers: [
					{
						key: 'X-DNS-Prefetch-Control',
						value: 'on',
					},
					{
						key: 'X-Content-Type-Options',
						value: 'nosniff',
					},
					{
						key: 'Referrer-Policy',
						value: 'strict-origin-when-cross-origin',
					},
				],
			},
		];
	},

	// Optimize paths for crawlers
	trailingSlash: false,

	// Add redirects for improved SEO
	async redirects() {
		return [
			{
				source: '/home',
				destination: '/',
				permanent: true,
			},
		];
	},
};

export default nextConfig;

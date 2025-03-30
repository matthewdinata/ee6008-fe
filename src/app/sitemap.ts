import { MetadataRoute } from 'next';

// Valid change frequency values
type ChangeFrequency = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

// This is a server component that generates a dynamic sitemap
export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl = 'https://ee6008-fe.vercel.app';
	const lastModified = new Date();

	// Core static pages
	const staticPages = [
		{
			url: baseUrl,
			lastModified,
			changeFrequency: 'monthly' as ChangeFrequency,
			priority: 1.0,
		},
		{
			url: `${baseUrl}/signin`,
			lastModified,
			changeFrequency: 'yearly' as ChangeFrequency,
			priority: 0.8,
		},
		{
			url: `${baseUrl}/unauthorized`,
			lastModified,
			changeFrequency: 'yearly' as ChangeFrequency,
			priority: 0.3,
		},
	];

	// Student routes
	const studentRoutes = [
		{
			url: `${baseUrl}/student`,
			lastModified,
			changeFrequency: 'weekly' as ChangeFrequency,
			priority: 0.9,
		},
		{
			url: `${baseUrl}/student/peer-review`,
			lastModified,
			changeFrequency: 'weekly' as ChangeFrequency,
			priority: 0.8,
		},
		{
			url: `${baseUrl}/student/peer-review/new`,
			lastModified,
			changeFrequency: 'weekly' as ChangeFrequency,
			priority: 0.7,
		},
		{
			url: `${baseUrl}/student/peer-review/edit`,
			lastModified,
			changeFrequency: 'weekly' as ChangeFrequency,
			priority: 0.7,
		},
		{
			url: `${baseUrl}/student/projects`,
			lastModified,
			changeFrequency: 'weekly' as ChangeFrequency,
			priority: 0.7,
		},
	];

	// Faculty routes
	const facultyRoutes = [
		{
			url: `${baseUrl}/faculty`,
			lastModified,
			changeFrequency: 'weekly' as ChangeFrequency,
			priority: 0.9,
		},
		{
			url: `${baseUrl}/faculty/projects`,
			lastModified,
			changeFrequency: 'weekly' as ChangeFrequency,
			priority: 0.8,
		},
		{
			url: `${baseUrl}/faculty/evaluations`,
			lastModified,
			changeFrequency: 'weekly' as ChangeFrequency,
			priority: 0.8,
		},
	];

	// Admin routes
	const adminRoutes = [
		{
			url: `${baseUrl}/admin`,
			lastModified,
			changeFrequency: 'weekly' as ChangeFrequency,
			priority: 0.9,
		},
		{
			url: `${baseUrl}/admin/semester`,
			lastModified,
			changeFrequency: 'weekly' as ChangeFrequency,
			priority: 0.8,
		},
		{
			url: `${baseUrl}/admin/programmes`,
			lastModified,
			changeFrequency: 'weekly' as ChangeFrequency,
			priority: 0.8,
		},
		{
			url: `${baseUrl}/admin/users`,
			lastModified,
			changeFrequency: 'weekly' as ChangeFrequency,
			priority: 0.8,
		},
	];

	// Programme-specific routes (for MSc programmes mentioned in the documentation)
	const programmeRoutes = [
		{
			url: `${baseUrl}/programmes/cme`,
			lastModified,
			changeFrequency: 'monthly' as ChangeFrequency,
			priority: 0.7,
		}, // Communications Engineering
		{
			url: `${baseUrl}/programmes/cca`,
			lastModified,
			changeFrequency: 'monthly' as ChangeFrequency,
			priority: 0.7,
		}, // Computer Control & Automation
		{
			url: `${baseUrl}/programmes/et`,
			lastModified,
			changeFrequency: 'monthly' as ChangeFrequency,
			priority: 0.7,
		}, // Electronics
		{
			url: `${baseUrl}/programmes/pe`,
			lastModified,
			changeFrequency: 'monthly' as ChangeFrequency,
			priority: 0.7,
		}, // Power Engineering
		{
			url: `${baseUrl}/programmes/sp`,
			lastModified,
			changeFrequency: 'monthly' as ChangeFrequency,
			priority: 0.7,
		}, // Signal Processing
	];

	// Combine all routes
	return [...staticPages, ...studentRoutes, ...facultyRoutes, ...adminRoutes, ...programmeRoutes];
}

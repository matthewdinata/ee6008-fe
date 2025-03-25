import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { Project } from '@/utils/actions/admin/types';
import { getFacultyProjectsBySemester } from '@/utils/actions/faculty/get-faculty-projects';
import { getAllProjectsBySemester } from '@/utils/actions/faculty/get-faculty-projects';

import { useAuth } from '@/components/layout/auth-provider';

interface UseGetFacultyProjectsOptions {
	onSuccess?: (data: Project[]) => void;
	onError?: (error: unknown) => void;
	enabled?: boolean;
}

/**
 * Custom hook to fetch faculty projects by semester ID and faculty email
 */
export function useGetFacultyProjects(
	semesterId: number | null,
	facultyEmail?: string,
	options?: UseGetFacultyProjectsOptions
) {
	// Get user email from cookies - this is more stable than passing it as a prop
	const cookies = useMemo(() => {
		if (typeof document !== 'undefined') {
			return document.cookie.split(';').reduce(
				(acc, cookie) => {
					const [key, value] = cookie.trim().split('=');
					if (key) acc[key] = value || '';
					return acc;
				},
				{} as Record<string, string>
			);
		}
		return {};
	}, []);
	const cookieEmail = cookies?.email ? decodeURIComponent(cookies.email) : '';

	const { user: authUser } = useAuth();

	// Try multiple sources for the email in order of preference:
	// 1. Direct passed email (highest priority)
	// 2. Auth context user email
	// 3. Cookie-based user email
	const email = facultyEmail || authUser?.email || cookieEmail || '';

	// Create a stable queryKey that doesn't change on every render
	const queryKey = useMemo(() => ['faculty-projects', semesterId, email], [semesterId, email]);

	// Only check for email in development mode, once
	useMemo(() => {
		if (process.env.NODE_ENV === 'development') {
			console.log('useGetFacultyProjects hook running with:', {
				semesterId,
				email,
				facultyEmail: facultyEmail || '(none)',
				authEmail: authUser?.email || '(none)',
				cookieEmail: cookieEmail || '(none)',
				usingFallback: false,
				cookiesAvailable:
					Object.keys(cookies).length > 0 ? Object.keys(cookies).join(', ') : 'none',
			});
		}
	}, [semesterId, email, cookies, authUser?.email, facultyEmail, cookieEmail]);

	return useQuery({
		queryKey,
		queryFn: async () => {
			if (!semesterId) {
				return [];
			}

			if (!email) {
				console.error('No faculty email available for projects query');
				return [];
			}

			if (process.env.NODE_ENV === 'development') {
				console.log(`Executing fetchFn with semesterId=${semesterId} and email=${email}`);
			}

			const result = await getFacultyProjectsBySemester(semesterId, email);

			// Only log once and only in development
			if (process.env.NODE_ENV === 'development') {
				console.log(`Project data received: ${result.length} projects`);
			}

			return result;
		},
		enabled: !!semesterId && !!email,
		staleTime: 5 * 60 * 1000, // Data remains fresh for 5 minutes
		gcTime: 10 * 60 * 1000, // Data remains in cache for 10 minutes
		refetchOnWindowFocus: false,
		...options,
	});
}

export const useGetAllProjects = (semesterId: number | null) => {
	return useQuery({
		queryKey: ['all-projects', semesterId],
		queryFn: async () => {
			if (!semesterId) return [];
			return getAllProjectsBySemester(semesterId);
		},
		enabled: !!semesterId,
	});
};

import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import {
	ProgrammeLeaderProjectsResponse,
	getProgrammeLeaderProjects,
} from '@/utils/actions/faculty/get-programme-leader-projects';

import { useAuth } from '@/components/layout/auth-provider';

export type UseGetProgrammeLeaderProjectsOptions = Omit<
	UseQueryOptions<
		ProgrammeLeaderProjectsResponse,
		Error,
		ProgrammeLeaderProjectsResponse,
		readonly unknown[]
	>,
	'queryKey' | 'queryFn'
>;

export const useGetProgrammeLeaderProjects = (
	semesterId: number,
	facultyEmail?: string,
	options?: UseGetProgrammeLeaderProjectsOptions
) => {
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

	const isEnabled = semesterId > 0 && email !== '' && options?.enabled !== false;

	// Development logging
	useMemo(() => {
		if (process.env.NODE_ENV === 'development') {
			console.log('useGetProgrammeLeaderProjects hook running with:', {
				semesterId,
				email,
				facultyEmail: facultyEmail || '(none)',
				authEmail: authUser?.email || '(none)',
				cookieEmail: cookieEmail || '(none)',
				enabled: isEnabled,
				cookiesAvailable:
					Object.keys(cookies).length > 0 ? Object.keys(cookies).join(', ') : 'none',
			});
		}
	}, [cookies, authUser?.email, cookieEmail, email, semesterId, isEnabled, facultyEmail]);

	return useQuery<
		ProgrammeLeaderProjectsResponse,
		Error,
		ProgrammeLeaderProjectsResponse,
		readonly unknown[]
	>({
		queryKey: ['programme-leader-projects', semesterId, email] as const,
		queryFn: () => getProgrammeLeaderProjects(semesterId, email),
		enabled: isEnabled,
		staleTime: 5 * 60 * 1000, // 5 minutes
		...options,
	});
};

import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import {
	CheckProgrammeLeaderResponseData,
	checkProgrammeLeader,
} from '@/utils/actions/faculty/check-programme-leader';

import { useAuth } from '@/components/layout/auth-provider';

export type UseCheckProgrammeLeaderOptions = Omit<
	UseQueryOptions<
		CheckProgrammeLeaderResponseData,
		Error,
		CheckProgrammeLeaderResponseData,
		readonly unknown[]
	>,
	'queryKey' | 'queryFn'
>;

export const useCheckProgrammeLeader = (
	facultyEmail?: string,
	options?: UseCheckProgrammeLeaderOptions
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

	useMemo(() => {
		if (process.env.NODE_ENV === 'development') {
			console.log('useCheckProgrammeLeader hook running with:', {
				email,
				facultyEmail: facultyEmail || '(none)',
				authEmail: authUser?.email || '(none)',
				cookieEmail: cookieEmail || '(none)',
				cookiesAvailable:
					Object.keys(cookies).length > 0 ? Object.keys(cookies).join(', ') : 'none',
			});
		}
	}, [email, cookies, authUser?.email, facultyEmail, cookieEmail]);

	return useQuery<
		CheckProgrammeLeaderResponseData,
		Error,
		CheckProgrammeLeaderResponseData,
		readonly unknown[]
	>({
		queryKey: ['check-programme-leader', email] as const,
		queryFn: () => checkProgrammeLeader(email),
		enabled: email !== '' && options?.enabled !== false,
		staleTime: 5 * 60 * 1000, // 5 minutes
		...options,
	});
};

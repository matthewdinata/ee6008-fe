import { useQuery } from '@tanstack/react-query';

import { getFacultyUsers } from '@/utils/actions/admin/project';
import { User as AdminUser } from '@/utils/actions/admin/types';

export const useGetFacultyUsers = (options?: {
	onSuccess?: (data: AdminUser[]) => void;
	onError?: (error: unknown) => void;
	enabled?: boolean;
}) => {
	return useQuery<AdminUser[]>({
		queryKey: ['faculty'],
		queryFn: async () => {
			console.log('useGetFacultyUsers queryFn executing WKKWWKKKWWK...');
			try {
				// Use the server action from project.ts
				const result = await getFacultyUsers();
				console.log(result);
				// Ensure we always return a valid array
				if (!result || !Array.isArray(result)) {
					console.warn('Faculty data is not an array, returning empty array');
					return [];
				}

				// Map the response to ensure it matches the AdminUser interface from types.ts
				const mappedFacultyData = result.map(
					(user) =>
						({
							id: user.id,
							name: user.name || '',
							email: user.email || '',
							role: 'faculty',
							userId: user.userId, // Set a default role since it's required in AdminUser
							// Add other fields that might be needed based on AdminUser type
						}) as AdminUser
				);

				// Filter out any invalid user objects
				const validFacultyData = mappedFacultyData.filter(
					(user) =>
						user &&
						typeof user === 'object' &&
						user.id !== undefined &&
						user.name &&
						user.email
				);

				console.log(`Loaded ${validFacultyData.length} valid faculty users in hook`);
				console.log('this is faculty data', validFacultyData);
				return validFacultyData;
			} catch (error) {
				console.error('Error fetching faculty data:', error);
				return []; // Return empty array instead of throwing to avoid breaking the UI
			}
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
		refetchOnWindowFocus: false,
		refetchOnMount: true, // Enable fetch on mount to ensure data is available
		...options,
	});
};

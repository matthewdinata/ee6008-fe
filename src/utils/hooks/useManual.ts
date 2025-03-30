import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
	createManual,
	deleteManual,
	fetchCategories,
	fetchManualById,
	fetchManuals,
	updateManual,
} from '@/utils/actions/manual';
import { ManualInput } from '@/utils/types/manual';

/**
 * Hook to fetch all manuals
 */
export function useManuals() {
	return useQuery({
		queryKey: ['manuals'],
		queryFn: async () => {
			try {
				return await fetchManuals();
			} catch (error) {
				console.error('Error in useManuals:', error);
				throw error;
			}
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Hook to fetch a specific manual by ID
 */
export function useManual(id: number) {
	return useQuery({
		queryKey: ['manuals', id],
		queryFn: async () => {
			try {
				return await fetchManualById(id);
			} catch (error) {
				console.error(`Error in useManual(${id}):`, error);
				throw error;
			}
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		enabled: !!id, // Only run the query if ID is provided
	});
}

/**
 * Hook to fetch all manual categories
 */
export function useManualCategories() {
	return useQuery({
		queryKey: ['manualCategories'],
		queryFn: async () => {
			try {
				return await fetchCategories();
			} catch (error) {
				console.error('Error in useManualCategories:', error);
				throw error;
			}
		},
		staleTime: 10 * 60 * 1000, // 10 minutes
	});
}

/**
 * Hook to create a new manual
 */
export function useCreateManual() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: ManualInput) => createManual(data),
		onSuccess: () => {
			// Invalidate and refetch
			queryClient.invalidateQueries({ queryKey: ['manuals'] });
		},
	});
}

/**
 * Hook to update an existing manual
 */
export function useUpdateManual() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: number; data: ManualInput }) => updateManual(id, data),
		onSuccess: (_, variables) => {
			// Invalidate and refetch
			queryClient.invalidateQueries({ queryKey: ['manuals'] });
			queryClient.invalidateQueries({ queryKey: ['manuals', variables.id] });
		},
	});
}

/**
 * Hook to delete a manual
 */
export function useDeleteManual() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => deleteManual(id),
		onSuccess: () => {
			// Invalidate and refetch
			queryClient.invalidateQueries({ queryKey: ['manuals'] });
		},
	});
}

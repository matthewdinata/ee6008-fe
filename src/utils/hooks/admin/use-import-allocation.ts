// use-import-allocation.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { importAllocation } from '@/utils/actions/admin/import-allocation';

import { useToast } from '../use-toast';

interface ImportAllocationParams {
	file: File;
	semesterId: number;
}

export const useImportAllocation = () => {
	const { toast } = useToast();
	const queryClient = useQueryClient();

	const uploadAllocation = async ({ file, semesterId }: ImportAllocationParams) => {
		try {
			// Create FormData object

			const formData = new FormData();
			formData.append('file', file);
			formData.append('semester_id', semesterId.toString());

			// Call the server action
			const result = await importAllocation(formData);

			if (!result) {
				throw new Error('Failed to import allocation data');
			}

			return result;
		} catch (error) {
			console.error('Error importing allocation:', error);
			throw error;
		}
	};

	const mutation = useMutation({
		mutationFn: uploadAllocation,
		onSuccess: (data) => {
			toast({
				title: 'Allocation imported',
				description: `Successfully imported allocation data with ID: ${data.allocationId}`,
			});

			// Invalidate relevant queries to refresh data
			queryClient.invalidateQueries({
				queryKey: ['get-allocations-by-semester'],
			});

			queryClient.invalidateQueries({
				queryKey: ['get-selected-allocation'],
			});
		},
		onError: (error: Error) => {
			toast({
				title: 'Import failed',
				description: error.message || 'An unknown error occurred',
				variant: 'destructive',
			});
		},
	});

	return {
		importAllocation: mutation.mutate,
		isPending: mutation.isPending,
		isError: mutation.isError,
		error: mutation.error,
		isSuccess: mutation.isSuccess,
		data: mutation.data,
	};
};

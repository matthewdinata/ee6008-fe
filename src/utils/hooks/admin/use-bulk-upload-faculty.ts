'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { bulkUploadFaculty } from '@/utils/actions/admin/user';

// Define the correct type to match what the server returns
interface FacultyUploadSuccess {
	email: string;
	name: string;
}

interface FacultyUploadFailed {
	email: string;
	error: string;
}

interface BulkUploadResult {
	success: FacultyUploadSuccess[];
	failed: FacultyUploadFailed[];
}

interface UseBulkUploadFacultyReturn {
	isUploading: boolean;
	successMessage: string;
	errorMessage: string;
	debugLog: string[];
	uploadFaculty: (file: File) => Promise<boolean>;
	addDebugMessage: (message: string) => void;
	resetMessages: () => void;
}

/**
 * Hook for handling faculty bulk uploads using React Query
 * @returns Object containing upload state and functions
 */
export function useBulkUploadFaculty(): UseBulkUploadFacultyReturn {
	const [successMessage, setSuccessMessage] = useState<string>('');
	const [errorMessage, setErrorMessage] = useState<string>('');
	const [debugLog, setDebugLog] = useState<string[]>([]);

	const addDebugMessage = (msg: string) => {
		const timestamp = new Date().toLocaleTimeString();
		setDebugLog((prev) => [...prev, `${timestamp}: ${msg}`]);
	};

	const resetMessages = () => {
		setSuccessMessage('');
		setErrorMessage('');
	};

	// Use React Query's useMutation for better state management
	const mutation = useMutation({
		mutationFn: async (file: File) => {
			if (!file) {
				throw new Error('Please select a file to upload');
			}

			addDebugMessage('Starting file upload process...');

			// Convert file to base64
			const fileReader = new FileReader();
			const fileBase64 = await new Promise<string>((resolve, reject) => {
				fileReader.onload = () => {
					resolve(fileReader.result as string);
				};
				fileReader.onerror = () => {
					reject(new Error('Failed to read file'));
				};
				fileReader.readAsDataURL(file);
			});

			addDebugMessage(`File encoded, sending to server...`);

			// Call the faculty upload function
			return bulkUploadFaculty(fileBase64, file.name);
		},
		onSuccess: (result) => {
			addDebugMessage('Received response from server');

			// Safely handle the response structure
			const uploadResult = result.data as BulkUploadResult;
			const successCount = uploadResult.success?.length || 0;
			const failedCount = uploadResult.failed?.length || 0;

			if (failedCount > 0) {
				setErrorMessage(
					`Upload completed with ${failedCount} errors. Check debug log for details.`
				);
				if (Array.isArray(uploadResult.failed)) {
					uploadResult.failed.forEach((failure) => {
						addDebugMessage(`Failed to upload ${failure.email}: ${failure.error}`);
					});
				}
			}

			if (successCount > 0) {
				setSuccessMessage(`Successfully uploaded ${successCount} faculty members.`);
				if (Array.isArray(uploadResult.success)) {
					uploadResult.success.forEach((faculty) => {
						addDebugMessage(`Successfully uploaded faculty: ${faculty.email}`);
					});
				}
			} else if (failedCount === 0) {
				// Edge case - no success and no failure
				setSuccessMessage('Upload completed, but no faculty were processed.');
			}
		},
		onError: (error: unknown) => {
			console.error('Error:', error);
			const errorMessage =
				error instanceof Error ? error.message : 'An unknown error occurred during upload';

			addDebugMessage(`Error in upload process: ${errorMessage}`);
			setErrorMessage(`An error occurred during the upload: ${errorMessage}`);
		},
	});

	// Wrapper function for the mutation that returns a boolean for component handling
	const uploadFaculty = async (file: File): Promise<boolean> => {
		try {
			resetMessages();
			await mutation.mutateAsync(file);
			return true;
		} catch (error) {
			// Error handling is done in the mutation's onError
			return false;
		}
	};

	return {
		isUploading: mutation.isPending,
		successMessage,
		errorMessage,
		debugLog,
		uploadFaculty,
		addDebugMessage,
		resetMessages,
	};
}

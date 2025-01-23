import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Download, Loader2, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function BulkUserUpload() {
	const [file, setFile] = useState<File | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [debugLog, setDebugLog] = useState<string[]>([]);
	const [successMessage, setSuccessMessage] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const supabase = createClientComponentClient();
	const router = useRouter();

	const addDebugMessage = (msg: string) => {
		const timestamp = new Date().toLocaleTimeString();
		setDebugLog((prev) => [...prev, `${timestamp}: ${msg}`]);
	};

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files && event.target.files.length > 0) {
			const selectedFile = event.target.files[0];
			setFile(selectedFile);
			addDebugMessage(`File selected: ${selectedFile.name} (${selectedFile.type})`);
		}
	};

	const downloadTemplate = () => {
		addDebugMessage('Initiating template download...');

		// Create CSV content
		const headers = ['Email', 'Name', 'Role', 'Additional Info'];
		const exampleRows = [
			// Student examples
			['student1@e.ntu.edu.sg', 'John Smith', 'student', 'U2024123A'],
			['student2@e.ntu.edu.sg', 'Mary Johnson', 'student', 'U2024456B'],
			// Faculty examples
			['faculty1@e.ntu.edu.sg', 'Dr. James Wilson', 'faculty', 'course_coordinator'],
			['faculty2@e.ntu.edu.sg', 'Prof. Sarah Chen', 'faculty', ''],
			// Admin example
			['admin@e.ntu.edu.sg', 'Admin User', 'admin', ''],
			// Pending example
			['pending@e.ntu.edu.sg', 'Pending User', 'pending', ''],
		];
		const csvContent = [headers.join(','), ...exampleRows.map((row) => row.join(','))].join(
			'\n'
		);

		// Create blob and download
		const blob = new Blob([csvContent], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'user_upload_template.csv';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);

		addDebugMessage('Template download completed');
	};

	const handleUpload = async () => {
		if (!file) {
			setErrorMessage('Please select a file before uploading.');
			addDebugMessage('Upload attempted without file selection');
			return;
		}

		setIsUploading(true);
		setErrorMessage('');
		setSuccessMessage('');
		addDebugMessage('Starting file upload process...');

		try {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			addDebugMessage('Checking authentication session...');

			if (!session) {
				addDebugMessage('No active session found. Redirecting to signin...');
				router.push('/signin');
				return;
			}

			addDebugMessage('Preparing form data for upload...');
			const formData = new FormData();
			formData.append('file', file);

			addDebugMessage('Sending file to server...');
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/bulk-upload`,
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${session.access_token}`,
					},
					body: formData,
				}
			);

			if (!response.ok) {
				throw new Error(`Upload failed: ${response.statusText}`);
			}

			addDebugMessage('File uploaded successfully!');
			setSuccessMessage('✓ Users have been successfully uploaded!');
			setFile(null);
			// Reset file input
			const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
			if (fileInput) fileInput.value = '';
		} catch (error) {
			console.error('Error:', error);
			const errorMsg = error instanceof Error ? error.message : 'Failed to upload file';
			setErrorMessage(errorMsg);
			addDebugMessage(`Error occurred: ${errorMsg}`);
		} finally {
			setIsUploading(false);
		}
	};

	return (
		<div className="container mx-auto p-6">
			<h1 className="text-2xl font-bold mb-4">Bulk User Upload</h1>
			<div className="space-y-4 max-w-lg">
				{/* Template Download Button */}
				<div className="flex justify-between items-center">
					<Button
						onClick={downloadTemplate}
						variant="outline"
						className="flex items-center gap-2"
					>
						<Download className="h-4 w-4" />
						Download Template
					</Button>
				</div>

				{/* File Upload Section */}
				<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
					<Input
						type="file"
						accept=".xlsx, .xls, .csv"
						onChange={handleFileChange}
						className="w-full mb-4"
					/>
					<p className="text-sm text-gray-500 mb-4">
						Supported formats: .xlsx, .xls, .csv
					</p>
					<Button
						onClick={handleUpload}
						disabled={isUploading}
						className="w-full flex items-center justify-center gap-2"
					>
						{isUploading ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />
								Uploading...
							</>
						) : (
							<>
								<Upload className="h-4 w-4" />
								Upload File
							</>
						)}
					</Button>
				</div>

				{/* Success Message */}
				{successMessage && (
					<Alert className="bg-green-50 text-green-800 border-green-200">
						<AlertDescription className="flex items-center gap-2">
							<svg
								className="h-4 w-4 text-green-500"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fillRule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clipRule="evenodd"
								/>
							</svg>
							{successMessage}
						</AlertDescription>
					</Alert>
				)}

				{/* Error Message */}
				{errorMessage && (
					<Alert className="bg-red-50 text-red-800 border-red-200">
						<AlertDescription className="flex items-center gap-2">
							<svg
								className="h-4 w-4 text-red-500"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fillRule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
									clipRule="evenodd"
								/>
							</svg>
							{errorMessage}
						</AlertDescription>
					</Alert>
				)}

				{/* Debug Log */}
				{process.env.NODE_ENV === 'development' && debugLog.length > 0 && (
					<div className="mt-8 p-4 bg-gray-50 rounded-md">
						<h3 className="text-sm font-medium text-gray-700 mb-2">Debug Log:</h3>
						<pre className="text-xs text-gray-600 whitespace-pre-wrap">
							{debugLog.join('\n')}
						</pre>
					</div>
				)}
			</div>
		</div>
	);
}

export default BulkUserUpload;

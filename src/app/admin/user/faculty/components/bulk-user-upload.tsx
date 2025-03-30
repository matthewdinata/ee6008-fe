'use client';

import { Download, Loader2, Upload } from 'lucide-react';
import React, { useState } from 'react';

import { useBulkUploadFaculty } from '@/utils/hooks/admin/use-bulk-upload-faculty';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function BulkUserUpload() {
	const [file, setFile] = useState<File | null>(null);
	const {
		isUploading,
		successMessage,
		errorMessage,
		debugLog,
		uploadFaculty,
		addDebugMessage,
		resetMessages,
	} = useBulkUploadFaculty();

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files && event.target.files.length > 0) {
			const selectedFile = event.target.files[0];
			setFile(selectedFile);
			addDebugMessage(`File selected: ${selectedFile.name} (${selectedFile.type})`);
		}
	};

	const downloadTemplate = () => {
		addDebugMessage('Initiating template download...');
		const headers = ['Email', 'Name', 'IsCourseCoordinator'];
		const templateRows = [
			['professor1@e.edu.sg', 'Dr. Smith', 'true'],
			['professor2@e.edu.sg', 'Dr. Johnson', 'false'],
			['professor3@e.edu.sg', 'Dr. Williams', ''],
		];
		const csvContent = [headers.join(','), ...templateRows.map((row) => row.join(','))].join(
			'\n'
		);
		const blob = new Blob([csvContent], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'faculty_upload_template.csv';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);

		addDebugMessage('Template download completed');
	};

	const handleUpload = async () => {
		if (!file) {
			addDebugMessage('Upload attempted without file selection');
			return;
		}

		resetMessages();
		const success = await uploadFaculty(file);

		if (success) {
			// Reset file input after successful upload
			setFile(null);
			const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
			if (fileInput) fileInput.value = '';
		}
	};

	return (
		<div className="mx-auto p-6">
			<h1 className="text-2xl font-bold mb-4">Bulk Faculty Upload</h1>
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
						id="file"
						accept=".csv, .xlsx, .xls"
						onChange={handleFileChange}
						disabled={isUploading}
					/>
					<p className="text-sm text-gray-500 pb-2">
						Supported formats: CSV (.csv) and Excel (.xlsx, .xls)
					</p>
					<Button
						onClick={handleUpload}
						disabled={isUploading || !file}
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
								Upload Faculty
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
				{debugLog.length > 0 && (
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

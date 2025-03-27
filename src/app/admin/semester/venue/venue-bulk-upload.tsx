'use client';

import { Download, Loader2, Upload } from 'lucide-react';
import { useCallback, useState } from 'react';

import { Semester } from '@/utils/actions/admin/types';
import { bulkUploadVenues } from '@/utils/actions/admin/venue';
import { useGetSemesters } from '@/utils/hooks/admin/use-get-semesters';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

// Helper function to format semester display
const formatSemesterDisplay = (semester: Semester): string => {
	const activeStatus = semester.isActive ? ' (Active)' : '';
	return `AY ${semester.academicYear} - ${semester.name}${activeStatus}`;
};

export default function VenueBulkUpload() {
	const [file, setFile] = useState<File | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [debugLog, setDebugLog] = useState<string[]>([]);
	const [selectedSemester, setSelectedSemester] = useState<string>('');

	// Fetch semesters for dropdown
	const { data: semesters = [], isLoading: loadingSemesters } = useGetSemesters();

	// Helper function to add debug messages
	const addDebugMessage = useCallback((message: string) => {
		const timestamp = new Date().toLocaleTimeString();
		setDebugLog((prev) => [...prev, `${timestamp}: ${message}`]);
	}, []);

	// Handle file selection
	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = event.target.files?.[0] || null;
		setFile(selectedFile);

		// Reset messages when a new file is selected
		setSuccessMessage(null);
		setErrorMessage(null);
	};

	// Download template function
	const downloadTemplate = () => {
		// Create a simple CSV template
		const csvContent =
			'Name,Location\nLT1,North Spine\nTR+1,South Spine\nLHN-TR+2,SCSE Building';

		// Create a blob and download link
		const blob = new Blob([csvContent], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'venue_upload_template.csv';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);

		addDebugMessage('Template download completed');
	};

	// Handle file upload
	const handleUpload = async () => {
		if (!file || !selectedSemester) {
			setErrorMessage('Please select a file and semester before uploading.');
			return;
		}

		setIsUploading(true);
		setSuccessMessage(null);
		setErrorMessage(null);
		setDebugLog([]);

		try {
			addDebugMessage(`Starting upload of ${file.name}`);
			addDebugMessage(`File size: ${file.size} bytes`);
			addDebugMessage(`File type: ${file.type}`);
			addDebugMessage(`Selected semester ID: ${selectedSemester}`);

			// Read file as base64
			const reader = new FileReader();
			reader.readAsDataURL(file);

			reader.onload = async () => {
				const base64data = reader.result as string;

				// Call the server action to upload the file
				const result = await bulkUploadVenues(base64data, file.name, selectedSemester);

				if (!result.success) {
					addDebugMessage(`Upload failed: ${result.error}`);
					setErrorMessage(`Upload failed: ${result.error}`);
					setIsUploading(false);
					return;
				}

				// Process results
				let successCount = 0;
				let failedCount = 0;

				if (result.data) {
					successCount = Array.isArray(result.data.success)
						? result.data.success.length
						: 0;
					failedCount = Array.isArray(result.data.failed) ? result.data.failed.length : 0;

					addDebugMessage(
						`Upload completed. Success: ${successCount}, Failed: ${failedCount}`
					);

					if (failedCount > 0) {
						setErrorMessage(`Failed to upload ${failedCount} venues.`);
						result.data.failed.forEach((failure: { name: string; error: string }) => {
							addDebugMessage(`Failed to upload ${failure.name}: ${failure.error}`);
						});
					}
				}

				if (successCount > 0) {
					setSuccessMessage(`Successfully uploaded ${successCount} venues.`);
					if (Array.isArray(result.data.success)) {
						result.data.success.forEach((venue: { name: string }) => {
							addDebugMessage(`Successfully uploaded venue: ${venue.name}`);
						});
					}
				} else if (failedCount === 0) {
					setErrorMessage('No records were processed. Please check your file format.');
				}

				// Reset file input after successful upload
				setFile(null);
				const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
				if (fileInput) fileInput.value = '';
			};
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
			addDebugMessage(`Error during upload: ${errorMessage}`);
			setErrorMessage(`Error during upload: ${errorMessage}`);
		} finally {
			setIsUploading(false);
		}
	};

	return (
		<div className="container mx-auto">
			<h1 className="text-2xl font-bold mb-4">Bulk Venue Upload</h1>
			<div className="space-y-4 max-w-lg">
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

				<div className="space-y-2">
					<Label htmlFor="semester">Semester</Label>
					<Select
						disabled={loadingSemesters}
						value={selectedSemester}
						onValueChange={setSelectedSemester}
					>
						<SelectTrigger id="semester" className="w-full">
							<SelectValue
								placeholder={loadingSemesters ? 'Loading...' : 'Select a semester'}
							/>
						</SelectTrigger>
						<SelectContent>
							{semesters.map((semester) => (
								<SelectItem key={semester.id} value={semester.id.toString()}>
									{formatSemesterDisplay(semester)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{loadingSemesters && (
						<div className="text-sm text-gray-500">Loading semesters...</div>
					)}
				</div>

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
						disabled={isUploading || !selectedSemester}
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
								Upload Venues
							</>
						)}
					</Button>
				</div>

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

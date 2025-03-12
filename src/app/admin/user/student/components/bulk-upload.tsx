'use client';

import { Download, Loader2, Upload } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { getSemesters } from '@/utils/actions/admin/fetch';
import { bulkUploadStudents, getSessionFromClient } from '@/utils/actions/admin/user';

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

interface Semester {
	id: number;
	academic_year: number;
	name: string;
	is_active: boolean;
	status: string;
}

export default function BulkStudentUpload(): React.ReactElement {
	// State hooks
	const [file, setFile] = useState<File | null>(null);
	const [selectedSemester, setSelectedSemester] = useState<string>('');
	const [semesters, setSemesters] = useState<Semester[]>([]);
	const [loadingSemesters, setLoadingSemesters] = useState<boolean>(false);
	const [isUploading, setIsUploading] = useState<boolean>(false);
	const [successMessage, setSuccessMessage] = useState<string>('');
	const [errorMessage, setErrorMessage] = useState<string>('');
	const [debugLog, setDebugLog] = useState<string[]>([]);

	const addDebugMessage = (msg: string) => {
		const timestamp = new Date().toLocaleTimeString();
		setDebugLog((prev) => [...prev, `${timestamp}: ${msg}`]);
	};

	// const fetchSemesters = async () => {
	// 	try {
	// 		const {
	// 			data: { session },
	// 		} = await supabase.auth.getSession();
	// 		if (!session) {
	// 			addDebugMessage('No session found for fetching semesters');
	// 			return;
	// 		}

	// 		setLoadingSemesters(true);
	// 		addDebugMessage('Fetching semesters...');

	// 		const response = await fetch(`${process.env.BACKEND_API_URL}/api/admin/semesters`, {
	// 			headers: {
	// 				Authorization: `Bearer ${session.access_token}`,
	// 			},
	// 		});
	// 		const data = await response.json();
	// 		setSemesters(data);
	// 		addDebugMessage(`Fetched ${data.length} semesters`);
	// 	} catch (error) {
	// 		addDebugMessage(`Error fetching semesters: ${error}`);
	// 		console.error('Error fetching semesters:', error);
	// 	} finally {
	// 		setLoadingSemesters(false);
	// 	}
	// };
	const fetchSemesters = async () => {
		try {
			addDebugMessage('Fetching semesters...');

			const response = await getSemesters();

			if (!response.success) {
				addDebugMessage(`Error fetching semesters: ${response.error}`);
				return;
			}

			setSemesters(response.data);
			addDebugMessage(`Fetched ${response.data.length} semesters`);
		} catch (error) {
			addDebugMessage(`Error fetching semesters: ${error}`);
			console.error('Error fetching semesters:', error);
		} finally {
			setLoadingSemesters(false);
		}
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

		const headers = ['Email', 'Name', 'Matriculation Number'];
		const exampleRows = [
			['student1@e.ntu.edu.sg', 'John Smith', 'U2024123A'],
			['student2@e.ntu.edu.sg', 'Mary Johnson', 'U2024456B'],
			['student3@e.ntu.edu.sg', 'Alex Wong', 'U2024789C'],
		];

		const csvContent = [headers.join(','), ...exampleRows.map((row) => row.join(','))].join(
			'\n'
		);

		const blob = new Blob([csvContent], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'student_upload_template.csv';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);

		addDebugMessage('Template download completed');
	};

	const handleUpload = async () => {
		// Clear previous messages
		setSuccessMessage('');
		setErrorMessage('');
		setDebugLog([]);

		if (!file) {
			setErrorMessage('Please select a file to upload');
			return;
		}

		if (!selectedSemester) {
			setErrorMessage('Please select a semester');
			return;
		}

		setIsUploading(true);
		addDebugMessage('Starting upload process...');

		try {
			// Get current session using server-side function
			try {
				await getSessionFromClient(); // Just verify the session exists
				// Log the semester ID being sent
				addDebugMessage(`Using semester ID: ${selectedSemester}`);
			} catch (error) {
				addDebugMessage(`Error getting session: ${error}`);
				setErrorMessage('Error getting session');
			}

			const result = await bulkUploadStudents(file, selectedSemester);

			if (!result.success) {
				addDebugMessage(`Error uploading students: ${result.error}`);
				setErrorMessage(result.error);
				return;
			}

			addDebugMessage('Received response from server');

			// Safely check the response structure
			const successCount = result.data.success.length;
			const failedCount = result.data.failed.length;

			if (failedCount > 0) {
				setErrorMessage(
					`Upload completed with ${failedCount} errors. Check debug log for details.`
				);
				if (Array.isArray(result.data.failed)) {
					result.data.failed.forEach((failure: { email: string; error: string }) => {
						addDebugMessage(`Failed to upload ${failure.email}: ${failure.error}`);
					});
				}
			}

			if (successCount > 0) {
				addDebugMessage(`Successfully uploaded ${successCount} students`);
				setSuccessMessage(`✓ Successfully uploaded ${successCount} students!`);
			} else if (failedCount === 0) {
				setErrorMessage('No records were processed. Please check your file format.');
			}

			setFile(null);
			// Reset file input
			const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
			if (fileInput) fileInput.value = '';
		} catch (error) {
			console.error('Error:', error);
			addDebugMessage(
				`Upload error: ${error instanceof Error ? error.message : String(error)}`
			);
			setErrorMessage(
				`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		} finally {
			setIsUploading(false);
		}
	};

	useEffect(() => {
		fetchSemesters();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="container mx-auto p-6">
			<h1 className="text-2xl font-bold mb-4">Bulk Student Upload</h1>
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
					<Select value={selectedSemester} onValueChange={setSelectedSemester}>
						<SelectTrigger id="semester" className="w-full">
							<SelectValue placeholder="Select semester" />
						</SelectTrigger>
						<SelectContent>
							{semesters.map((semester) => (
								<SelectItem key={semester.id} value={semester.id.toString()}>
									{semester.academic_year} {semester.name}
									{semester.is_active && ' (Current)'}
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
						accept=".xlsx, .xls, .csv"
						onChange={handleFileChange}
						className="w-full mb-4"
					/>
					<p className="text-sm text-gray-500 mb-4">
						Supported formats: .xlsx, .xls, .csv
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
								Upload Students
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

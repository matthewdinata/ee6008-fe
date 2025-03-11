'use client';

import { Loader2, Upload } from 'lucide-react';
import { useState } from 'react';

import { uploadFile } from '@/utils/actions/admin/upload';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function FileUpload() {
	const [file, setFile] = useState<File | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [successMessage, setSuccessMessage] = useState('');
	const [errorMessage, setErrorMessage] = useState('');

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
	const handleUpload = async () => {
		if (!file) {
			setErrorMessage('Please select a file before uploading.');
			return;
		}

		setIsUploading(true);
		setErrorMessage('');
		setSuccessMessage('');

		try {
			const formData = new FormData();
			formData.append('file', file);

			// Use the uploadFile utility function which handles session management internally
			const response = await uploadFile(formData);

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.message || `Upload failed: ${response.statusText}`);
			}

			setSuccessMessage('✓ File uploaded successfully!');
			setFile(null);
			// Reset file input
			const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
			if (fileInput) fileInput.value = '';
		} catch (error) {
			console.error('Error:', error);
			setErrorMessage(
				`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		} finally {
			setIsUploading(false);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h2 className="text-xl font-bold tracking-tight">File Upload</h2>
			</div>

			<div className="grid gap-6">
				<div className="grid gap-3">
					<Label htmlFor="file">Select File</Label>
					<Input
						id="file"
						type="file"
						onChange={handleFileChange}
						disabled={isUploading}
					/>
					<p className="text-sm text-muted-foreground">Upload a file to the system</p>
				</div>

				<div className="flex justify-end">
					<Button onClick={handleUpload} disabled={!file || isUploading}>
						{isUploading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Uploading...
							</>
						) : (
							<>
								<Upload className="mr-2 h-4 w-4" />
								Upload
							</>
						)}
					</Button>
				</div>

				{successMessage && (
					<Alert className="bg-green-50 text-green-800 border-green-200">
						<AlertDescription>{successMessage}</AlertDescription>
					</Alert>
				)}

				{errorMessage && (
					<Alert variant="destructive">
						<AlertDescription>{errorMessage}</AlertDescription>
					</Alert>
				)}
			</div>
		</div>
	);
	}}
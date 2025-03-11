'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Loader2, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function FileUpload() {
	const [file, setFile] = useState<File | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [successMessage, setSuccessMessage] = useState('');
	const [errorMessage, setErrorMessage] = useState('');

	const supabase = createClientComponentClient();
	const router = useRouter();

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files && event.target.files.length > 0) {
			const selectedFile = event.target.files[0];
			setFile(selectedFile);
		}
	};

	const handleUpload = async () => {
		if (!file) {
			setErrorMessage('Please select a file before uploading.');
			return;
		}

		setIsUploading(true);
		setErrorMessage('');
		setSuccessMessage('');

		try {
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session) {
				router.push('/signin');
				return;
			}

			const formData = new FormData();
			formData.append('file', file);

			// Example upload endpoint - update with your actual API endpoint
			const response = await fetch(`${process.env.BACKEND_API_URL}/api/admin/upload`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${session.access_token}`,
				},
				body: formData,
			});

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
}

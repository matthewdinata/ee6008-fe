// import-allocation.tsx
import { UploadCloud } from 'lucide-react';
import { useState } from 'react';

import { useImportAllocation } from '@/utils/hooks/admin/use-import-allocation';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { GeneratedAllocationData } from '../types';

interface ImportAllocationProps {
	semesterId: number;
	onSuccess: (data: GeneratedAllocationData) => void;
}

export function ImportAllocation({ semesterId, onSuccess }: ImportAllocationProps) {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	const { importAllocation, isPending } = useImportAllocation();

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			setSelectedFile(e.target.files[0]);
		}
	};

	const handleUpload = () => {
		if (!selectedFile || !semesterId) return;

		importAllocation(
			{
				file: selectedFile,
				semesterId,
			},
			{
				onSuccess: (data) => {
					onSuccess(data);
					setIsDialogOpen(false);
					setSelectedFile(null);
				},
			}
		);
	};

	return (
		<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
			<DialogTrigger asChild>
				<Button variant="outline">
					<UploadCloud className="w-4 h-4 mr-2" />
					Import Allocation
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Import Allocation from CSV</DialogTitle>
					<DialogDescription className="pt-3">
						Update allocation data by uploading a modified CSV file. You can first
						export an existing allocation to CSV, make your changes to the file, and
						then upload it back here to update the allocation. The CSV must maintain the
						original format
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-4 py-2">
					<div className="grid gap-2">
						<Label htmlFor="csvFile">CSV File</Label>
						<Input
							id="csvFile"
							type="file"
							accept=".csv"
							onChange={handleFileChange}
							disabled={isPending}
						/>
						{selectedFile && (
							<p className="text-sm text-muted-foreground">
								Selected file: {selectedFile.name}
							</p>
						)}
					</div>
				</div>

				<div className="flex flex-row-reverse gap-2">
					<Button onClick={handleUpload} disabled={!selectedFile || isPending}>
						{isPending ? 'Importing...' : 'Import'}
					</Button>
					<DialogClose asChild>
						<Button variant="outline" disabled={isPending}>
							Cancel
						</Button>
					</DialogClose>
				</div>
			</DialogContent>
		</Dialog>
	);
}

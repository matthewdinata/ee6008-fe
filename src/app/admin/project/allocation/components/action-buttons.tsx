import { CheckCheck, FileDown, History, Play } from 'lucide-react';
import { useState } from 'react';

import { useGetAllocationsBySemester } from '@/utils/hooks/use-get-allocations-by-semester';

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
import { Skeleton } from '@/components/ui/skeleton';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

import { AllocationData } from '../types';

function AllocationHistory({
	semesterId,
	onApply,
}: {
	semesterId: number;
	onApply: (allocationData: AllocationData) => void;
}) {
	const { data, isLoading } = useGetAllocationsBySemester(semesterId);

	return (
		<>
			<DialogHeader>
				<DialogTitle>Allocation History</DialogTitle>
				<DialogDescription>
					This dialog shows the allocation history for the selected semester.
				</DialogDescription>
			</DialogHeader>
			{isLoading ? (
				<Skeleton className="h-48 w-full" />
			) : (
				<div className="max-h-[400px] overflow-y-auto">
					{data && data.length > 0 ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Timestamp</TableHead>
									<TableHead>Allocation Rate</TableHead>
									<TableHead>Dropped Projects</TableHead>
									<TableHead>Action</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{data.map((allocation, idx) => (
									<TableRow key={`${allocation.allocation_id}-${idx}`}>
										<TableCell>
											{new Date(allocation.timestamp).toLocaleString()}
										</TableCell>
										<TableCell>
											{allocation.data?.allocationRate.toFixed(2)}%
										</TableCell>
										<TableCell>
											{allocation.data?.droppedProjects.length}
										</TableCell>
										<TableCell>
											<Button
												variant="outline"
												size="sm"
												onClick={() =>
													onApply(allocation.data as AllocationData)
												}
											>
												Apply
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					) : (
						<div>No allocations found.</div>
					)}
				</div>
			)}
			<DialogClose asChild className="mt-1">
				<Button>Close</Button>
			</DialogClose>
		</>
	);
}

type ActionButtonsProps = {
	onGenerate: () => void;
	isGenerating: boolean;
	hasData: boolean;
	semesterId: number;
	setAllocationData: (data: AllocationData) => void;
};

export function ActionButtons({
	onGenerate,
	isGenerating,
	hasData,
	semesterId,
	setAllocationData,
}: ActionButtonsProps) {
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const handleApply = (data: AllocationData) => {
		setAllocationData(data);
		setIsDialogOpen(false);
	};
	return (
		<div className="flex flex-wrap justify-between items-center">
			<div className="flex flex-wrap gap-3 mr-auto">
				<Button variant="default" onClick={onGenerate} disabled={isGenerating}>
					<Play className="w-4 h-4" />
					{isGenerating ? 'Generating...' : 'Generate Allocation'}
				</Button>
				<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
					<DialogTrigger asChild>
						<Button
							variant="outline"
							disabled={isGenerating}
							onClick={() => setIsDialogOpen(true)}
						>
							<History className="w-4 h-4" />
							History
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-[640px]">
						<AllocationHistory semesterId={semesterId} onApply={handleApply} />
					</DialogContent>
				</Dialog>
				<Button variant="outline" disabled={!hasData || isGenerating}>
					<FileDown className="w-4 h-4" />
					Export to CSV
				</Button>
				{/* TODO: implement API */}
				<Button
					variant="outline"
					onClick={() => console.log('TODO')}
					disabled={!hasData || isGenerating}
				>
					<CheckCheck className="w-4 h-4" />
					Set Active Allocation
				</Button>
			</div>
		</div>
	);
}

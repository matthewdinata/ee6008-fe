import { Check, CheckCheck, FileDown, History, Play } from 'lucide-react';
import { useState } from 'react';
import { CSVLink } from 'react-csv';

import { useClearSelectedAllocation } from '@/utils/hooks/use-clear-selected-allocation';
import { useGetAllocationsBySemester } from '@/utils/hooks/use-get-allocations-by-semester';
import { useGetSelectedAllocation } from '@/utils/hooks/use-get-selected-allocation';
import { useToggleSelectedAllocation } from '@/utils/hooks/use-toggle-selected-allocation';

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

import { GeneratedAllocationData } from '../types';
import { prepareCSVData } from '../utils';

function AllocationHistory({
	semesterId,
	onApply,
}: {
	semesterId: number;
	onApply: (allocationData: GeneratedAllocationData) => void;
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
						<>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>ID</TableHead>
										<TableHead>Timestamp</TableHead>
										<TableHead>Allocation Rate</TableHead>
										<TableHead>Dropped Projects</TableHead>
										<TableHead>Action</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{data.map((allocation, idx) => (
										<TableRow key={`${allocation.allocationId}-${idx}`}>
											<TableCell>
												{allocation.allocationId?.toString()}
											</TableCell>
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
														onApply({
															allocationId: allocation.allocationId,
															result: JSON.parse(
																JSON.stringify(allocation.data)
															),
														})
													}
												>
													Apply
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>

							<p className="text-sm text-muted-foreground mt-2">
								Note: Only displaying the last 20 allocation data.
							</p>
						</>
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
	handleGenerate: () => void;
	isPending: boolean;
	allocationData: GeneratedAllocationData | null;
	semesterId: number;
	setAllocationData: (data: GeneratedAllocationData) => void;
};

export function ActionButtons({
	handleGenerate,
	isPending,
	allocationData,
	semesterId,
	setAllocationData,
}: ActionButtonsProps) {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const { data: selectedAllocation, isPending: isFetchingSelectedAllocation } =
		useGetSelectedAllocation(semesterId);
	const { mutate: toggleSelectedAllocation, isPending: isToggling } =
		useToggleSelectedAllocation();
	const { mutate: clearSelectedAllocation, isPending: isClearing } = useClearSelectedAllocation();

	const handleApply = (data: GeneratedAllocationData) => {
		setAllocationData(data);
		setIsDialogOpen(false);
	};

	const handleIsActiveButtonClick = async () => {
		try {
			if (semesterId && allocationData) {
				if (isActive) {
					clearSelectedAllocation(semesterId, {
						onError: (error) => {
							console.error('Failed to clear selected allocation:', error);
						},
					});
				} else {
					toggleSelectedAllocation(
						{ semesterId, allocationId: allocationData.allocationId },
						{
							onSuccess: () => {
								setAllocationData({ ...allocationData });
							},
							onError: (error) => {
								console.error('Failed to toggle selected allocation:', error);
							},
						}
					);
				}
			} else {
				console.error('No semesterId and allocationData found');
			}
		} catch (error) {
			console.error('Failed to toggle selected allocation:', error);
		}
	};

	const isActive =
		allocationData && allocationData?.allocationId === selectedAllocation?.allocationId;

	return (
		<div className="flex flex-wrap justify-between items-center">
			<div className="flex flex-wrap gap-3 mr-auto">
				<Button variant="default" onClick={handleGenerate} disabled={isPending}>
					<Play className="w-4 h-4" />
					{isPending ? 'Generating...' : 'Generate Allocation'}
				</Button>
				<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
					<DialogTrigger asChild>
						<Button
							variant="outline"
							disabled={isPending}
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

				<Button
					variant="outline"
					disabled={!allocationData || isPending}
					asChild={!!allocationData && !isPending}
				>
					{allocationData && !isPending ? (
						<CSVLink
							data={prepareCSVData(allocationData).data}
							headers={prepareCSVData(allocationData).headers}
							filename={prepareCSVData(allocationData).filename}
							className="flex items-center"
						>
							<FileDown className="w-4 h-4 mr-2" />
							Export to CSV
						</CSVLink>
					) : (
						<>
							<FileDown className="w-4 h-4 mr-2" />
							Export to CSV
						</>
					)}
				</Button>

				<Button
					variant="outline"
					onClick={handleIsActiveButtonClick}
					disabled={
						!allocationData ||
						isPending ||
						isFetchingSelectedAllocation ||
						isToggling ||
						isClearing
					}
					className={
						isActive
							? 'bg-emerald-400 bg-opacity-20 border-emerald-500 hover:bg-opacity-35 hover:bg-emerald-400'
							: ''
					}
				>
					{isActive ? <CheckCheck className="w-4 h-4" /> : <Check className="w-4 h-4" />}
					{isToggling || isClearing
						? 'Processing...'
						: isActive
							? 'Active'
							: 'Set as Active'}
				</Button>
			</div>
		</div>
	);
}

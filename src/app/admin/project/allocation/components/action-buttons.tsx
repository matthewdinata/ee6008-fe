import { CheckCheck, History, Play } from 'lucide-react';

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

function AllocationHistory({ semesterId }: { semesterId: number }) {
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
											<Button variant="outline" size="sm">
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
	onSave: () => void;
	isGenerating: boolean;
	hasData: boolean;
	semesterId: number;
};

export function ActionButtons({
	// TODO: update props to match the actual props used in the component
	onGenerate,
	onSave,
	isGenerating,
	hasData,
	semesterId,
}: ActionButtonsProps) {
	return (
		<div className="flex flex-wrap justify-between items-center">
			<div className="flex flex-wrap gap-3 mr-auto">
				<Button variant="default" onClick={onGenerate} disabled={isGenerating}>
					<Play className="w-4 h-4" />
					{isGenerating ? 'Generating...' : 'Generate Allocation'}
				</Button>

				<Dialog>
					<DialogTrigger asChild>
						<Button variant="outline" disabled={!hasData}>
							<History className="w-4 h-4" />
							History
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-[640px]">
						<AllocationHistory semesterId={semesterId} />
					</DialogContent>
				</Dialog>

				<Button variant="secondary" onClick={onSave} disabled={!hasData}>
					<CheckCheck className="w-4 h-4" />
					Set Active Allocation
				</Button>
			</div>
		</div>
	);
}

import { CheckCheck, History, Play } from 'lucide-react';
import { useState } from 'react';

import { useGetAllocationsBySemester } from '@/utils/hooks/use-get-allocations-by-semester';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

function AllocationHistory({
	semesterId,
	isOpen,
	onClose,
}: {
	semesterId: number;
	isOpen: boolean;
	onClose: () => void;
}) {
	const { data, isLoading } = useGetAllocationsBySemester(semesterId);

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Allocation History</DialogTitle>
				</DialogHeader>
				{isLoading ? (
					<div>Loading...</div>
				) : (
					<div className="max-h-[400px] overflow-y-auto">
						{data && data.length > 0 ? (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Timestamp</TableHead>
										<TableHead>Allocation %</TableHead>
										<TableHead>Action</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{data.map((allocation) => (
										<TableRow key={allocation.allocation_id}>
											<TableCell>
												{new Date(allocation.timestamp).toLocaleString()}
											</TableCell>
											<TableCell>
												{allocation.data?.allocationRate.toFixed(2)}%
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
				<DialogClose asChild>
					<Button>Close</Button>
				</DialogClose>
			</DialogContent>
		</Dialog>
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
	onGenerate,
	onSave,
	isGenerating,
	hasData,
	semesterId,
}: ActionButtonsProps) {
	const [isHistoryOpen, setIsHistoryOpen] = useState(false);

	const handleHistoryOpen = () => setIsHistoryOpen(true);
	const handleHistoryClose = () => setIsHistoryOpen(false);

	return (
		<div className="flex flex-wrap justify-between items-center">
			<div className="flex flex-wrap gap-3 mr-auto">
				<Button variant="default" onClick={onGenerate} disabled={isGenerating}>
					<Play className="w-4 h-4" />
					{isGenerating ? 'Generating...' : 'Generate Allocation'}
				</Button>
				<Button variant="outline" onClick={handleHistoryOpen} disabled={!hasData}>
					<History className="w-4 h-4" />
					History
				</Button>
				<Button variant="secondary" onClick={onSave} disabled={!hasData}>
					<CheckCheck className="w-4 h-4" />
					Set Active Allocation
				</Button>
			</div>
			<AllocationHistory
				semesterId={semesterId}
				isOpen={isHistoryOpen}
				onClose={handleHistoryClose}
			/>
		</div>
	);
}

'use client';

import { AlertCircle } from 'lucide-react';
import { useState } from 'react';

import { Semester } from '@/types';
import { useGenerateAllocations } from '@/utils/hooks/use-generate-allocations';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { GeneratedAllocationData } from '../types';
import { ActionButtons } from './action-buttons';
import { AllocationResults } from './allocation-results';
import { StatisticsCards } from './statistics-card';

interface AllocationContainerProps {
	activeSemester: Semester;
	initialData: GeneratedAllocationData | null;
}

function AllocationContainer({ activeSemester, initialData }: AllocationContainerProps) {
	const [allocationData, setAllocationData] = useState<GeneratedAllocationData | null>(
		initialData
	);
	const { mutate: generateAllocations, isPending: isGenerating } = useGenerateAllocations();

	const handleGenerateAllocation = async () => {
		try {
			if (activeSemester) {
				generateAllocations(
					{ semesterId: activeSemester.id },
					{
						onSuccess: (data) => {
							setAllocationData(data as GeneratedAllocationData);
						},
						onError: (error) => {
							console.error('Failed to generate allocation:', error);
						},
					}
				);
			} else {
				console.error('No active semester found');
			}
		} catch (error) {
			console.error('Failed to generate allocation:', error);
		}
	};

	return (
		<div className="space-y-6">
			<ActionButtons
				handleGenerate={handleGenerateAllocation}
				isPending={isGenerating}
				allocationData={allocationData}
				semesterId={activeSemester.id}
				setAllocationData={setAllocationData}
			/>

			{!allocationData && !isGenerating ? (
				<div className="mt-8">
					<Alert variant="default" className="bg-amber-50 border-amber-200">
						<AlertCircle className="h-4 w-4 text-amber-500" />
						<AlertTitle className="text-amber-600">No Allocations Found</AlertTitle>
						<AlertDescription className="text-gray-700">
							No project allocation is currently active. Apply an allocation
							from&nbsp;
							<span className="font-medium">&quot;History&quot;</span>
							&nbsp;or click&nbsp;
							<span className="font-medium">&quot;Generate Allocation&quot;</span>
							&nbsp;to create a new allocation.
						</AlertDescription>
					</Alert>
				</div>
			) : (
				<>
					<StatisticsCards data={allocationData} isGenerating={isGenerating} />
					<AllocationResults data={allocationData} isGenerating={isGenerating} />
				</>
			)}
		</div>
	);
}

export default AllocationContainer;

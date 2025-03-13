'use client';

import { AlertCircle } from 'lucide-react';
import { useState } from 'react';

import { useGenerateAllocations } from '@/utils/hooks/use-generate-allocations';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { AllocationData } from '../types';
import { ActionButtons } from './action-buttons';
import { AllocationResults } from './allocation-results';
import { StatisticsCards } from './statistics-card';

function AllocationContainer() {
	const [allocationData, setAllocationData] = useState<AllocationData | null>(null);
	const [isGenerating, setIsGenerating] = useState(false);

	const { mutate: generateAllocations } = useGenerateAllocations();
	const semesterId = 5; // TODO: replace with actual data

	const handleGenerateAllocation = async () => {
		setIsGenerating(true);
		try {
			generateAllocations(
				{ semesterId },
				{
					onSuccess: (data) => {
						setAllocationData(data as AllocationData);
					},
					onError: (error) => {
						console.error('Failed to generate allocation:', error);
					},
					onSettled: () => {
						setIsGenerating(false);
					},
				}
			);
		} catch (error) {
			console.error('Failed to generate allocation:', error);
			setIsGenerating(false);
		}
	};

	const handleSaveDraft = async () => {
		if (!allocationData) return;

		try {
			// TODO: Replace with actual save logic
			console.log('Draft saved:', allocationData);
		} catch (error) {
			console.error('Failed to save draft:', error);
		}
	};

	return (
		<div className="space-y-6">
			<ActionButtons
				onGenerate={handleGenerateAllocation}
				onSave={handleSaveDraft}
				isGenerating={isGenerating}
				hasData={!!allocationData}
				semesterId={semesterId}
				setAllocationData={setAllocationData}
			/>

			{!allocationData && !isGenerating ? (
				<div className="mt-8">
					<Alert variant="default" className="bg-amber-50 border-amber-200">
						<AlertCircle className="h-4 w-4 text-amber-500" />
						<AlertTitle className="text-amber-600">No Allocations Found</AlertTitle>
						<AlertDescription className="text-gray-700">
							No project allocation is currently active. Click{' '}
							<span className="font-medium">&quot;Generate Allocation&quot;</span> to
							start the process.
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

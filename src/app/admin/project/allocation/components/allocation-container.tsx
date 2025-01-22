'use client';

import { useState } from 'react';

import { AllocationData } from '../types';
import { ActionButtons } from './action-buttons';
import { AllocationResults } from './allocation-results';
import { StatisticsCards } from './statistics-card';

type AllocationContainerProps = {
	initialData?: AllocationData;
};

function AllocationContainer({ initialData }: AllocationContainerProps) {
	const [allocationData, setAllocationData] = useState<AllocationData | null>(
		initialData || null
	);
	const [isGenerating, setIsGenerating] = useState(false);

	const handleGenerateAllocation = async () => {
		setIsGenerating(true);
		try {
			// TODO: Replace with actual data fetching logic
			const data = {};
			setAllocationData(data as AllocationData);
		} catch (error) {
			console.error('Failed to generate allocation:', error);
		} finally {
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
			/>

			<StatisticsCards data={allocationData} />

			<AllocationResults data={allocationData} />
		</div>
	);
}

export default AllocationContainer;

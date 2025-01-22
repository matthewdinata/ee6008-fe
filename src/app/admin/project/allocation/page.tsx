import React, { Suspense } from 'react';

import AllocationContainer from './components/allocation-container';

async function GenerateAllocationPage() {
	// TODO: replace with actual data
	const savedDraft = {
		allocationRate: 98,
		averagePreference: 2.3,

		preferenceDistribution: [
			{ preference: '1st', count: 45 },
			{ preference: '2nd', count: 60 },
			{ preference: '3rd', count: 50 },
			{ preference: '4th', count: 30 },
			{ preference: '5th', count: 11 },
		],
	};

	return (
		<Suspense fallback={<div>Loading...</div>}>
			<AllocationContainer initialData={savedDraft} />
		</Suspense>
	);
}

export default GenerateAllocationPage;

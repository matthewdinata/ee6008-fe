import React, { Suspense } from 'react';

import AllocationContainer from './components/allocation-container';
import rawMockData from './mock-data.json';

async function GenerateAllocationPage() {
	// TODO: replace with actual data
	const mockData = {
		allocations: rawMockData.allocations.map((item) => ({
			studentId: item.student_id,
			projectId: item.project_id,
			priority: item.priority,
			status: item.status,
		})),
		allocationRate: rawMockData.allocation_rate,
		averagePreference: rawMockData.average_preference,
		preferenceDistribution: rawMockData.preference_distribution,
		unallocatedStudents: rawMockData.unallocated_students,
		droppedProjects: rawMockData.dropped_projects,
	};

	return (
		<Suspense fallback={<div>Loading...</div>}>
			<AllocationContainer initialData={mockData} />
		</Suspense>
	);
}

export default GenerateAllocationPage;

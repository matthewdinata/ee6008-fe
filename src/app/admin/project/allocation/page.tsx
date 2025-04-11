import { AlertCircle } from 'lucide-react';
import React, { Suspense } from 'react';

import { getActiveSemester } from '@/utils/actions/admin/get-active-semester';
import { getSelectedAllocation } from '@/utils/actions/admin/get-selected-allocation';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

import AllocationContainer from './components/allocation-container';
import { GeneratedAllocationData } from './types';

export const dynamic = 'force-dynamic';

async function AllocationData() {
	const activeSemester = await getActiveSemester();
	const selectedAllocationData = activeSemester?.id
		? await getSelectedAllocation(activeSemester.id)
		: null;

	if (!activeSemester) {
		return (
			<Alert variant="default" className="bg-amber-50 border-amber-200">
				<AlertCircle className="h-4 w-4 text-amber-500" />
				<AlertTitle className="text-amber-600">No Allocations Found</AlertTitle>
				<AlertDescription className="text-gray-700">
					No semester is currently active. Please activate a semester.
				</AlertDescription>
			</Alert>
		);
	}

	const allocationData: GeneratedAllocationData | null = selectedAllocationData
		? {
				allocationId: selectedAllocationData.allocationId,
				result: JSON.parse(JSON.stringify(selectedAllocationData.data)),
			}
		: null;

	return <AllocationContainer activeSemester={activeSemester} initialData={allocationData} />;
}

export default async function GenerateAllocationPage() {
	return (
		<Suspense fallback={<Skeleton className="h-96 w-full" />}>
			<AllocationData />
		</Suspense>
	);
}

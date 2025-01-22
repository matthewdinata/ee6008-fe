import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { AllocationData } from '../types';

type AllocationResultsProps = {
	data: AllocationData | null;
};

export function AllocationResults({ data }: AllocationResultsProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Allocation Results</CardTitle>
			</CardHeader>
			{/* TODO: Implement the allocation results */}
			<CardContent>
				{data ? 'Data should be shown here.' : 'No allocation generated.'}
			</CardContent>
		</Card>
	);
}

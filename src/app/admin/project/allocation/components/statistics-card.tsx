import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { AllocationData } from '../types';
import { PreferenceDistributionChart } from './preference-distribution-chart';

type StatisticsCardsProps = {
	data: AllocationData | null;
};

export function StatisticsCards({ data }: StatisticsCardsProps) {
	if (!data) return null;

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
			<Card>
				<CardHeader>
					<CardTitle>Allocation Statistics</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div>
							<p className="text-sm text-muted-foreground">Student Allocation Rate</p>
							<p className="text-2xl font-bold">{data.allocationRate}%</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">
								Average Preference Score
							</p>
							<p className="text-2xl font-bold">{data.averagePreference}</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<PreferenceDistributionChart data={data.preferenceDistribution} />
		</div>
	);
}

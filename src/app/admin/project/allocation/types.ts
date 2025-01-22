export type AllocationData = {
	allocationRate: number;
	averagePreference: number;
	preferenceDistribution: Array<{
		preference: string;
		count: number;
	}>;
};

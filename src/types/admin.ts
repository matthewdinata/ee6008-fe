export type Semester = {
	id: number;
	name: string;
	academicYear: string;
	minCap: number;
	maxCap: number;
	active: boolean;
	createdAt: Date;
	updatedAt: Date;
	selectedAllocationId: number;
};

export type AllocationData = {
	allocationId: number;
	timestamp: Date;
	name: string;
	data: string;
	semesterId: number;
};

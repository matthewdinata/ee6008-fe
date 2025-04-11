export type Semester = {
	id: number;
	name: string;
	academicYear: number;
	startDate: string;
	endDate: string;
	isActive: boolean;
	status: string;
};

export type AllocationData = {
	allocationId: number;
	timestamp: Date;
	name: string;
	data: string;
	semesterId: number;
};

export type AllocationDetails = {
	allocations: Array<{
		studentId: number;
		name: string;
		matriculationNumber: string;
		projectId: number;
		priority: number;
		status: string;
	}>;
	allocationRate: number;
	averagePreference: number;
	preferenceDistribution: { [key: string]: number };
	unallocatedStudents: Array<number>;
	droppedProjects: Array<number>;
};

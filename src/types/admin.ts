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

import { GenerateAllocationsResponseData } from '@/utils/actions/admin/generate-allocations';

export type AllocationData = GenerateAllocationsResponseData;
export type Allocation = {
	studentId: number;
	projectId: number;
	priority: number;
	status: string;
};

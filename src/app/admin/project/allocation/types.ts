import { GenerateAllocationsResponseData } from '@/utils/actions/admin/generate-allocations';

export type GeneratedAllocationData = GenerateAllocationsResponseData;
export type Allocation = {
	studentId: number;
	name: string;
	matriculationNumber: string;
	projectId: number;
	priority: number;
	status: string;
};

'use server';

import { fetcherFn } from '../../functions';

type TeamMember = {
	student_id: number;
	name: string;
	email: string;
	matriculation_number: string;
	priority: number;
};

export type AllocatedProjectResponse = {
	project: {
		id: number;
		title: string;
		description: string;
		programme?: {
			id: number;
			name: string;
		};
		venue?: {
			id: number;
			name: string;
		};
		professor?: {
			id: number;
			name: string;
			email: string;
		};
		moderator?: {
			id: number;
			name: string;
			email: string;
		};
	};
	priority: number;
	allocationId: number;
	allocationName: string;
	allocationTimestamp: string;
	semester: string;
	academicYear: number;
	teamMembers: TeamMember[];
} | null;

export async function getAllocatedProject(): Promise<AllocatedProjectResponse> {
	try {
		const result = await fetcherFn<AllocatedProjectResponse>(
			'student/allocation',
			{
				method: 'GET',
			},
			{
				next: { tags: ['allocated-project'] },
			}
		);

		return result ?? null;
	} catch (error) {
		console.error('Error in getAllocatedProject:', error);
		return null;
	}
}

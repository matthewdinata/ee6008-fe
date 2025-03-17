'use server';

import { Proposal } from '@/types/faculty';

import { fetcherFn } from '../../functions';

export type ProposalResponse = Proposal & {
	professor: {
		id: number;
		name: string;
	};
	semester: {
		id: number;
		name: string;
		academicYear: number;
	};
	venue: {
		id: number;
		name: string;
	};
	programme: {
		id: number;
		name: string;
	};
};

export type GetProposalsByFacultyIdResponseData = ProposalResponse[] | null;

export async function getProposalsByFacultyId(
	facultyId: number
): Promise<GetProposalsByFacultyIdResponseData> {
	try {
		const result = await fetcherFn<GetProposalsByFacultyIdResponseData>(
			`faculty/proposals/${facultyId}`,
			{
				method: 'GET',
			},
			{
				next: { tags: ['proposals', facultyId] },
			}
		);

		return result ?? [];
	} catch (error) {
		console.error('Error in getProposalsByFacultyId:', error);
		return null;
	}
}

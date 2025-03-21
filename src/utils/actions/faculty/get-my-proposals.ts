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

export type GetMyProposalsResponseData = ProposalResponse[] | null;

export async function getMyProposals(): Promise<GetMyProposalsResponseData> {
	try {
		const result = await fetcherFn<GetMyProposalsResponseData>(
			`faculty/proposals/me`,
			{
				method: 'GET',
			},
			{
				next: { tags: ['proposals'] },
			}
		);

		return result ?? [];
	} catch (error) {
		console.error('Error in getMyProposals:', error);
		return null;
	}
}

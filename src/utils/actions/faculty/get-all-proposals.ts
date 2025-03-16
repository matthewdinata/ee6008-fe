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
		academic_year: number;
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

export type GetAllProposalsResponseData = ProposalResponse[] | null;

export async function getAllProposals(): Promise<GetAllProposalsResponseData> {
	try {
		const result = await fetcherFn<GetAllProposalsResponseData>(
			'faculty/proposals',
			{
				method: 'GET',
			},
			{
				next: { tags: ['proposals'] },
			}
		);

		return result ?? [];
	} catch (error) {
		console.error('Error in getAllProposals:', error);
		return null;
	}
}

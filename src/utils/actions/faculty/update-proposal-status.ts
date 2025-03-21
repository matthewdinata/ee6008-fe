'use server';

import { revalidateTag } from 'next/cache';

import { fetcherFn } from '../../functions';

export type UpdateProposalStatusData = {
	proposalId: number;
	status: 'approved' | 'rejected';
	reason?: string;
};

export type UpdateProposalStatusResponseData = {
	message: string;
	proposal: {
		id: number;
		title: string;
		description: string;
		professorId: number;
		semesterId: number;
		status: 'approved' | 'rejected';
		createdAt: string;
		updatedAt: string;
		venueId: number;
		programmeId: number;
		reason: string;
	};
} | null;

export async function updateProposalStatus(
	data: UpdateProposalStatusData
): Promise<UpdateProposalStatusResponseData> {
	try {
		const response = await fetcherFn<UpdateProposalStatusResponseData>(
			`faculty/proposal/${data.proposalId}/status`,
			{
				method: 'PATCH',
				next: { tags: ['proposal'] },
			},
			data
		);

		revalidateTag('proposals');

		return response;
	} catch (error) {
		console.error('Error in updateProposalStatus:', error);
		return null;
	}
}

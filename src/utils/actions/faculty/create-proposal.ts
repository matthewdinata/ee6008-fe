'use server';

import { revalidateTag } from 'next/cache';

import { fetcherFn } from '../../functions';

export type CreateProposalData = {
	title: string;
	description: string;
	professorId: number;
	venueId: number;
	programmeId: number;
};

export type CreateProposalResponseData = {
	id: number;
	title: string;
	description: string;
	professorId: number;
	semesterId: number;
	status: string;
	createdAt: string;
	updatedAt: string;
	venueId: number;
	programmeId: number;
} | null;

export async function createProposal(
	data: CreateProposalData
): Promise<CreateProposalResponseData> {
	try {
		const response = await fetcherFn<CreateProposalResponseData>(
			'faculty/proposal',
			{
				method: 'POST',
				next: { tags: ['proposal'] },
			},
			data
		);

		revalidateTag('proposals');
		const facultyId = data.professorId;
		revalidateTag(`['proposals', ${facultyId}]`);

		return response;
	} catch (error) {
		console.error('Error in createProposal:', error);
		return null;
	}
}

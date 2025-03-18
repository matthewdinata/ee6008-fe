'use server';

import { Programme } from '@/types/faculty';

import { fetcherFn } from '../../functions';

export type GetActiveProgrammesResponseData = Programme[] | null;

export async function getActiveProgrammes(): Promise<GetActiveProgrammesResponseData> {
	try {
		const result = await fetcherFn<GetActiveProgrammesResponseData>(
			'faculty/programmes/active',
			{
				method: 'GET',
			},
			{
				next: { tags: ['active-programmes'] },
			}
		);

		return result ?? [];
	} catch (error) {
		console.error('Error in getActiveProgrammes:', error);
		return null;
	}
}

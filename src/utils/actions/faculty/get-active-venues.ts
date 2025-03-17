'use server';

import { Venue } from '@/types/faculty';

import { fetcherFn } from '../../functions';

export type GetActiveVenuesResponseData = Venue[] | null;

export async function getActiveVenues(): Promise<GetActiveVenuesResponseData> {
	try {
		const result = await fetcherFn<GetActiveVenuesResponseData>(
			'faculty/venues/active',
			{
				method: 'GET',
			},
			{
				next: { tags: ['active-venues'] },
			}
		);

		return result ?? [];
	} catch (error) {
		console.error('Error in getActiveVenues:', error);
		return null;
	}
}

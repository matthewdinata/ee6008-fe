'use server';

import { SemesterTimeline } from '@/types/faculty';

import { fetcherFn } from '../../functions';

export type GetActiveSemesterTimeline = SemesterTimeline | null;

export async function getActiveSemesterTimeline(): Promise<GetActiveSemesterTimeline> {
	try {
		const result = await fetcherFn<GetActiveSemesterTimeline>(
			'faculty/semester/timeline',
			{
				method: 'GET',
			},
			{
				next: { tags: ['active-semester-timeline'] },
			}
		);

		return result ?? ({} as SemesterTimeline);
	} catch (error) {
		console.error('Error in getActiveSemesterTimeline:', error);
		return null;
	}
}

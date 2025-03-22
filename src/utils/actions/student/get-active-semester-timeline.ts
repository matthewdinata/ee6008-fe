'use server';

import { SemesterTimeline } from '@/types/student';

import { fetcherFn } from '../../functions';

export type GetActiveSemesterTimeline = SemesterTimeline | null;

export async function getActiveSemesterTimeline(): Promise<GetActiveSemesterTimeline> {
	try {
		const result = await fetcherFn<GetActiveSemesterTimeline>(
			'student/semester/timeline',
			{
				method: 'GET',
			},
			{
				next: { tags: ['semester-timeline'] },
			}
		);

		return result ?? ({} as SemesterTimeline);
	} catch (error) {
		console.error('Error in getActiveSemesterTimeline:', error);
		return null;
	}
}

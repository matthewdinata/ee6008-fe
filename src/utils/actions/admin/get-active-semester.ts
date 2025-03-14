'use server';

import { Semester } from '@/types';

import { fetcherFn } from '../../functions';

export type GetActiveSemesterResponseData = Semester | null;

export async function getActiveSemester(): Promise<GetActiveSemesterResponseData> {
	try {
		const result = await fetcherFn<GetActiveSemesterResponseData>(
			'admin/semesters/active',
			{
				method: 'GET',
			},
			{
				next: { tags: ['active-semester'] },
			}
		);

		return result ?? null;
	} catch (error) {
		console.error('Error in getActiveSemester:', error);
		return null;
	}
}

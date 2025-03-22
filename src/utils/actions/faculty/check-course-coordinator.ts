'use server';

import { fetcherFn } from '../../functions';

export type CheckCourseCoordinatorResponseData = {
	message: string;
	isCourseCoordinator: boolean;
} | null;

export async function checkCourseCoordinator(): Promise<CheckCourseCoordinatorResponseData> {
	try {
		const result = await fetcherFn<CheckCourseCoordinatorResponseData>(
			'faculty/check-course-coordinator',
			{
				method: 'GET',
			},
			{
				next: { tags: ['check-course-coordinator'] },
			}
		);

		return result ?? { message: '', isCourseCoordinator: false };
	} catch (error) {
		console.error('Error in checkCourseCoordinator:', error);
		return null;
	}
}

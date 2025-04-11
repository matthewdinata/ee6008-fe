'use server';

import { fetcherFn } from '../../functions';

export type CourseCoordinatorResponse = {
	isCourseCoordinator: boolean;
	courses?: {
		id: number;
		code: string;
		name: string;
	}[];
} | null;

export async function checkCourseCoordinator(): Promise<CourseCoordinatorResponse> {
	try {
		// Use the JWT token from fetcherFn for authentication
		// The backend will identify the user from the token
		const result = await fetcherFn<CourseCoordinatorResponse>(
			'faculty/check-course-coordinator',
			{
				method: 'GET',
			}
		);

		return result ?? { isCourseCoordinator: false };
	} catch (error) {
		console.error('Error in checkCourseCoordinator:', error);
		return { isCourseCoordinator: false };
	}
}

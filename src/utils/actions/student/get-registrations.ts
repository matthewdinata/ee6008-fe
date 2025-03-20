'use server';

import { fetcherFn } from '../../functions';

// Define the response structure
interface RegisteredProject {
	id: number;
	title: string;
	description: string;
	priority: number;
	status: string;
	registeredAt: string;
	professorId: number;
	professorName: string;
	moderatorId: number;
	moderatorName: string;
}

interface RegistrationsResponse {
	studentId: number;
	studentName: string;
	semesterId: number;
	semesterName: string;
	academicYear: number;
	projects: RegisteredProject[];
}

export async function getRegistrations(): Promise<RegistrationsResponse | null> {
	try {
		const result = await fetcherFn<RegistrationsResponse>(
			'student/registrations',
			{
				method: 'GET',
			},
			{
				next: { tags: ['get-registrations'] },
			}
		);

		return result ?? null;
	} catch (error) {
		console.error('Error in getRegistrations:', error);
		return null;
	}
}

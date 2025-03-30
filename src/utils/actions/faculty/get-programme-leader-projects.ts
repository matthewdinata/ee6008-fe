'use server';

import { fetcherFn } from '../../functions';
import { Project } from '../admin/types';

export type ProgrammeLeaderProjectsResponse = Project[] | null;

export async function getProgrammeLeaderProjects(
	semesterId: number,
	email: string
): Promise<ProgrammeLeaderProjectsResponse> {
	try {
		if (!semesterId) {
			console.error('No semester ID provided');
			return null;
		}

		console.log(
			'Fetching programme leader projects for semester',
			semesterId,
			'with email',
			email
		);

		// Make sure the @ character is properly formatted for the API
		const encodedEmail = encodeURIComponent(email).replace(/%40/g, '@');

		// Include email in the API path
		const result = await fetcherFn<ProgrammeLeaderProjectsResponse>(
			`faculty/projects/programme-leader/${encodedEmail}/semester/${semesterId}`,
			{
				method: 'GET',
			}
		);

		return result ?? [];
	} catch (error) {
		console.error('Error in getProgrammeLeaderProjects:', error);
		return null;
	}
}

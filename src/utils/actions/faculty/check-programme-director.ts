'use server';

import { fetcherFn } from '../../functions';

export type ProgrammeDirectorResponse = {
	isProgrammeDirector: boolean;
	message: string;
	programmeId?: number;
} | null;

export async function checkProgrammeDirector(): Promise<ProgrammeDirectorResponse> {
	try {
		// Use the JWT token from fetcherFn for authentication
		// The backend will identify the user from the token
		const result = await fetcherFn<ProgrammeDirectorResponse>(
			'faculty/check-programme-director',
			{
				method: 'GET',
			}
		);

		return result ?? { isProgrammeDirector: false, message: 'No response' };
	} catch (error) {
		console.error('Error in checkProgrammeDirector:', error);
		return { isProgrammeDirector: false, message: 'Error occurred' };
	}
}

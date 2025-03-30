'use server';

import { fetcherFn } from '../../functions';

export type Programme = {
	programme_id: number;
	name: string;
	code: string;
};

export type CheckProgrammeLeaderResponseData = {
	message: string;
	is_programme_leader: boolean;
	isProgrammeLeader: boolean;

	programmes: Programme[] | null;
} | null;

export async function checkProgrammeLeader(
	email: string | ''
): Promise<CheckProgrammeLeaderResponseData> {
	try {
		console.log('Using email for API call:', email);
		const encodedEmail = encodeURIComponent(email).replace(/%40/g, '@');

		// Include email in the API path
		const result = await fetcherFn<CheckProgrammeLeaderResponseData>(
			`faculty/check-programme-leader/${encodedEmail}`,
			{
				method: 'GET',
			}
		);

		return (
			result ?? {
				message: 'Error checking programme leader status',
				is_programme_leader: false,
				isProgrammeLeader: false,
				programmes: null,
			}
		);
	} catch (error) {
		console.error('Error in checkProgrammeLeader:', error);
		return null;
	}
}

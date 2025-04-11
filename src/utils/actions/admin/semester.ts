import { fetcherFn } from '@/utils/functions';

import { ServerActionResponse, User, getAccessToken } from './fetch';
import {
	AssignLeaderParams,
	CreateProgrammeParams,
	CreateSemesterParams,
	Programme,
	TimelineEvent,
} from './types';
import type { Semester } from './types';

// Extended User interface with additional properties needed in this file
interface UserWithProfessor extends User {
	role?: string;
	created_at?: string;
	updated_at?: string;
	professor?: {
		id: number;
		user_id: number;
		user?: {
			id: number;
			name: string;
			email: string;
			role?: string;
		};
	};
}

/**
 * Server action to fetch all semesters
 */
export async function fetchSemesters(): Promise<ServerActionResponse<Semester[]>> {
	try {
		const result = await fetcherFn<Semester[] | { data?: Semester[] }>(
			'admin/semesters',
			{
				method: 'GET',
			},
			{
				next: { tags: ['semesters'] },
			}
		);

		// Process the response data
		let semesters: Semester[] = [];

		// Handle different response shapes
		if (Array.isArray(result)) {
			semesters = result;
		} else if (result && typeof result === 'object' && 'data' in result && result.data) {
			if (Array.isArray(result.data)) {
				semesters = result.data;
			} else {
				console.warn('fetchSemesters: Unexpected response format', result);
				semesters = [];
			}
		}

		return {
			success: true,
			data: semesters,
		};
	} catch (error) {
		console.error('Error in fetchSemesters:', error);
		return {
			success: false,
			error: 'Failed to fetch semesters',
		};
	}
}

/**
 * Server action to get timeline for a semester
 */
export async function getSemesterTimeline(
	semesterId: number
): Promise<ServerActionResponse<TimelineEvent[]>> {
	try {
		const result = await fetcherFn<TimelineEventResponse>(
			`admin/semesters/${semesterId}/timeline`,
			{
				method: 'GET',
			},
			{
				next: { tags: [`semester-${semesterId}-timeline`] },
			}
		);

		// Process the response data
		let timelineData: TimelineEventResponse | null = null;

		// Handle different response shapes
		if (Array.isArray(result)) {
			timelineData = result[0]; // Take the first result if it's an array
		} else if (result && typeof result === 'object') {
			if (
				'data' in result &&
				result.data &&
				Array.isArray(result.data) &&
				result.data.length > 0
			) {
				timelineData = result.data[0];
			} else {
				timelineData = result;
			}
		}

		// If we don't have any timeline data, return an empty array
		if (!timelineData) {
			console.warn('getSemesterTimeline: No timeline data found');
			return { success: true, data: [] };
		}

		console.log('Timeline raw data:', timelineData);

		// Transform the API response into the expected TimelineEvent format
		const events: TimelineEvent[] = [];

		// Add semester period event
		if (timelineData.startDate && timelineData.endDate) {
			events.push({
				id: 1,
				semester_id: semesterId,
				name: 'Semester Period',
				start_date: timelineData.startDate,
				end_date: timelineData.endDate,
				description: 'Overall semester duration',
				is_scheduled: true,
			});
		}

		// Add faculty proposal submission event
		if (
			timelineData.facultyProposalSubmissionStart &&
			timelineData.facultyProposalSubmissionEnd
		) {
			events.push({
				id: 2,
				semester_id: semesterId,
				name: 'Faculty Proposal Submission',
				start_date: timelineData.facultyProposalSubmissionStart,
				end_date: timelineData.facultyProposalSubmissionEnd,
				description: 'Period for faculty to submit project proposals',
				is_scheduled: true,
			});
		}

		// Add faculty proposal review event
		if (timelineData.facultyProposalReviewStart && timelineData.facultyProposalReviewEnd) {
			events.push({
				id: 3,
				semester_id: semesterId,
				name: 'Faculty Proposal Review',
				start_date: timelineData.facultyProposalReviewStart,
				end_date: timelineData.facultyProposalReviewEnd,
				description: 'Period for reviewing faculty project proposals',
				is_scheduled: true,
			});
		}

		// Add student registration event
		if (timelineData.studentRegistrationStart && timelineData.studentRegistrationEnd) {
			events.push({
				id: 4,
				semester_id: semesterId,
				name: 'Student Registration',
				start_date: timelineData.studentRegistrationStart,
				end_date: timelineData.studentRegistrationEnd,
				description: 'Period for students to register for projects',
				is_scheduled: true,
			});
		}

		// Add faculty mark entry event
		if (timelineData.facultyMarkEntryStart && timelineData.facultyMarkEntryEnd) {
			events.push({
				id: 5,
				semester_id: semesterId,
				name: 'Faculty Mark Entry',
				start_date: timelineData.facultyMarkEntryStart,
				end_date: timelineData.facultyMarkEntryEnd,
				description: 'Period for faculty to enter marks',
				is_scheduled: true,
			});
		}

		// Add student peer review event
		if (timelineData.studentPeerReviewStart && timelineData.studentPeerReviewEnd) {
			events.push({
				id: 6,
				semester_id: semesterId,
				name: 'Student Peer Review',
				start_date: timelineData.studentPeerReviewStart,
				end_date: timelineData.studentPeerReviewEnd,
				description: 'Period for student peer reviews',
				is_scheduled: true,
			});
		}

		console.log('Transformed timeline events:', events);

		return {
			success: true,
			data: events,
		};
	} catch (error) {
		console.error('Error in getSemesterTimeline:', error);
		return {
			success: false,
			error: 'Failed to fetch semester timeline',
		};
	}
}

/**
 * Server action to get programmes for a semester
 */
export async function getProgrammes(
	semesterId: number
): Promise<ServerActionResponse<Programme[]>> {
	try {
		const result = await fetcherFn<ProgrammeResponse>(
			`admin/semesters/${semesterId}/programmes`,
			{
				method: 'GET',
			},
			{
				next: { tags: [`semester-${semesterId}-programmes`] },
			}
		);

		// Process the response data
		let rawProgrammes: Record<string, unknown>[] = [];

		// Handle different response shapes
		if (Array.isArray(result)) {
			rawProgrammes = result;
		} else if (result && typeof result === 'object' && 'data' in result && result.data) {
			if (Array.isArray(result.data)) {
				rawProgrammes = result.data;
			} else {
				console.warn('getProgrammes: Unexpected response format', result);
				rawProgrammes = [];
			}
		}

		// Map and filter out invalid programmes
		const programmes = rawProgrammes
			.map((programme) => mapToProgramme(programme))
			.filter(
				(programme) =>
					programme && typeof programme === 'object' && programme.id !== undefined
			);

		if (programmes.length !== rawProgrammes.length) {
			console.warn(
				`getProgrammes: Filtered out ${rawProgrammes.length - programmes.length} invalid programme objects`
			);
		}

		return {
			success: true,
			data: programmes,
		};
	} catch (error) {
		console.error('Error in getProgrammes:', error);
		return {
			success: false,
			error: 'Failed to fetch programmes',
		};
	}
}

/**
 * Server action to assign a leader to a programme
 */
export async function assignLeader(
	params: AssignLeaderParams
): Promise<ServerActionResponse<Programme>> {
	try {
		const accessToken = await getAccessToken();
		if (!accessToken) {
			return { success: false, error: 'Unauthorized: No access token' };
		}

		const { programmeId, email, semesterId } = params;

		// Use the correct endpoint and data structure based on backend API
		// The backend expects all fields to be present
		const data = {
			programme_id: programmeId,
			email: email,
			semester_id: semesterId,
		};

		// Log the request data for debugging
		console.log('Sending assignLeader request with data:', JSON.stringify(data));

		try {
			const response = await fetcherFn(
				`admin/programme-leaders`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${accessToken}`,
					},
				},
				data
			);

			// The response from fetcherFn is already the parsed JSON data
			return { success: true, data: response };
		} catch (error) {
			console.error('Error assigning leader to programme:', error);
			return {
				success: false,
				error:
					error instanceof Error ? error.message : 'Failed to assign leader to programme',
			};
		}
	} catch (error) {
		console.error('Error in assignLeader:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'An unexpected error occurred',
		};
	}
}

/**
 * Server action to get faculty users
 */
/* eslint-disable prettier/prettier */
export async function getFacultyUsers(): Promise<ServerActionResponse<UserWithProfessor[]>> {
	try {
		const accessToken = await getAccessToken();
		if (!accessToken) {
			return { success: false, error: 'Unauthorized: No access token' };
		}

		// Use the correct endpoint that works with the existing implementation
		const response = await fetcherFn('admin/users-faculty', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
		});

		console.log('Faculty users raw response:', response);

		// Ensure we have proper formatting for the users
		let facultyData: UserWithProfessor[] = [];

		if (Array.isArray(response)) {
			// Map the response to match our expected User type format
			facultyData = response.map((user: Record<string, unknown>) => {
				const userData: UserWithProfessor = {
					id:
						typeof user.id === 'string'
							? parseInt(user.id, 10)
							: (user.id as number) || Date.now(),
					email: (user.email as string) || '',
					name: (user.name as string) || '',
					role: (user.role as string) || 'faculty',
					created_at: user.created_at as string | undefined,
					updated_at: user.updated_at as string | undefined,
				};

				// Add professor property if it exists
				if ('professor' in user) {
					userData.professor = user.professor as UserWithProfessor['professor'];
				}

				return userData;
			});
		} else if (response && typeof response === 'object') {
			if ('data' in response && response.data && Array.isArray(response.data)) {
				facultyData = response.data.map((user: Record<string, unknown>) => {
					const userData: UserWithProfessor = {
						id:
							typeof user.id === 'string'
								? parseInt(user.id, 10)
								: (user.id as number),
						email: (user.email as string) || '',
						name: (user.name as string) || '',
						role: (user.role as string) || 'faculty',
						created_at: user.created_at as string | undefined,
						updated_at: user.updated_at as string | undefined,
					};

					// Add professor property if it exists
					if ('professor' in user) {
						userData.professor = user.professor as UserWithProfessor['professor'];
					}

					return userData;
				});
			}
		}

		console.log('Faculty users processed:', facultyData);
		return { success: true, data: facultyData };
	} catch (error) {
		console.error('Error fetching faculty users:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'An unexpected error occurred',
		};
	}
}
/* eslint-enable prettier/prettier */

/**
 * Server action to create a new programme
 * @param params The parameters for creating a programme
 */
export async function createProgramme(
	params: CreateProgrammeParams
): Promise<ServerActionResponse<Programme>> {
	try {
		const accessToken = await getAccessToken();
		if (!accessToken) {
			return { success: false, error: 'Unauthorized: No access token' };
		}

		// Call the API to create the programme
		const response = await fetcherFn<Record<string, unknown>>(
			`admin/programmes`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${accessToken}`,
				},
			},
			{
				name: params.name,
				programme_code: params.programme_code,
				semester_id: params.semester_id,
			}
		);

		// Map the response to our Programme interface
		const programme = mapApiResponseToProgramme(response);

		return {
			success: true,
			data: programme,
		};
	} catch (error) {
		console.error('Error in createProgramme:', error);
		return {
			success: false,
			error: 'Failed to create programme',
		};
	}
}

/**
 * Server action to update the semester timeline - alias for updateCompleteTimeline
 */
export async function updateSemesterTimeline(timelineData: {
	semester_id: number;
	start_date: string;
	end_date: string;
	faculty_proposal_submission_start: string;
	faculty_proposal_submission_end: string;
	faculty_proposal_review_start: string;
	faculty_proposal_review_end: string;
	student_registration_start: string;
	student_registration_end: string;
	faculty_mark_entry_start: string;
	faculty_mark_entry_end: string;
	student_peer_review_start: string;
	student_peer_review_end: string;
}): Promise<ServerActionResponse<TimelineEvent[]>> {
	console.log('===============================================');
	console.log('SERVER: updateSemesterTimeline called with data:');
	console.log('===============================================');

	// Validate all date strings
	const dateFields = [
		{ name: 'start_date', value: timelineData.start_date },
		{ name: 'end_date', value: timelineData.end_date },
		{
			name: 'faculty_proposal_submission_start',
			value: timelineData.faculty_proposal_submission_start,
		},
		{
			name: 'faculty_proposal_submission_end',
			value: timelineData.faculty_proposal_submission_end,
		},
		{
			name: 'faculty_proposal_review_start',
			value: timelineData.faculty_proposal_review_start,
		},
		{ name: 'faculty_proposal_review_end', value: timelineData.faculty_proposal_review_end },
		{ name: 'student_registration_start', value: timelineData.student_registration_start },
		{ name: 'student_registration_end', value: timelineData.student_registration_end },
		{ name: 'faculty_mark_entry_start', value: timelineData.faculty_mark_entry_start },
		{ name: 'faculty_mark_entry_end', value: timelineData.faculty_mark_entry_end },
		{ name: 'student_peer_review_start', value: timelineData.student_peer_review_start },
		{ name: 'student_peer_review_end', value: timelineData.student_peer_review_end },
	];

	// Log and validate each date field
	let hasInvalidDate = false;
	dateFields.forEach((field) => {
		console.log(`${field.name}:`, field.value);
		try {
			const isValid = !isNaN(new Date(field.value).getTime());
			if (!isValid) {
				console.error(`Invalid date for ${field.name}: ${field.value}`);
				hasInvalidDate = true;
			}
		} catch (error) {
			console.error(`Error validating ${field.name}:`, error);
			hasInvalidDate = true;
		}
	});

	if (hasInvalidDate) {
		return {
			success: false,
			error: 'One or more dates are invalid. Please check the format and try again.',
		};
	}

	return updateCompleteTimeline(timelineData);
}

/**
 * Server action to update the entire semester timeline with all date fields at once
 */
export async function updateCompleteTimeline(timelineData: {
	semester_id: number;
	start_date: string;
	end_date: string;
	faculty_proposal_submission_start: string;
	faculty_proposal_submission_end: string;
	faculty_proposal_review_start: string;
	faculty_proposal_review_end: string;
	student_registration_start: string;
	student_registration_end: string;
	faculty_mark_entry_start: string;
	faculty_mark_entry_end: string;
	student_peer_review_start: string;
	student_peer_review_end: string;
}): Promise<ServerActionResponse<TimelineEvent[]>> {
	try {
		console.log('===============================================');
		console.log(`SERVER: Updating complete timeline for semester ${timelineData.semester_id}`);
		console.log('===============================================');

		const accessToken = await getAccessToken();

		if (!accessToken) {
			console.log('SERVER: No access token found');
			return {
				success: false,
				error: 'Not authenticated',
			};
		}

		// Format the data for the API - converting to API's expected format
		const formattedData = {
			id: timelineData.semester_id,
			semesterId: timelineData.semester_id,
			startDate: timelineData.start_date,
			endDate: timelineData.end_date,
			facultyProposalSubmissionStart: timelineData.faculty_proposal_submission_start,
			facultyProposalSubmissionEnd: timelineData.faculty_proposal_submission_end,
			facultyProposalReviewStart: timelineData.faculty_proposal_review_start,
			facultyProposalReviewEnd: timelineData.faculty_proposal_review_end,
			studentRegistrationStart: timelineData.student_registration_start,
			studentRegistrationEnd: timelineData.student_registration_end,
			facultyMarkEntryStart: timelineData.faculty_mark_entry_start,
			facultyMarkEntryEnd: timelineData.faculty_mark_entry_end,
			studentPeerReviewStart: timelineData.student_peer_review_start,
			studentPeerReviewEnd: timelineData.student_peer_review_end,
		};

		console.log('SERVER: Formatted data for API:', JSON.stringify(formattedData, null, 2));
		console.log('SERVER: Checking formatted date strings:');
		console.log('startDate type:', typeof formattedData.startDate);
		console.log('endDate type:', typeof formattedData.endDate);
		console.log('startDate format:', formattedData.startDate);
		console.log('Is valid ISO date?', !isNaN(new Date(formattedData.startDate).getTime()));

		// Post request to update semester timeline
		try {
			console.log('SERVER: Sending POST request to admin/timelines...');
			const response = await fetcherFn(
				`admin/timelines`,
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${accessToken}`,
						'Content-Type': 'application/json',
					},
				},
				formattedData
			);

			console.log('SERVER: Timeline update response:', JSON.stringify(response, null, 2));

			// After successful update, fetch the latest timeline to return
			console.log('SERVER: Fetching updated timeline after update...');
			const updatedTimeline = await getSemesterTimeline(timelineData.semester_id);
			console.log('SERVER: Updated timeline fetch result:', updatedTimeline.success);

			return updatedTimeline;
		} catch (innerError) {
			console.error('SERVER ERROR: Inner error during timeline update request:', innerError);
			throw innerError; // Rethrow to be caught by the outer catch
		}
	} catch (error) {
		console.error('SERVER ERROR: Error updating timeline:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to update timeline',
		};
	}
}

/**
 * Server action to create a new semester
 */
export async function createSemester(
	params: CreateSemesterParams
): Promise<ServerActionResponse<Semester>> {
	try {
		// Log the request data for debugging
		console.log('Sending createSemester request with data:', JSON.stringify(params));

		const response = await fetcherFn<Semester | { data: Semester }>(
			'admin/semesters',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
			},
			params // Pass params as the third argument
		);

		// Process the response data
		let semester: Semester | null = null;

		// Handle different response shapes
		if (response && typeof response === 'object') {
			if ('data' in response && response.data) {
				semester = response.data;
			} else {
				semester = response as Semester;
			}
		}

		if (!semester) {
			console.warn('createSemester: No semester data in response');
			return { success: false, error: 'Failed to create semester: No data returned' };
		}

		return {
			success: true,
			data: semester,
		};
	} catch (error) {
		console.error('Error in createSemester:', error);
		return {
			success: false,
			error: 'Failed to create semester',
		};
	}
}

/**
 * Server action to delete a programme by ID
 * @param programmeId The ID of the programme to delete
 */
export async function deleteProgramme(programmeId: number): Promise<ServerActionResponse<boolean>> {
	try {
		const accessToken = await getAccessToken();
		if (!accessToken) {
			return { success: false, error: 'Unauthorized: No access token' };
		}

		// Call the API to delete the programme
		await fetcherFn(
			`admin/programmes/${programmeId}`,
			{
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${accessToken}`,
				},
			},
			{}
		);

		return {
			success: true,
			data: true,
		};
	} catch (error) {
		console.error('Error in deleteProgramme:', error);
		return {
			success: false,
			error: 'Failed to delete programme',
		};
	}
}

/**
 * Server action to create a timeline event
 */
export async function createTimeline(
	event: TimelineEvent
): Promise<ServerActionResponse<TimelineEvent>> {
	try {
		// Log the request data for debugging
		console.log('Sending createTimeline request with data:', JSON.stringify(event));

		const response = await fetcherFn<TimelineEvent | { data: TimelineEvent }>(
			`admin/semesters/${event.semester_id}/timeline`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
			},
			event
		);

		// Process the response data
		let timelineEvent: TimelineEvent | null = null;

		// Handle different response shapes
		if (response && typeof response === 'object') {
			if ('data' in response && response.data) {
				timelineEvent = response.data;
			} else {
				timelineEvent = response as TimelineEvent;
			}
		}

		if (!timelineEvent) {
			console.warn('createTimeline: No timeline event data in response');
			return { success: false, error: 'Failed to create timeline event: No data returned' };
		}

		return {
			success: true,
			data: timelineEvent,
		};
	} catch (error) {
		console.error('Error in createTimeline:', error);
		return {
			success: false,
			error: 'Failed to create timeline event',
		};
	}
}

/**
 * Server action to update a timeline event
 */
export async function updateTimeline(
	event: TimelineEvent
): Promise<ServerActionResponse<TimelineEvent>> {
	try {
		if (!event.id) {
			return { success: false, error: 'Timeline event ID is required for updates' };
		}

		// Log the request data for debugging
		console.log('Sending updateTimeline request with data:', JSON.stringify(event));

		const response = await fetcherFn<TimelineEvent | { data: TimelineEvent }>(
			`admin/semesters/${event.semester_id}/timeline/${event.id}`,
			{
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
			},
			event
		);

		// Process the response data
		let timelineEvent: TimelineEvent | null = null;

		// Handle different response shapes
		if (response && typeof response === 'object') {
			if ('data' in response && response.data) {
				timelineEvent = response.data;
			} else {
				timelineEvent = response as TimelineEvent;
			}
		}

		if (!timelineEvent) {
			console.warn('updateTimeline: No timeline event data in response');
			return { success: false, error: 'Failed to update timeline event: No data returned' };
		}

		return {
			success: true,
			data: timelineEvent,
		};
	} catch (error) {
		console.error('Error in updateTimeline:', error);
		return {
			success: false,
			error: 'Failed to update timeline event',
		};
	}
}

/**
 * Helper function to map API response to Programme interface
 */
/* eslint-disable prettier/prettier */
function mapToProgramme(data: Record<string, unknown>): Programme {
	// Log the raw data for debugging
	console.log('mapToProgramme processing data:', JSON.stringify(data, null, 2));

	// Try to extract leader information from different possible structures
	let leaderName = '';
	let leaderEmail = '';
	let coordinatorProfessorId: number | undefined = undefined;
	let coordinatorProfessor: Programme['coordinator_professor'] = null;

	// Handle different nested structures that might contain professor information
	// Check for camelCase (coordinatorProfessor) and snake_case (coordinator_professor) properties
	const coordinator = (data.coordinatorProfessor || data.coordinator_professor) as
		| Record<string, unknown>
		| undefined;

	if (coordinator) {
		coordinatorProfessor = {
			id:
				typeof coordinator.id === 'string'
					? parseInt(coordinator.id, 10)
					: (coordinator.id as number),
			user_id:
				typeof coordinator.userId === 'string'
					? parseInt(coordinator.userId, 10)
					: typeof coordinator.user_id === 'string'
						? parseInt(coordinator.user_id, 10)
						: (coordinator.userId as number) ||
							(coordinator.user_id as number | undefined),
		};
		coordinatorProfessorId =
			typeof coordinator.id === 'string'
				? parseInt(coordinator.id, 10)
				: (coordinator.id as number);

		// Check if the coordinator has a user property
		if (coordinator.user) {
			const userObj = coordinator.user as Record<string, unknown>;
			leaderName = (userObj.name as string) || '';
			leaderEmail = (userObj.email as string) || '';
			console.log('Found leader info in coordinator.user:', { leaderName, leaderEmail });
		}
		// Check if the coordinator has name/email directly
		else if (coordinator.name || coordinator.email) {
			leaderName = (coordinator.name as string) || '';
			leaderEmail = (coordinator.email as string) || '';
			console.log('Found leader info directly in coordinator:', { leaderName, leaderEmail });
		}
	}
	// Check for direct leader_name and leader_email properties
	else if (data.leaderName || data.leader_name || data.leaderEmail || data.leader_email) {
		leaderName = (data.leaderName as string) || (data.leader_name as string) || '';
		leaderEmail = (data.leaderEmail as string) || (data.leader_email as string) || '';
		console.log('Found leader info directly in data:', { leaderName, leaderEmail });
	}

	// Create a properly structured Programme object
	return {
		id: typeof data.id === 'string' ? parseInt(data.id, 10) : (data.id as number),
		ProgrammeID: typeof data.id === 'string' ? parseInt(data.id, 10) : (data.id as number),
		semester_id:
			typeof data.semesterId === 'string'
				? parseInt(data.semesterId, 10)
				: typeof data.semester_id === 'string'
					? parseInt(data.semester_id, 10)
					: (data.semesterId as number) || (data.semester_id as number),
		name: (data.name as string) || '',
		programme_code:
			(data.programmeCode as string) ||
			(data.programme_code as string) ||
			(data.code as string) ||
			'',
		description: (data.description as string) || '',
		// Optional properties that might not be in the API response
		coordinator_professor: coordinatorProfessor,
		coordinator_professor_id: coordinatorProfessorId || (data.coordinatorProfessorId as number),
		leader_name: leaderName,
		leader_email: leaderEmail,
		created_at: (data.createdAt as string) || (data.created_at as string),
		updated_at: (data.updatedAt as string) || (data.updated_at as string),
	};
}

/**
 * Helper function to map API response to Programme interface
 */
function mapApiResponseToProgramme(data: Record<string, unknown>): Programme {
	return {
		id: typeof data.id === 'string' ? parseInt(data.id, 10) : (data.id as number),
		ProgrammeID: typeof data.id === 'string' ? parseInt(data.id, 10) : (data.id as number),
		semester_id: (data.semester_id as number) || (data.semesterId as number),
		name: (data.name as string) || '',
		programme_code: (data.programme_code as string) || (data.programmeCode as string),
		description: (data.description as string) || '',
		created_at: (data.created_at as string) || (data.createdAt as string),
		updated_at: (data.updated_at as string) || (data.updatedAt as string),
	};
}

// // Define additional interfaces needed for type safety
// interface Semester {
// 	id: number;
// 	name: string;
// 	academicYear?: number;
// 	academic_year?: number;
// 	isActive?: boolean;
// 	active?: boolean;
// 	min_cap?: number | null;
// 	max_cap?: number | null;
// 	created_at?: string;
// 	updated_at?: string;
// 	createdAt?: string;
// 	updatedAt?: string;
// }

interface TimelineEventResponse {
	startDate?: string;
	endDate?: string;
	facultyProposalSubmissionStart?: string;
	facultyProposalSubmissionEnd?: string;
	facultyProposalReviewStart?: string;
	facultyProposalReviewEnd?: string;
	studentRegistrationStart?: string;
	studentRegistrationEnd?: string;
	facultyMarkEntryStart?: string;
	facultyMarkEntryEnd?: string;
	studentPeerReviewStart?: string;
	studentPeerReviewEnd?: string;
	data?: TimelineEventResponse[];
	[key: string]: unknown;
}

type ProgrammeResponse = Record<string, unknown>[] | { data?: Record<string, unknown>[] };

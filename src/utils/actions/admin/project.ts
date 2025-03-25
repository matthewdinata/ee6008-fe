'use server';

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

import { fetcherFn } from '@/utils/functions';

import { AssignModeratorRequest, Programme, Project, User, Venue } from './types';

/**
 * Gets a session from cookies for server actions
 * @returns The Supabase session
 */
async function getServerActionSession() {
	const cookieStore = cookies();
	const accessToken = cookieStore.get('session-token')?.value;

	if (!accessToken) {
		console.error('No session token found in cookies');
		throw new Error('No active session found');
	}

	// Verify the token is valid by creating a client and getting the user
	const supabase = createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			global: {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			},
		}
	);

	// Get user data to verify token
	const { data, error } = await supabase.auth.getUser();

	if (error || !data.user) {
		console.error('Invalid session token:', error);
		throw new Error('No active session found');
	}

	// Create a session-like object to maintain compatibility
	return {
		access_token: accessToken,
		user: data.user,
	};
}

/**
 * Helper function to transform camelCase API project to snake_case frontend project
 * @param apiProject Project object from API with camelCase keys
 * @returns Project object with snake_case keys
 */
function transformApiProject(
	apiProject: Partial<Project> & {
		projectId?: number;
		programmeId?: number;
		semesterId?: number;
		professorId?: number;
		moderatorId?: number | null;
		title?: string;
		description?: string;
		programme_name?: string;
		professor_name?: string;
		moderator_name?: string;
		professor?: { id?: number; user_id?: number; name?: string };
		moderator?: { id?: number; user_id?: number; name?: string };
		proposalId?: number;
		createdAt?: string;
		updatedAt?: string;
		venueId?: number;
	}
): Project {
	// Log the raw API project for debugging
	console.log('Raw API project:', apiProject);

	// Handle potential different naming conventions from API
	const professorId =
		apiProject.professorId ||
		apiProject.professor_id ||
		(apiProject.professor ? apiProject.professor.id || apiProject.professor.user_id : null);

	const moderatorId =
		apiProject.moderatorId ||
		apiProject.moderator_id ||
		(apiProject.moderator ? apiProject.moderator.id || apiProject.moderator.user_id : null);

	const transformed = {
		id: apiProject.id,
		proposal_id: apiProject.proposalId || apiProject.proposal_id || 0,
		title: apiProject.title || 'Untitled',
		description: apiProject.description || '',
		created_at: apiProject.createdAt || apiProject.created_at || new Date().toISOString(),
		updated_at: apiProject.updatedAt || apiProject.updated_at || new Date().toISOString(),
		semester_id: apiProject.semesterId || apiProject.semester_id || 0,
		venue_id: apiProject.venueId || apiProject.venue_id || 0,
		programme_id: apiProject.programmeId || apiProject.programme_id || 0,
		professor_id: professorId,
		moderator_id: moderatorId,
		programme_name: apiProject.programmeName || '',
		professor_name:
			apiProject.professorName || (apiProject.professor ? apiProject.professor.name : ''),
		moderator_name:
			apiProject.moderatorName || (apiProject.moderator ? apiProject.moderator.name : ''),
	};

	// Log the transformed project for debugging
	console.log('Transformed project:', transformed);

	// Remove debug fields before returning
	const { ...cleanTransformed } = transformed;
	return cleanTransformed as Project;
}

/**
 * Server action to get projects by semester
 * @param semesterId ID of the semester to get projects for
 * @returns Array of project objects
 */
export async function getProjectsBySemester(semesterId: number): Promise<Project[]> {
	const session = await getServerActionSession();

	console.log(`Fetching projects for semester ${semesterId}`);
	console.log(
		`API URL: ${process.env.BACKEND_API_URL}/api/admin/semesters/${semesterId}/projects`
	);

	try {
		const result = await fetcherFn(`admin/semesters/${semesterId}/projects`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${session.access_token}`,
				'Content-Type': 'application/json',
			},
		});

		console.log('Projects API response:', JSON.stringify(result, null, 2));

		// Transform camelCase keys to snake_case for frontend compatibility
		const transformedProjects = result.map(transformApiProject);

		console.log('Transformed projects:', JSON.stringify(transformedProjects, null, 2));
		return transformedProjects;
	} catch (error) {
		console.error('Error fetching projects:', error);
		throw error;
	}
}

/**
 * Server action to assign a moderator to a project
 * @param data Data containing project ID and moderator email
 * @returns Object containing message and updated project
 */
export async function assignProjectModerator(
	data: AssignModeratorRequest
): Promise<{ message: string; project: Project }> {
	const session = await getServerActionSession();

	// Log the data being sent to API
	console.log('Assign moderator request data:', data);

	try {
		const result = await fetcherFn(
			'admin/projects/assign-moderator',
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${session.access_token}`,
					'Content-Type': 'application/json',
				},
			},
			data
		);

		console.log('Assign moderator API response:', JSON.stringify(result, null, 2));

		// Transform the project in the response
		if (result && result.project) {
			return {
				message: result.message,
				project: transformApiProject(result.project),
			};
		}

		return result;
	} catch (error) {
		console.error('Error assigning moderator:', error);
		throw error;
	}
}

/**
 * Server action to remove a moderator from a project
 * @param projectId ID of the project to remove moderator from
 * @returns Object containing message and updated project
 */
export async function removeProjectModerator(
	projectId: number
): Promise<{ message: string; project: Project }> {
	const session = await getServerActionSession();

	try {
		const result = await fetcherFn(`admin/projects/${projectId}/moderator`, {
			method: 'DELETE',
			headers: {
				Authorization: `Bearer ${session.access_token}`,
				'Content-Type': 'application/json',
			},
		});

		console.log('Remove moderator API response:', JSON.stringify(result, null, 2));

		// Transform the project in the response
		if (result && result.project) {
			return {
				message: result.message,
				project: transformApiProject(result.project),
			};
		}

		return result;
	} catch (error) {
		console.error('Error removing moderator:', error);
		throw error;
	}
}

/**
 * Server action to get programmes for a semester
 * @param semesterId ID of the semester to get programmes for
 * @returns Array of programme objects
 */
export async function getProjectProgrammes(semesterId: number): Promise<Programme[]> {
	const session = await getServerActionSession();

	try {
		console.log(`Fetching programmes for semester ${semesterId}`);
		const result = await fetcherFn(`admin/semesters/${semesterId}/programmes`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${session.access_token}`,
				'Content-Type': 'application/json',
			},
		});

		console.log('Programmes API response:', JSON.stringify(result, null, 2));

		return result;
	} catch (error) {
		console.error('Error fetching programmes:', error);
		throw error;
	}
}

/**
 * Server action to get faculty users
 * @returns Array of faculty users
 */

export type GetFacultyUsersResponseData = User[];

export async function getFacultyUsers(): Promise<GetFacultyUsersResponseData> {
	try {
		console.log('getFacultyUsers: Making API request...');

		// Call the API without explicitly adding auth headers (fetcherFn handles this)
		const result = await fetcherFn<User[] | { data: User[] }>(
			'admin/users-faculty',
			{
				method: 'GET',
			},
			{
				next: { tags: ['faculty-users'] },
			}
		);

		console.log('Faculty API response received:', typeof result);

		// Handle different response shapes, similar to other API calls
		let rawUsers: User[] = [];

		if (Array.isArray(result)) {
			rawUsers = result;
		} else if (result && typeof result === 'object' && 'data' in result) {
			if (Array.isArray(result.data)) {
				rawUsers = result.data;
			} else {
				console.warn('getFacultyUsers: Unexpected response format', result);
				rawUsers = [];
			}
		}

		console.log(`Raw users count: ${rawUsers.length}`);

		// Map the raw faculty data to the expected User interface
		const validUsers = rawUsers
			.filter((user) => user && typeof user === 'object')
			.map((user, index) => {
				// Ensure we have a unique ID for each faculty member
				const uniqueId = user.professor_id || user.userId || user.id || index + 1000;

				return {
					// Use professor_id as the primary ID, fallback to userId or a unique index-based ID
					id: uniqueId,
					// Keep the userId for reference
					userId: user.userId || user.id,
					// Use name directly
					name: user.name || 'Unknown',
					email: user.email || '',
					role: 'faculty',
					isCourseCoordinator: !!user.isCourseCoordinator,
				};
			});

		console.log(`getFacultyUsers: Successfully processed ${validUsers.length} faculty users`);
		if (validUsers.length > 0) {
			console.log('Sample processed user:', JSON.stringify(validUsers[0], null, 2));
		}

		return validUsers;
	} catch (error) {
		console.error('Error in getFacultyUsers:', error);
		return []; // Return empty array instead of null
	}
}

/**
 * Server action to get faculty details by ID
 * @param facultyId ID of the faculty/professor to get details for
 * @returns Faculty user details
 */
export async function getFacultyById(facultyId: number): Promise<User | null> {
	if (!facultyId) return null;

	const session = await getServerActionSession();

	try {
		// Since there's no individual user endpoint, we need to get all faculty and filter
		console.log(`Fetching all faculty to find faculty ID ${facultyId}`);
		const allFaculty: Array<{
			userId?: number;
			user_id?: number;
			id?: number;
			email?: string;
			name?: string;
			role?: string;
			professorId?: number;
			professor_id?: number;
			isCourseCoordinator?: boolean;
			is_course_coordinator?: boolean;
			created_at?: string;
			createdAt?: string;
			updated_at?: string;
			updatedAt?: string;
		}> = await fetcherFn('admin/users-faculty', {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${session.access_token}`,
				'Content-Type': 'application/json',
			},
		});

		if (!Array.isArray(allFaculty)) {
			console.error('Expected array from users-faculty endpoint, got:', allFaculty);
			return null;
		}

		// Format all faculty first to ensure consistent structure
		const formattedFaculty = allFaculty.map(
			(user: {
				userId?: number;
				user_id?: number;
				id?: number;
				email?: string;
				name?: string;
				role?: string;
				professorId?: number;
				professor_id?: number;
				isCourseCoordinator?: boolean;
				is_course_coordinator?: boolean;
				created_at?: string;
				createdAt?: string;
				updated_at?: string;
				updatedAt?: string;
			}) => ({
				id: user.userId || user.id || 0,
				email: user.email || '',
				name: user.name || '',
				role: 'faculty',
				userId: user.userId || user.id || 0,
				professor_id: user.professorId || user.professor_id || 0,
				isCourseCoordinator:
					user.isCourseCoordinator || user.is_course_coordinator || false,
				professor: {
					id: user.professorId || user.professor_id || 0,
					user_id: user.userId || user.id || 0,
					is_course_coordinator:
						user.isCourseCoordinator || user.is_course_coordinator || false,
				},
				created_at: user.created_at || user.createdAt || new Date().toISOString(),
				updated_at: user.updated_at || user.updatedAt || new Date().toISOString(),
			})
		);

		// Debug faculty data received
		console.log(
			`Received ${formattedFaculty.length} faculty members, looking for ID ${facultyId}`
		);

		// Try to find by various ID fields
		const faculty = formattedFaculty.find(
			(f) =>
				f.professor_id === facultyId || // Look for professor_id first
				f.id === facultyId ||
				f.userId === facultyId ||
				(f.professor && (f.professor.id === facultyId || f.professor.user_id === facultyId))
		);

		if (faculty) {
			console.log(`Found faculty with ID ${facultyId}:`, faculty);
			return faculty;
		}

		console.warn(
			`No faculty found with ID ${facultyId} in list of ${formattedFaculty.length} faculty`
		);
		return null;
	} catch (error) {
		console.error(`Error in getFacultyById(${facultyId}):`, error);
		return null;
	}
}

/**
 * Server action to get project venues for a semester
 * @param semesterId ID of the semester to get venues for
 * @returns Array of venue objects
 */
export async function getProjectVenues(semesterId: number): Promise<Venue[]> {
	if (!semesterId) {
		console.error('No semester ID provided for venues query');
		return [];
	}

	try {
		const session = await getServerActionSession();

		console.log(`Fetching venues for semester ${semesterId}`);
		console.log(
			`API URL: ${process.env.BACKEND_API_URL}/api/admin/semesters/${semesterId}/venues`
		);

		const result = await fetcherFn(`admin/semesters/${semesterId}/venues`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${session.access_token}`,
				'Content-Type': 'application/json',
			},
		});

		console.log('Venues API response:', result);

		// Transform API response to match frontend format if needed
		// Similar to how we handle programmes
		const venues = Array.isArray(result) ? result : [];

		// Ensure each venue has the required fields
		return venues.map((venue) => ({
			id: venue.id || venue.venueId || 0,
			name: venue.name || 'Unknown Venue',
			location: venue.location || 'Unknown Location',
			semesterId: semesterId, // Use the provided semesterId
			created_at: venue.created_at || new Date().toISOString(),
			updated_at: venue.updated_at || new Date().toISOString(),
		}));
	} catch (error) {
		console.error('Error fetching venues:', error);
		// Return empty array instead of throwing to prevent page crashes
		return [];
	}
}

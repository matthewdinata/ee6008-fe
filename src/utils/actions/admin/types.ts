// Common response type for all API endpoints
export interface ApiResponse<T> {
	success: boolean;
	data: T;
	error?: string;
}

// Semester types
export interface Semester {
	id: number;
	name: string;
	// Include both naming styles for backwards compatibility
	academicYear: number;
	academic_year?: number;
	isActive: boolean;
	active?: boolean;
	min_cap?: number | null;
	max_cap?: number | null;
	created_at?: string;
	updated_at?: string;
	createdAt?: string;
	updatedAt?: string;
}

// Venue types
export interface Venue {
	id: number;
	name: string;
	location: string;
	semesterId: number;
	created_at: string;
	updated_at: string;
}

export interface CreateSemesterParams {
	name: string;
	academic_year: number;
	active: boolean;
	min_cap?: number | null;
	max_cap?: number | null;
}

// Timeline types
export interface TimelineEvent {
	id?: number;
	semester_id: number;
	name: string;
	start_date: string | Date | null;
	end_date: string | Date | null;
	description: string;
	is_scheduled?: boolean;
}

export interface CreateTimelineEventParams {
	name: string;
	semester_id: number;
	start_date: string | Date;
	end_date: string | Date;
	description?: string;
}

export interface UpdateTimelineParams {
	id?: number;
	name: string;
	semester_id: number;
	start_date: string | Date;
	end_date: string | Date;
	description?: string;
}

// Programme types
export interface Programme {
	id: number;
	semester_id: number;
	name: string;
	programme_code: string;
	description?: string;
	coordinator_professor?: {
		id: number;
		userId?: number;
		user_id?: number;
		user?: {
			id: number;
			email: string;
			name: string;
			role: string;
			createdAt?: string;
			created_at?: string;
			updatedAt?: string;
			updated_at?: string;
		};
		isCourseCoordinator?: boolean;
		is_course_coordinator?: boolean;
		createdAt?: string;
		created_at?: string;
		updatedAt?: string;
		updated_at?: string;
	} | null;
	// For backwards compatibility with previous implementations
	leader_name?: string;
	leader_email?: string;
	coordinator_professor_id?: number;
	created_at?: string;
	updated_at?: string;
}

// User types
export interface User {
	id: number;
	name: string;
	email: string;
	role: string;
	userId?: number;
	professor_id?: number;
	isCourseCoordinator?: boolean;
	professor?: {
		id: number;
		user_id: number;
		user?: {
			id: number;
			name: string;
			email: string;
			role: string;
		};
		is_course_coordinator?: boolean;
		created_at?: string;
		updated_at?: string;
	};
	created_at?: string;
	updated_at?: string;
}

export interface CreateProgrammeParams {
	semester_id: number;
	name: string;
	programme_code: string;
	description?: string;
}

export interface AssignLeaderParams {
	programmeId: number;
	email: string;
	semesterId: number;
}

// Project types
export interface Project {
	id: number;
	proposal_id?: number;
	title: string;
	description: string;
	created_at?: string;
	updated_at?: string;
	createdAt?: string;
	updatedAt?: string;
	semester_id?: number;
	semesterId?: number;
	semester_name?: string;
	semesterName?: string;
	venue_id?: number | null;
	venueId?: number | null;
	venue_name?: string;
	venueName?: string;
	programme_id?: number;
	programmeId?: number;
	programme_name?: string;
	programmeName?: string;
	professor_id?: number;
	professorId?: number;
	professor_name?: string;
	professorName?: string;
	moderator_id?: number | null;
	moderatorId?: number | null;
	moderator_name?: string;
	moderatorName?: string;
}

export interface AssignModeratorRequest {
	project_id: number;
	email: string;
}

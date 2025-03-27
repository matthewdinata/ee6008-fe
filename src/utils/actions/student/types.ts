// Peer Review Types
export interface TeamMember {
	id: number;
	name: string;
	email: string;
	matriculationNumber: string;
	reviewed: boolean;
	reviewId?: number;
	score?: number;
}

export interface CompletionProgress {
	completedReviews: number;
	totalReviews: number;
	percentComplete: number;
}

export interface PeerReviewsResponse {
	projectId: number;
	projectTitle: string;
	teamMembers: TeamMember[];
	completionProgress: CompletionProgress;
}

export interface PeerReviewDetails {
	id: number;
	projectId: number;
	revieweeId: number;
	revieweeName: string;
	revieweeEmail: string;
	score: number;
	comments: string;
	submissionDate: string;
	lastUpdatedDate: string;
}

export interface PeerReviewSubmitRequest {
	projectId: number;
	revieweeStudentId: number;
	score: number;
	comments: string;
}

export interface PeerReviewUpdateRequest {
	score: number;
	comments: string;
}

export interface PeerReviewSubmitResponse {
	message: string;
	reviewId: number;
}

export interface PeerReviewSummary {
	student: {
		id: number;
		name: string;
		averageScore: number;
		reviewsGiven: number;
		reviewsReceived: number;
		completionPercent: number;
		scoresReceived: number[];
	};
	project: {
		id: number;
		title: string;
		teamSize: number;
		teamCompletionPercent: number;
		totalReviews: number;
	};
	reviewerStatus: {
		teamMembers: string[];
		hasReviewedYou: boolean[];
	};
}

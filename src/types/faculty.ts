export enum ProposalStatus {
	APPROVED = 'approved',
	REJECTED = 'rejected',
	PENDING = 'pending',
}

export type Proposal = {
	id: number;
	title: string;
	description: string;
	professorId: number;
	semesterId: number;
	venueId: number;
	programmeId: number;
	status: ProposalStatus;
	createdAt: Date;
	updatedAt: Date;
	reason: string;
};

export type Venue = {
	id: number;
	name: string;
	location: string;
	semesterId: number;
	createdAt: Date;
	updatedAt: Date;
};

export type Programme = {
	id: number;
	name: string;
	semesterId: number;
	coordinatorProfessorId: number;
	programmeCode: string;
	createdAt: Date;
	updatedAt: Date;
};

export type SemesterTimeline = {
	id: number;
	semesterId: number;
	startDate: Date;
	endDate: Date;
	facultyProposalSubmissionStart: Date;
	facultyProposalSubmissionEnd: Date;
	facultyProposalReviewStart: Date;
	facultyProposalReviewEnd: Date;
	studentRegistrationStart: Date;
	studentRegistrationEnd: Date;
	facultyMarkEntryStart: Date;
	facultyMarkEntryEnd: Date;
	studentPeerReviewStart: Date;
	studentPeerReviewEnd: Date;
	createdAt: Date;
	updatedAt: Date;
};

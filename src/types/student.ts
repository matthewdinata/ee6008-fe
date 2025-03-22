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

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
};

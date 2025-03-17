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

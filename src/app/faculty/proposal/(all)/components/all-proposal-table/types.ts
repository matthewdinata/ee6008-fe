export enum ProposalStatus {
	APPROVED = 'Approved',
	REJECTED = 'Rejected',
	PENDING = 'Pending',
}

export type Proposal = {
	id: string;
	title: string;
	semester: string;
	programme: string;
	proposer: string;
	status: ProposalStatus;
};

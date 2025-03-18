import React from 'react';

import AllProposalTable from './components/all-proposal-table';

function AllProposals() {
	// TODO: allow only course coordinator or programme director to access
	// TODO: distinguish data between course coordinator and programme director

	return (
		<div className="mb-8">
			<AllProposalTable />
		</div>
	);
}

export default AllProposals;

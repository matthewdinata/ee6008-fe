import { Metadata } from 'next';

import PeerReviewSummary from '../components/peer-review-summary';

export const metadata: Metadata = {
	title: 'Peer Review Summary',
	description: 'View your peer review summary and statistics',
};

export default function PeerReviewSummaryPage() {
	return (
		<div className="container mx-auto py-6">
			<PeerReviewSummary />
		</div>
	);
}

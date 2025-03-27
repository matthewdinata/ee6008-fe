import { Metadata } from 'next';

import PeerReviewDashboard from './components/peer-review-dashboard';

export const metadata: Metadata = {
	title: 'Peer Review',
	description: 'Review and provide feedback on your team members',
};

export default function PeerReviewPage() {
	return (
		<div className="container mx-auto py-6">
			<PeerReviewDashboard />
		</div>
	);
}

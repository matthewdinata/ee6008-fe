import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
	title: 'Edit Peer Review',
	description: 'Edit your peer review for a team member',
};

export default function EditReviewLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: { id: string };
}) {
	// Validate that the ID is a number
	const id = parseInt(params.id, 10);
	if (isNaN(id)) {
		notFound();
	}

	return <div>{children}</div>;
}

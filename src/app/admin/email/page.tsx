import { Metadata } from 'next';

import { EmailTemplatesList } from '@/app/faculty/email/components/email-templates-list';

export const metadata: Metadata = {
	title: 'Email Template Management | Admin',
	description: 'Manage email templates and notifications for the system',
};

export default function EmailPage() {
	return (
		<div className="space-y-6">
			<div className="py-6">
				<EmailTemplatesList />
			</div>
		</div>
	);
}

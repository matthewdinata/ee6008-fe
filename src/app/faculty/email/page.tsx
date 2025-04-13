import { EmailTemplatesList } from './components/email-templates-list';

export const metadata = {
	title: 'Template Management',
	description: 'Create and manage email templates and notifications',
};

export default function EmailPage() {
	return (
		<div className="mx-auto py-6 space-y-6">
			<EmailTemplatesList />
		</div>
	);
}

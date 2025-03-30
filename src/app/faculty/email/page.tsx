import { EmailTemplatesList } from './components/email-templates-list';

export const metadata = {
	title: 'Template Management',
	description: 'Create and manage email templates and notifications',
};

export default function EmailPage() {
	return (
		<div className="container mx-auto py-6 space-y-6">
			<div className="flex flex-col gap-2">
				<h1 className="text-3xl font-bold tracking-tight">Template Management</h1>
				<p className="text-muted-foreground">
					Create and manage email templates for various notifications and communications.
				</p>
			</div>

			<EmailTemplatesList />
		</div>
	);
}

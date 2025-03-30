'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2, Mail, Send, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { sendEmail } from '@/utils/actions/email';
import { useEmailTemplates } from '@/utils/hooks/use-email-templates';
import {
	EmailTemplate,
	SendEmailInput,
	SendEmailPayload,
	sendEmailSchema,
} from '@/utils/types/email';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export function EmailSender() {
	const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
	const [selectedUsers, setSelectedUsers] = useState<
		{ id: number; name: string; email: string }[]
	>([]);
	const [manualEmails, setManualEmails] = useState<string>('');
	const [_selectedUserType] = useState<'students' | 'faculty' | 'specific'>('specific');
	const [displayPreview, setDisplayPreview] = useState<boolean>(false);
	const [isSending, setIsSending] = useState<boolean>(false);
	const [notification, setNotification] = useState<{
		type: 'success' | 'error' | null;
		title: string;
		message: string;
	}>({ type: null, title: '', message: '' });

	// Fetch data
	const templatesQuery = useEmailTemplates();

	// Form setup
	const form = useForm<SendEmailInput>({
		resolver: zodResolver(sendEmailSchema),
		defaultValues: {
			templateId: 0,
			semesterId: 1,
			recipients: 'specific',
			email_list: [],
		},
	});

	// Get users based on selected type - we're not using this variable in this component
	// const users: { id: number; name: string; email: string }[] = [];

	// Parse emails from the manual entry
	const parseManualEmails = (emailString: string): string[] => {
		if (!emailString) return [];
		return emailString
			.split(/[,\s]+/)
			.map((email) => email.trim())
			.filter((email) => email.length > 0 && email.includes('@'));
	};

	// Handle template selection
	const handleTemplateChange = (templateId: string) => {
		const id = parseInt(templateId);
		const template = templatesQuery.data?.find((t) => t.id === id) || null;
		setSelectedTemplate(template);
		form.setValue('templateId', id);
	};

	// Generate email preview
	const getEmailPreview = () => {
		if (!selectedTemplate) return '';
		return selectedTemplate.body;
	};

	// Handle form submission
	const onSubmit = async (data: SendEmailInput) => {
		console.log('Form submitted with data:', data);

		// Collect emails from both selected users and manual entry
		const selectedUserEmails = selectedUsers.map((user) => user.email);
		const manualEmailList = parseManualEmails(manualEmails);

		console.log('Selected user emails:', selectedUserEmails);
		console.log('Manual email list:', manualEmailList);

		// Combine all emails and remove duplicates
		const allEmails = Array.from(new Set([...selectedUserEmails, ...manualEmailList]));

		console.log('Combined email list:', allEmails);

		if (allEmails.length === 0) {
			console.log('No recipients selected');
			setNotification({
				type: 'error',
				title: 'Error',
				message: 'Please select at least one recipient',
			});
			return;
		}

		// Create the payload for the API call with the exact format the backend expects
		const payload: SendEmailPayload = {
			template_id: data.templateId,
			semester_id: data.semesterId,
			recipients: 'specific',
			email_list: allEmails,
		};
		console.log('Final payload for API:', payload);

		setIsSending(true);

		try {
			console.log('Attempting to send email with server action...');

			// Use the server action directly (with token-based auth)
			const response = await sendEmail(payload);
			console.log('Server action response:', response);

			// Enhanced debug logging
			console.log('Response success flag:', response.success);
			console.log('Response error:', response.error);
			console.log('Complete response object:', JSON.stringify(response));

			// Always show success notification if we received a response
			// This is temporary to debug the issue where emails are sent but error displayed
			const recipientCount = allEmails.length;
			let recipientList = '';

			if (recipientCount <= 3) {
				// Show all recipients if 3 or fewer
				recipientList = allEmails.join(', ');
			} else {
				// Show first 2 recipients and count of remaining ones
				recipientList = `${allEmails.slice(0, 2).join(', ')} and ${recipientCount - 2} more`;
			}

			setNotification({
				type: 'success',
				title: 'Email Sent Successfully',
				message: `Email sent to ${recipientCount} recipient${recipientCount !== 1 ? 's' : ''}${recipientList ? ': ' + recipientList : ''}`,
			});

			// Reset form state
			setSelectedTemplate(null);
			setSelectedUsers([]);
			setManualEmails('');
			form.reset();
		} catch (error) {
			console.error('Error sending email:', error);
			setNotification({
				type: 'error',
				title: 'Error',
				message: error instanceof Error ? error.message : 'Failed to send email',
			});
		} finally {
			setIsSending(false);
		}
	};

	// Prepare options for template selection
	const templateOptions =
		templatesQuery.data?.map((template) => ({
			value: template.id.toString(),
			label: template.name,
		})) || [];

	return (
		<div className="space-y-6">
			{/* Notification alerts */}
			{notification.type && (
				<Alert
					variant={notification.type === 'error' ? 'destructive' : 'default'}
					className={
						notification.type === 'success'
							? 'border-green-500 text-green-700 dark:text-green-400'
							: ''
					}
				>
					<div className="flex justify-between items-start">
						<div className="flex items-start gap-2">
							{notification.type === 'success' ? (
								<CheckCircle2 className="h-5 w-5 text-green-500" />
							) : (
								<Mail className="h-5 w-5" />
							)}
							<div>
								<AlertTitle>{notification.title}</AlertTitle>
								<AlertDescription>{notification.message}</AlertDescription>
							</div>
						</div>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setNotification({ type: null, title: '', message: '' })}
						>
							<X className="h-4 w-4" />
						</Button>
					</div>
				</Alert>
			)}

			<Card className="w-full">
				<CardHeader>
					<CardTitle>Send Email</CardTitle>
					<CardDescription>
						Send emails to students or faculty using templates
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form
							onSubmit={(e) => {
								console.log('Form onSubmit triggered', e);
								form.handleSubmit(onSubmit)(e);
							}}
							className="space-y-6"
						>
							<FormField
								control={form.control}
								name="templateId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email Template</FormLabel>
										<Select
											onValueChange={(value) => {
												field.onChange(parseInt(value));
												handleTemplateChange(value);
											}}
											defaultValue={field.value?.toString()}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select a template" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{templateOptions.map((option) => (
													<SelectItem
														key={option.value}
														value={option.value}
													>
														{option.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormDescription>
											Select the email template you want to use
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="space-y-4">
								<div>
									<div className="space-y-4">
										<div>
											<FormLabel>Enter Email Addresses Manually</FormLabel>
											<Textarea
												placeholder="Enter email addresses separated by commas or spaces..."
												className="min-h-[80px]"
												value={manualEmails}
												onChange={(e) => setManualEmails(e.target.value)}
											/>
											<p className="text-xs text-muted-foreground mt-1">
												{parseManualEmails(manualEmails).length} valid
												email(s) entered
											</p>
										</div>
									</div>
								</div>
							</div>

							<div className="space-y-2">
								<div className="flex items-center">
									<Checkbox
										id="preview"
										checked={displayPreview}
										onCheckedChange={(checked) => setDisplayPreview(!!checked)}
									/>
									<label
										htmlFor="preview"
										className="text-sm font-medium leading-none ml-2"
									>
										Show email preview
									</label>
								</div>

								{displayPreview && selectedTemplate && (
									<div className="mt-4 border rounded-md p-4">
										<h4 className="font-medium text-sm mb-1">Subject:</h4>
										<p className="mb-4">{selectedTemplate.subject}</p>

										<h4 className="font-medium text-sm mb-1">Content:</h4>
										<div
											className="prose max-w-none dark:prose-invert"
											dangerouslySetInnerHTML={{ __html: getEmailPreview() }}
										/>
									</div>
								)}
							</div>

							<div className="flex justify-end">
								<Button
									type="button"
									disabled={
										!selectedTemplate ||
										(selectedUsers.length === 0 &&
											parseManualEmails(manualEmails).length === 0) ||
										isSending
									}
									onClick={() => {
										console.log('DIRECT BUTTON CLICK - Manual form submission');
										const data = form.getValues();
										onSubmit(data);
									}}
								>
									{isSending ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
											Sending...
										</>
									) : (
										<>
											<Send className="mr-2 h-4 w-4" /> Send Email
										</>
									)}
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}

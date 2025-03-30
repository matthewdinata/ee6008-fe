'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, CheckCircle2, Clock, Loader2, Mail, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { scheduleEmail } from '@/utils/actions/email';
import { cn } from '@/utils/cn';
import { useEmailTemplates } from '@/utils/hooks/use-email-templates';
import {
	EmailTemplate,
	RecipientType,
	ScheduleEmailInput,
	scheduleEmailSchema,
} from '@/utils/types/email';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
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
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export function EmailScheduler() {
	const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
	const [selectedUsers, setSelectedUsers] = useState<
		{ id: number; name: string; email: string }[]
	>([]);
	const [manualEmails, setManualEmails] = useState<string>('');
	const [displayPreview, setDisplayPreview] = useState<boolean>(false);
	const [schedulingDate, setSchedulingDate] = useState<Date | undefined>(new Date());
	const [schedulingTime, setSchedulingTime] = useState<string>('12:00');
	const [isScheduling, setIsScheduling] = useState(false);
	const [notification, setNotification] = useState<{
		type: 'success' | 'error' | null;
		title: string;
		message: string;
	}>({ type: null, title: '', message: '' });

	// Fetch data
	const templatesQuery = useEmailTemplates();

	// Form setup
	const form = useForm<ScheduleEmailInput>({
		resolver: zodResolver(scheduleEmailSchema),
		defaultValues: {
			templateId: 0,
			semesterId: 1,
			recipients: 'specific',
			scheduled_date: undefined,
			scheduled_time: undefined,
			description: '',
			email_list: [],
		},
	});

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

	// Handle manual email input changes
	const handleManualEmailChange = (value: string) => {
		setManualEmails(value);
		console.log('Manual emails updated:', value);
		// Update the form's email_list value for the API payload
		const parsedEmails = parseManualEmails(value);
		console.log('Parsed manual emails:', parsedEmails);
	};

	// Handle form submission
	const onSubmit = async (data: ScheduleEmailInput) => {
		// Collect emails from both selected users and manual entry
		const selectedUserEmails = selectedUsers.map((user) => user.email);
		const manualEmailList = parseManualEmails(manualEmails);

		console.log('Selected user emails:', selectedUserEmails);
		console.log('Manual email list:', manualEmailList);

		// Combine all emails and remove duplicates
		const allEmails = Array.from(new Set([...selectedUserEmails, ...manualEmailList]));

		console.log('Combined email list for API:', allEmails);

		if (allEmails.length === 0) {
			setNotification({
				type: 'error',
				title: 'Error',
				message: 'Please select at least one recipient',
			});
			return;
		}

		// Format scheduled date and time
		const scheduledDate = data.scheduled_date; // already in ISO format from date picker
		const scheduledTime = data.scheduled_time; // already in HH:MM:SS format from time picker

		if (!scheduledDate || !scheduledTime) {
			setNotification({
				type: 'error',
				title: 'Error',
				message: 'Please select a date and time',
			});
			return;
		}

		// Create the ISO datetime string by combining date and time
		const [year, month, day] = scheduledDate.split('-');
		const [hours, minutes] = scheduledTime.split(':');
		const scheduledDateTime = new Date(
			parseInt(year),
			parseInt(month) - 1, // JavaScript months are 0-indexed
			parseInt(day),
			parseInt(hours),
			parseInt(minutes)
		).toISOString();

		// Create the payload for the API call with the exact format the backend expects
		const payload: {
			template_id: number;
			semester_id: number;
			recipients: RecipientType;
			email_list: string[];
			scheduled_date: string;
			description: string;
		} = {
			template_id: data.templateId,
			semester_id: data.semesterId || 1,
			recipients: 'specific',
			email_list: allEmails,
			scheduled_date: scheduledDateTime,
			description: data.description || 'Scheduled email',
		};

		console.log('Scheduling email with payload:', payload);

		setIsScheduling(true);

		try {
			const response = await scheduleEmail(payload);
			console.log('Server action response:', response);

			// Debug logging to understand the API response
			console.log('Response success flag:', response.success);
			console.log('Response error:', response.error);
			console.log('Complete response object:', JSON.stringify(response));

			// Create a more detailed success message that includes recipient information
			const recipientCount = allEmails.length;
			let recipientList = '';

			if (recipientCount <= 3) {
				// Show all recipients if 3 or fewer
				recipientList = allEmails.join(', ');
			} else {
				// Show first 2 recipients and count of remaining ones
				recipientList = `${allEmails.slice(0, 2).join(', ')} and ${recipientCount - 2} more`;
			}

			// Format the scheduled date for display
			const formattedDate = new Date(scheduledDateTime).toLocaleString('en-US', {
				weekday: 'short',
				day: 'numeric',
				month: 'short',
				year: 'numeric',
				hour: 'numeric',
				minute: 'numeric',
				hour12: true,
			});

			setNotification({
				type: 'success',
				title: 'Email Scheduled Successfully',
				message: `Email scheduled for ${formattedDate} to ${recipientCount} recipient${recipientCount !== 1 ? 's' : ''}${recipientList ? ': ' + recipientList : ''}`,
			});

			// Reset form
			setSelectedTemplate(null);
			setSelectedUsers([]);
			setManualEmails('');
			form.reset();
		} catch (error) {
			console.error('Error scheduling email:', error);
			setNotification({
				type: 'error',
				title: 'Error',
				message: error instanceof Error ? error.message : 'Failed to schedule email',
			});
		} finally {
			setIsScheduling(false);
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
					<CardTitle>Schedule Email</CardTitle>
					<CardDescription>Schedule emails to be sent at a later time</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
												onChange={(e) =>
													handleManualEmailChange(e.target.value)
												}
											/>
											<p className="text-xs text-muted-foreground mt-1">
												{parseManualEmails(manualEmails).length} valid
												email(s) entered
											</p>
										</div>
									</div>
								</div>

								<div>
									<h3 className="text-sm font-medium mb-3">Schedule</h3>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<FormLabel>Date</FormLabel>
											<Popover>
												<PopoverTrigger asChild>
													<FormControl>
														<Button
															variant="outline"
															className={cn(
																'w-full pl-3 text-left font-normal',
																!schedulingDate &&
																	'text-muted-foreground'
															)}
														>
															{schedulingDate ? (
																format(schedulingDate, 'PPP')
															) : (
																<span>Pick a date</span>
															)}
															<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
														</Button>
													</FormControl>
												</PopoverTrigger>
												<PopoverContent
													className="w-auto p-0"
													align="start"
												>
													<Calendar
														mode="single"
														selected={schedulingDate}
														onSelect={setSchedulingDate}
														disabled={(date) => date < new Date()}
														initialFocus
													/>
												</PopoverContent>
											</Popover>
										</div>

										<div>
											<FormLabel>Time</FormLabel>
											<div className="flex items-center">
												<Input
													type="time"
													value={schedulingTime}
													onChange={(e) =>
														setSchedulingTime(e.target.value)
													}
													className="w-full"
												/>
												<Clock className="ml-2 h-4 w-4 text-muted-foreground" />
											</div>
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

										<div className="mt-4 pt-4 border-t">
											<p className="text-sm text-muted-foreground">
												Scheduled for:{' '}
												{schedulingDate
													? format(schedulingDate, 'PPP')
													: 'Not set'}{' '}
												at {schedulingTime}
											</p>
										</div>
									</div>
								)}
							</div>

							<Button
								type="submit"
								disabled={
									!selectedTemplate ||
									!schedulingDate ||
									(selectedUsers.length === 0 &&
										parseManualEmails(manualEmails).length === 0) ||
									isScheduling
								}
								className="w-full md:w-auto"
								onClick={() => {
									console.log(
										'========= SCHEDULE EMAIL BUTTON CLICKED ========='
									);

									// Get form data
									const data = form.getValues();
									console.log('Current form data:', data);

									// Get manual emails
									const parsedManualEmails = parseManualEmails(manualEmails);
									console.log('Parsed manual emails:', parsedManualEmails);

									// Set the email_list in the form data directly
									form.setValue('email_list', parsedManualEmails);

									// Update the form data to include date and time
									form.setValue(
										'scheduled_date',
										schedulingDate
											? schedulingDate.toISOString().split('T')[0]
											: ''
									);
									form.setValue('scheduled_time', schedulingTime);

									// Log the updated form data
									console.log('Updated form data:', form.getValues());
									console.log('=========================================');

									// Submit the updated form data
									onSubmit(form.getValues());
								}}
							>
								{isScheduling ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Scheduling...
									</>
								) : (
									<>
										<CalendarIcon className="mr-2 h-4 w-4" />
										Schedule Email
									</>
								)}
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}

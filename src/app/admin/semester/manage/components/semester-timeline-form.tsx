'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { updateSemesterTimeline } from '@/utils/actions/admin/semester';
import { useToast } from '@/utils/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Separator } from '@/components/ui/separator';

// Schema for the form
const formSchema = z
	.object({
		semester_id: z.number(),
		// Semester dates
		start_date: z.date({
			required_error: 'Semester start date is required',
		}),
		end_date: z.date({
			required_error: 'Semester end date is required',
		}),
		// Faculty proposal submission
		faculty_proposal_submission_start: z.date({
			required_error: 'Start date is required',
		}),
		faculty_proposal_submission_end: z.date({
			required_error: 'End date is required',
		}),
		// Faculty proposal review
		faculty_proposal_review_start: z.date({
			required_error: 'Start date is required',
		}),
		faculty_proposal_review_end: z.date({
			required_error: 'End date is required',
		}),
		// Student registration
		student_registration_start: z.date({
			required_error: 'Start date is required',
		}),
		student_registration_end: z.date({
			required_error: 'End date is required',
		}),
		// Faculty mark entry
		faculty_mark_entry_start: z.date({
			required_error: 'Start date is required',
		}),
		faculty_mark_entry_end: z.date({
			required_error: 'End date is required',
		}),
		// Student peer review
		student_peer_review_start: z.date({
			required_error: 'Start date is required',
		}),
		student_peer_review_end: z.date({
			required_error: 'End date is required',
		}),
	})
	.refine((data) => data.end_date > data.start_date, {
		message: 'Semester end date must be after start date',
		path: ['end_date'],
	})
	.refine(
		(data) => data.faculty_proposal_submission_end > data.faculty_proposal_submission_start,
		{
			message: 'End date must be after start date',
			path: ['faculty_proposal_submission_end'],
		}
	)
	.refine((data) => data.faculty_proposal_review_end > data.faculty_proposal_review_start, {
		message: 'End date must be after start date',
		path: ['faculty_proposal_review_end'],
	})
	.refine((data) => data.student_registration_end > data.student_registration_start, {
		message: 'End date must be after start date',
		path: ['student_registration_end'],
	})
	.refine((data) => data.faculty_mark_entry_end > data.faculty_mark_entry_start, {
		message: 'End date must be after start date',
		path: ['faculty_mark_entry_end'],
	})
	.refine((data) => data.student_peer_review_end > data.student_peer_review_start, {
		message: 'End date must be after start date',
		path: ['student_peer_review_end'],
	});

interface SemesterTimelineFormProps {
	semesterId: number;
	existingData?: {
		start_date?: Date | null;
		end_date?: Date | null;
		faculty_proposal_submission_start?: Date | null;
		faculty_proposal_submission_end?: Date | null;
		faculty_proposal_review_start?: Date | null;
		faculty_proposal_review_end?: Date | null;
		student_registration_start?: Date | null;
		student_registration_end?: Date | null;
		faculty_mark_entry_start?: Date | null;
		faculty_mark_entry_end?: Date | null;
		student_peer_review_start?: Date | null;
		student_peer_review_end?: Date | null;
	};
	onSuccess?: () => void;
}

export function SemesterTimelineForm({
	semesterId,
	existingData,
	onSuccess,
}: SemesterTimelineFormProps) {
	const router = useRouter();
	const { toast } = useToast();

	// Initialize the form with defaults or existing data
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			semester_id: semesterId,
			// Use existing data or defaults
			start_date: existingData?.start_date || undefined,
			end_date: existingData?.end_date || undefined,
			faculty_proposal_submission_start:
				existingData?.faculty_proposal_submission_start || undefined,
			faculty_proposal_submission_end:
				existingData?.faculty_proposal_submission_end || undefined,
			faculty_proposal_review_start: existingData?.faculty_proposal_review_start || undefined,
			faculty_proposal_review_end: existingData?.faculty_proposal_review_end || undefined,
			student_registration_start: existingData?.student_registration_start || undefined,
			student_registration_end: existingData?.student_registration_end || undefined,
			faculty_mark_entry_start: existingData?.faculty_mark_entry_start || undefined,
			faculty_mark_entry_end: existingData?.faculty_mark_entry_end || undefined,
			student_peer_review_start: existingData?.student_peer_review_start || undefined,
			student_peer_review_end: existingData?.student_peer_review_end || undefined,
		},
	});

	const onSubmit = async (data: z.infer<typeof formSchema>) => {
		try {
			console.log('Raw form data before conversion:', {
				start_date: data.start_date,
				end_date: data.end_date,
				faculty_proposal_submission_start: data.faculty_proposal_submission_start,
				faculty_proposal_submission_end: data.faculty_proposal_submission_end,
				faculty_proposal_review_start: data.faculty_proposal_review_start,
				faculty_proposal_review_end: data.faculty_proposal_review_end,
				student_registration_start: data.student_registration_start,
				student_registration_end: data.student_registration_end,
				faculty_mark_entry_start: data.faculty_mark_entry_start,
				faculty_mark_entry_end: data.faculty_mark_entry_end,
				student_peer_review_start: data.student_peer_review_start,
				student_peer_review_end: data.student_peer_review_end,
			});

			// Convert dates to ISO strings for API
			const timelineData = {
				...data,
				start_date: data.start_date?.toISOString(),
				end_date: data.end_date?.toISOString(),
				faculty_proposal_submission_start:
					data.faculty_proposal_submission_start?.toISOString(),
				faculty_proposal_submission_end:
					data.faculty_proposal_submission_end?.toISOString(),
				faculty_proposal_review_start: data.faculty_proposal_review_start?.toISOString(),
				faculty_proposal_review_end: data.faculty_proposal_review_end?.toISOString(),
				student_registration_start: data.student_registration_start?.toISOString(),
				student_registration_end: data.student_registration_end?.toISOString(),
				faculty_mark_entry_start: data.faculty_mark_entry_start?.toISOString(),
				faculty_mark_entry_end: data.faculty_mark_entry_end?.toISOString(),
				student_peer_review_start: data.student_peer_review_start?.toISOString(),
				student_peer_review_end: data.student_peer_review_end?.toISOString(),
			};

			console.log('Converted timeline data with ISO strings:', timelineData);
			console.log('Submitting timeline data:', timelineData);

			// Call API to update semester timeline
			const response = await updateSemesterTimeline(timelineData);

			if (response.success === false) {
				throw new Error(response.error || 'Failed to update timeline');
			}

			// Show success toast with high visibility
			toast({
				title: 'TIMELINE UPDATED SUCCESSFULLY!',
				description: 'All timeline events have been saved',
				variant: 'default',
			});

			// First call the onSuccess callback if provided
			if (onSuccess) {
				onSuccess();
			}

			// Update URL to show timeline tab without full navigation
			if (typeof window !== 'undefined') {
				const url = new URL(window.location.href);
				url.searchParams.set('tab', 'timeline');
				window.history.pushState({}, '', url.toString());

				// Dispatch a custom event to notify the parent component to change tabs
				window.dispatchEvent(new CustomEvent('tabChange', { detail: { tab: 'timeline' } }));
			}

			// Refresh the router data without navigation
			router.refresh();
		} catch (error) {
			console.error('Error updating timeline:', error);
			toast({
				title: 'Error',
				description: error instanceof Error ? error.message : 'An error occurred',
				variant: 'destructive',
			});
		}
	};

	// Helper component for date fields with time input
	const DateTimeField = ({
		name,
		label,
		description,
	}: {
		name: keyof z.infer<typeof formSchema>;
		label: string;
		description?: string;
	}) => {
		const [localValues, setLocalValues] = useState({
			year: '',
			month: '',
			day: '',
			hours: '',
			minutes: '',
		});

		useEffect(() => {
			const fieldValue = form.getValues(name);
			if (fieldValue instanceof Date) {
				setLocalValues({
					year: fieldValue.getFullYear().toString(),
					month: (fieldValue.getMonth() + 1).toString(),
					day: fieldValue.getDate().toString(),
					hours: fieldValue.getHours().toString(),
					minutes: fieldValue.getMinutes().toString(),
				});
			} else {
				// Reset to empty if field.value is null
				setLocalValues({
					year: '',
					month: '',
					day: '',
					hours: '',
					minutes: '',
				});
			}
		}, [name]);

		// Update a single value in the local state
		const updateLocalValue = (key: keyof typeof localValues, value: string) => {
			setLocalValues((prev) => ({ ...prev, [key]: value }));
		};

		// Create a date from local values and update the field
		const updateFieldValue = () => {
			// Check if we have the minimum required values (year, month, day)
			if (localValues.year && localValues.month && localValues.day) {
				const year = parseInt(localValues.year);
				const month = parseInt(localValues.month) - 1; // Convert to 0-indexed
				const day = parseInt(localValues.day);
				const hours = localValues.hours ? parseInt(localValues.hours) : 0;
				const minutes = localValues.minutes ? parseInt(localValues.minutes) : 0;

				// Create a new date and update the field
				const newDate = new Date(year, month, day, hours, minutes);
				if (!isNaN(newDate.getTime())) {
					form.setValue(name, newDate);
				}
			} else if (!localValues.year && !localValues.month && !localValues.day) {
				// If all main fields are empty, set the field value to null
				form.setValue(name, new Date(0)); // Use epoch time instead of null
			}
		};

		// Handle calendar selection
		const handleCalendarSelect = (date: Date | undefined) => {
			if (date) {
				// Create a new date with the time from the existing date or default to noon
				const newDate = new Date(date);
				const fieldValue = form.getValues(name);
				if (fieldValue instanceof Date) {
					newDate.setHours(
						fieldValue.getHours(),
						fieldValue.getMinutes(),
						fieldValue.getSeconds()
					);
				} else {
					newDate.setHours(12, 0, 0);
				}

				// Update the field value
				form.setValue(name, newDate);
			}
		};

		return (
			<FormField
				control={form.control}
				name={name}
				render={({ field }) => (
					<FormItem className="flex flex-col">
						<FormLabel>{label}</FormLabel>
						<div className="space-y-3">
							{/* Calendar picker */}
							<div>
								<Popover>
									<PopoverTrigger asChild>
										<FormControl>
											<Button
												variant="outline"
												className={`w-full justify-start text-left font-normal ${
													!field.value ? 'text-muted-foreground' : ''
												}`}
											>
												<CalendarIcon className="mr-2 h-4 w-4" />
												{field.value ? (
													format(field.value, 'PPP')
												) : (
													<span>Pick a date</span>
												)}
											</Button>
										</FormControl>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0" align="start">
										<Calendar
											mode="single"
											selected={
												field.value instanceof Date
													? field.value
													: undefined
											}
											onSelect={handleCalendarSelect}
											disabled={(date) => date < new Date('1900-01-01')}
											initialFocus
										/>
									</PopoverContent>
								</Popover>
							</div>

							{/* Separated date inputs - year, month, day */}
							<div className="grid grid-cols-3 gap-2">
								<div>
									<FormLabel className="text-xs">Year</FormLabel>
									<Input
										type="text"
										value={localValues.year}
										onChange={(e) => {
											updateLocalValue('year', e.target.value);
										}}
										onBlur={updateFieldValue}
										className="mt-1"
									/>
								</div>
								<div>
									<FormLabel className="text-xs">Month</FormLabel>
									<select
										value={localValues.month}
										onChange={(e) => {
											updateLocalValue('month', e.target.value);
											updateFieldValue();
										}}
										className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
									>
										<option value="">Select month</option>
										{Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
											<option key={m} value={m.toString()}>
												{new Date(2000, m - 1, 1).toLocaleString(
													'default',
													{ month: 'long' }
												)}
											</option>
										))}
									</select>
								</div>
								<div>
									<FormLabel className="text-xs">Day</FormLabel>
									<Input
										type="text"
										value={localValues.day}
										onChange={(e) => {
											updateLocalValue('day', e.target.value);
										}}
										onBlur={updateFieldValue}
										className="mt-1"
									/>
								</div>
							</div>

							{/* Time input */}
							<div className="grid grid-cols-2 gap-2">
								<div>
									<FormLabel className="text-xs">Hour (24h)</FormLabel>
									<Input
										type="text"
										value={localValues.hours}
										onChange={(e) => {
											updateLocalValue('hours', e.target.value);
										}}
										onBlur={updateFieldValue}
										className="mt-1"
									/>
								</div>
								<div>
									<FormLabel className="text-xs">Minute</FormLabel>
									<Input
										type="text"
										value={localValues.minutes}
										onChange={(e) => {
											updateLocalValue('minutes', e.target.value);
										}}
										onBlur={updateFieldValue}
										className="mt-1"
									/>
								</div>
							</div>

							{/* Display the complete date and time for reference */}
							<div className="text-sm text-muted-foreground pt-1">
								Current value:{' '}
								{field.value instanceof Date
									? format(field.value, 'PPP p')
									: 'No date selected'}
							</div>
						</div>
						{description && <FormDescription>{description}</FormDescription>}
						<FormMessage />
					</FormItem>
				)}
			/>
		);
	};

	// Date range field group
	const DateRangeFields = ({
		startName,
		endName,
		title,
		description,
	}: {
		startName: keyof z.infer<typeof formSchema>;
		endName: keyof z.infer<typeof formSchema>;
		title: string;
		description?: string;
	}) => (
		<div className="space-y-4">
			<div>
				<h3 className="text-lg font-medium">{title}</h3>
				{description && <p className="text-sm text-muted-foreground">{description}</p>}
			</div>
			<div className="grid gap-4 sm:grid-cols-2">
				<DateTimeField name={startName} label="Start Date & Time" />
				<DateTimeField name={endName} label="End Date & Time" />
			</div>
		</div>
	);

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>Semester Timeline</CardTitle>
				<CardDescription>
					Set up important dates for this semester. All dates must be within the semester
					period.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						{/* Semester period - separated as requested */}
						<div className="rounded-lg border p-4 bg-muted/20">
							<DateRangeFields
								startName="start_date"
								endName="end_date"
								title="Semester Period"
								description="Define the overall start and end dates for this semester"
							/>
						</div>

						<Separator className="my-6" />

						{/* Other date ranges - grouped together */}
						<div className="space-y-6">
							<h2 className="text-xl font-semibold">Activity Periods</h2>
							<p className="text-sm text-muted-foreground">
								Define the time periods for various activities during the semester
							</p>

							{/* Faculty proposal submission */}
							<DateRangeFields
								startName="faculty_proposal_submission_start"
								endName="faculty_proposal_submission_end"
								title="Faculty Proposal Submission"
								description="Period when faculty can submit project proposals"
							/>

							<Separator className="my-4" />

							{/* Faculty proposal review */}
							<DateRangeFields
								startName="faculty_proposal_review_start"
								endName="faculty_proposal_review_end"
								title="Faculty Proposal Review"
								description="Period when proposals are reviewed"
							/>

							<Separator className="my-4" />

							{/* Student registration */}
							<DateRangeFields
								startName="student_registration_start"
								endName="student_registration_end"
								title="Student Registration"
								description="Period when students can register for projects"
							/>

							<Separator className="my-4" />

							{/* Faculty mark entry */}
							<DateRangeFields
								startName="faculty_mark_entry_start"
								endName="faculty_mark_entry_end"
								title="Faculty Mark Entry"
								description="Period when faculty can enter marks for students"
							/>

							<Separator className="my-4" />

							{/* Student peer review */}
							<DateRangeFields
								startName="student_peer_review_start"
								endName="student_peer_review_end"
								title="Student Peer Review"
								description="Period when students can review their peers"
							/>
						</div>

						<div className="pt-4">
							<Button type="submit" className="w-full sm:w-auto">
								Update Timeline
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}

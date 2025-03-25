'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format, isValid } from 'date-fns';
import { CalendarOff, Plus } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { cn } from '@/lib/utils';
import { createTimeline, updateTimeline } from '@/utils/actions/admin/semester';
import { TimelineEvent } from '@/utils/actions/admin/types';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';

// Form schema
const formSchema = z
	.object({
		name: z.string().min(2, {
			message: 'Name must be at least 2 characters.',
		}),
		start_date: z
			.date({
				required_error: 'A start date is required.',
				invalid_type_error: 'Start date must be valid',
			})
			.refine(
				(date) => {
					// Ensure the date is not too old (not before 2000)
					return date.getFullYear() >= 2000;
				},
				{
					message: 'Date must be after year 2000',
				}
			),
		end_date: z
			.date({
				required_error: 'An end date is required.',
				invalid_type_error: 'End date must be valid',
			})
			.refine(
				(date) => {
					// Ensure the date is not too old (not before 2000)
					return date.getFullYear() >= 2000;
				},
				{
					message: 'Date must be after year 2000',
				}
			),
		description: z.string().optional(),
	})
	.refine((data) => data.end_date >= data.start_date, {
		message: 'End date must be after start date',
		path: ['end_date'],
	});

type FormValues = z.infer<typeof formSchema>;

interface TimelineEditorProps {
	semesterId: number;
	events: TimelineEvent[];
	onUpdate: (timeline: TimelineEvent[]) => void;
	isCreating: boolean;
	onCreateCancel: () => void;
	onCreateSuccess: (event: TimelineEvent) => void;
}

export function TimelineEditor({
	semesterId,
	events,
	onUpdate,
	isCreating,
	onCreateCancel,
	onCreateSuccess,
}: TimelineEditorProps) {
	const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: '',
			description: '',
			start_date: new Date(),
			end_date: new Date(),
		},
	});

	// Helper function to ensure we never display invalid dates
	const isValidDate = (date: Date | null | undefined) => {
		if (!date) return false;
		return !isNaN(date.getTime()) && date.getFullYear() > 1971;
	};

	// Get a safe default date for today
	const getSafeDate = useCallback(() => {
		const now = new Date();
		return now;
	}, []);

	// Get a safe end date (1 week later)
	const getSafeEndDate = useCallback(
		(startDate?: Date) => {
			const baseDate = startDate && isValidDate(startDate) ? startDate : getSafeDate();
			const endDate = new Date(baseDate);
			endDate.setDate(endDate.getDate() + 7);
			return endDate;
		},
		[getSafeDate]
	);

	// Add a utility function to safely format dates
	const safeFormatDate = (dateString: string | Date | null | undefined) => {
		if (!dateString) return 'Not scheduled';

		try {
			// Handle both string and Date objects
			const date = typeof dateString === 'string' ? new Date(dateString) : dateString;

			// Verify it's a valid date before formatting
			return isValid(date) ? format(date, 'PPP') : 'Not scheduled';
		} catch (error) {
			console.error('Error formatting date:', dateString, error);
			return 'Not scheduled';
		}
	};

	useEffect(() => {
		if (selectedEvent) {
			// Check for default dates in the API response
			const isStartDateDefault =
				typeof selectedEvent.start_date === 'string' &&
				(selectedEvent.start_date.startsWith('0001-01-01') ||
					selectedEvent.start_date === '');

			const isEndDateDefault =
				typeof selectedEvent.end_date === 'string' &&
				(selectedEvent.end_date.startsWith('0001-01-01') || selectedEvent.end_date === '');

			// Create a current date to use for defaults
			const currentDate = getSafeDate();
			const oneWeekLater = getSafeEndDate();

			form.reset({
				name: selectedEvent.name,
				description: selectedEvent.description || '',
				start_date: isStartDateDefault
					? currentDate
					: selectedEvent.start_date instanceof Date
						? selectedEvent.start_date
						: new Date(selectedEvent.start_date || ''),
				end_date: isEndDateDefault
					? oneWeekLater
					: selectedEvent.end_date instanceof Date
						? selectedEvent.end_date
						: new Date(selectedEvent.end_date || ''),
			});
		} else if (isCreating) {
			// Initialize with current date for new events
			const currentDate = getSafeDate();
			const oneWeekLater = getSafeEndDate();

			form.reset({
				name: '',
				description: '',
				start_date: currentDate,
				end_date: oneWeekLater,
			});
		}
	}, [selectedEvent, isCreating, form, getSafeDate, getSafeEndDate]);

	useEffect(() => {
		if (events && events.length > 0) {
			console.log('Timeline events:', events);
			events.forEach((event, index) => {
				console.log(`Event ${index} - ${event.name}:`);
				console.log('  start_date:', event.start_date);
				console.log('  end_date:', event.end_date);
				console.log('  start_date valid?', isValidDate(new Date(event.start_date || '')));
				console.log('  end_date valid?', isValidDate(new Date(event.end_date || '')));
			});
		}
	}, [events]);

	// Add diagnostic logging to understand date handling
	useEffect(() => {
		console.log('Timeline events:', events);
		if (events && events.length > 0) {
			// Examine the first event to understand the data structure
			const firstEvent = events[0];
			console.log('First event:', firstEvent);
			console.log('First event start date type:', typeof firstEvent.start_date);
			console.log('First event end date type:', typeof firstEvent.end_date);

			// If they're strings, check if they're valid ISO strings
			if (typeof firstEvent.start_date === 'string') {
				console.log('Parsing date string:', firstEvent.start_date);
				const parsedDate = new Date(firstEvent.start_date);
				console.log('Parsed result:', parsedDate);
				console.log('Is valid?', !isNaN(parsedDate.getTime()));
			}
		}
	}, [events]);

	const onSubmit = async (data: FormValues) => {
		try {
			setIsSubmitting(true);
			setError(null);

			// Validate dates before submission
			const validStartDate =
				data.start_date && isValidDate(data.start_date) ? data.start_date : getSafeDate();

			const validEndDate =
				data.end_date && isValidDate(data.end_date)
					? data.end_date
					: getSafeEndDate(validStartDate);

			if (selectedEvent) {
				// Update existing timeline event
				const response = await updateTimeline({
					id: selectedEvent.id,
					semester_id: semesterId,
					name: data.name,
					description: data.description || '',
					start_date: validStartDate,
					end_date: validEndDate,
				});

				if (!response.success) {
					throw new Error(response.error || 'Failed to update timeline event');
				}

				// Update the events list
				const updatedEvents = events
					.map((event) => (event.id === selectedEvent.id ? response.data : event))
					.filter((event): event is TimelineEvent => event !== undefined);

				onUpdate(updatedEvents);
				setSelectedEvent(null);
			} else {
				// Create new timeline event
				const response = await createTimeline({
					semester_id: semesterId,
					name: data.name,
					description: data.description || '',
					start_date: validStartDate,
					end_date: validEndDate,
				});

				if (!response.success) {
					throw new Error(response.error || 'Failed to create timeline event');
				}

				if (response.data) {
					onCreateSuccess(response.data);
				} else {
					throw new Error('No data returned from create timeline operation');
				}
			}

			form.reset();
		} catch (error) {
			console.error('Error saving timeline event:', error);
			setError(error instanceof Error ? error.message : 'An unexpected error occurred');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCancel = () => {
		form.reset();
		if (selectedEvent) {
			setSelectedEvent(null);
		} else {
			onCreateCancel();
		}
	};

	return (
		<div className="space-y-4">
			{(isCreating || selectedEvent) && (
				<Card>
					<CardHeader>
						<CardTitle>
							{selectedEvent ? 'Edit Timeline Event' : 'Add New Timeline Event'}
						</CardTitle>
						<CardDescription>Define a timeline event for this semester</CardDescription>
					</CardHeader>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)}>
							<CardContent className="space-y-4">
								{error && (
									<div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
										{error}
									</div>
								)}

								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Event Name</FormLabel>
											<FormControl>
												<Input
													placeholder="e.g., Project Proposal Submission"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="start_date"
										render={({ field }) => (
											<FormItem className="flex flex-col">
												<FormLabel>Start Date</FormLabel>
												<Popover>
													<PopoverTrigger asChild>
														<FormControl>
															<Button
																variant={'outline'}
																className={cn(
																	'w-full pl-3 text-left font-normal',
																	!field.value &&
																		'text-muted-foreground'
																)}
															>
																{field.value &&
																isValidDate(field.value) ? (
																	format(field.value, 'PPP')
																) : (
																	<span>Select date</span>
																)}
															</Button>
														</FormControl>
													</PopoverTrigger>
													<PopoverContent
														className="w-auto p-0"
														align="start"
													>
														<Calendar
															mode="single"
															selected={
																field.value &&
																isValidDate(field.value)
																	? field.value
																	: undefined
															}
															defaultMonth={
																field.value &&
																isValidDate(field.value)
																	? field.value
																	: getSafeDate()
															}
															onSelect={(date) => {
																// Ensure we always have a valid date
																const validDate =
																	date || getSafeDate();
																field.onChange(validDate);
															}}
															initialFocus
															disabled={(date) =>
																date < new Date('2000-01-01')
															}
														/>
													</PopoverContent>
												</Popover>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="end_date"
										render={({ field }) => (
											<FormItem className="flex flex-col">
												<FormLabel>End Date</FormLabel>
												<Popover>
													<PopoverTrigger asChild>
														<FormControl>
															<Button
																variant={'outline'}
																className={cn(
																	'w-full pl-3 text-left font-normal',
																	!field.value &&
																		'text-muted-foreground'
																)}
															>
																{field.value &&
																isValidDate(field.value) ? (
																	format(field.value, 'PPP')
																) : (
																	<span>Select date</span>
																)}
															</Button>
														</FormControl>
													</PopoverTrigger>
													<PopoverContent
														className="w-auto p-0"
														align="start"
													>
														<Calendar
															mode="single"
															selected={
																field.value &&
																isValidDate(field.value)
																	? field.value
																	: undefined
															}
															defaultMonth={
																field.value &&
																isValidDate(field.value)
																	? field.value
																	: getSafeEndDate()
															}
															onSelect={(date) => {
																// Ensure we always have a valid date
																const validDate =
																	date || getSafeEndDate();
																field.onChange(validDate);
															}}
															initialFocus
															disabled={(date) =>
																date < new Date('2000-01-01')
															}
														/>
													</PopoverContent>
												</Popover>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<FormField
									control={form.control}
									name="description"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Description</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Provide details about this timeline event"
													className="min-h-[100px]"
													{...field}
												/>
											</FormControl>
											<FormDescription>
												Optional description for this event
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							</CardContent>
							<CardFooter className="flex justify-between">
								<Button type="button" variant="outline" onClick={handleCancel}>
									Cancel
								</Button>
								<Button type="submit" disabled={isSubmitting}>
									{isSubmitting
										? 'Saving...'
										: selectedEvent
											? 'Update Event'
											: 'Create Event'}
								</Button>
							</CardFooter>
						</form>
					</Form>
				</Card>
			)}

			{!isCreating && events.length > 0 && (
				<div className="space-y-3">
					{events.map((event) => (
						<Card
							key={event.id}
							className={cn(
								'cursor-pointer hover:bg-muted/50 transition-colors',
								selectedEvent?.id === event.id ? 'border-primary' : ''
							)}
							onClick={() => setSelectedEvent(event)}
						>
							<CardHeader className="pb-2">
								<CardTitle className="text-lg">{event.name}</CardTitle>
								<CardDescription>
									{event.is_scheduled ? (
										<>
											{safeFormatDate(event.start_date)} -{' '}
											{safeFormatDate(event.end_date)}
										</>
									) : (
										<span className="text-yellow-600 dark:text-yellow-400">
											<CalendarOff className="h-4 w-4 inline mr-1" />
											Not scheduled
										</span>
									)}
								</CardDescription>
							</CardHeader>
							{event.description && (
								<CardContent>
									<p className="text-sm">{event.description}</p>
								</CardContent>
							)}
						</Card>
					))}
				</div>
			)}

			{!isCreating && events.length === 0 && !selectedEvent && (
				<Card className="bg-muted/50">
					<CardContent className="flex flex-col items-center justify-center p-6">
						<p className="text-muted-foreground mb-2">
							No timeline events defined for this semester
						</p>
						<Button size="sm" onClick={() => onCreateCancel()}>
							<Plus className="mr-2 h-4 w-4" /> Add Event
						</Button>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

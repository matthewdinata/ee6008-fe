/* eslint-disable prettier/prettier, import/extensions */
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Semester } from '@/utils/actions/admin/types';
import { CreateVenueData, Venue, createVenue } from '@/utils/actions/admin/venue';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

/* eslint-disable prettier/prettier, import/extensions */

/* eslint-disable prettier/prettier, import/extensions */

/* eslint-disable prettier/prettier, import/extensions */

/* eslint-disable prettier/prettier, import/extensions */

/* eslint-disable prettier/prettier, import/extensions */

/* eslint-disable prettier/prettier, import/extensions */

interface VenueAddDialogProps {
	semesters: Semester[];
	defaultSemesterId?: number;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onVenueCreated: (venue: Venue) => void;
}

// Define the form validation schema
const venueFormSchema = z.object({
	name: z.string().min(2, {
		message: 'Venue name must be at least 2 characters.',
	}),
	location: z.string().min(2, {
		message: 'Location must be at least 2 characters.',
	}),
	semesterId: z.coerce.number().int().positive({
		message: 'Please select a semester.',
	}),
});

type VenueFormValues = z.infer<typeof venueFormSchema>;

export function VenueAddDialog({
	semesters,
	defaultSemesterId,
	open,
	onOpenChange,
	onVenueCreated,
}: VenueAddDialogProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Initialize the form with default values
	const form = useForm<VenueFormValues>({
		resolver: zodResolver(venueFormSchema),
		defaultValues: {
			name: '',
			location: '',
			semesterId: defaultSemesterId || semesters[0]?.id || 0,
		},
	});

	const onSubmit = async (data: VenueFormValues) => {
		try {
			setIsSubmitting(true);
			setError(null);

			const venueData: CreateVenueData = {
				name: data.name,
				location: data.location,
				semesterId: data.semesterId,
			};

			const response = await createVenue(venueData);

			if (!response.success) {
				setError(response.error || 'Failed to create venue');
				return;
			}

			// Call the success callback with the created venue
			onVenueCreated(response.data);

			// Reset form and close dialog
			form.reset();
			onOpenChange(false);
		} catch (err) {
			console.error('Error creating venue:', err);
			setError('An unexpected error occurred');
		} finally {
			setIsSubmitting(false);
		}
	};

	// Helper function to format semester display
	const formatSemesterDisplay = (semester: Semester): string => {
		const activeStatus = semester.isActive ? ' (Active)' : '';
		return `AY ${semester.academicYear} - ${semester.name}${activeStatus}`;
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Add New Venue</DialogTitle>
					<DialogDescription>
						Create a new venue for scheduling classes and exams.
					</DialogDescription>
				</DialogHeader>

				{error && (
					<div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md text-sm">
						{error}
					</div>
				)}

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Venue Name</FormLabel>
									<FormControl>
										<Input placeholder="e.g., LT1, TR+01" {...field} />
									</FormControl>
									<FormDescription>
										Enter the name or number of the venue.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="location"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Location</FormLabel>
									<FormControl>
										<Input
											placeholder="e.g., North Spine, South Spine"
											{...field}
										/>
									</FormControl>
									<FormDescription>
										Enter the building or area where the venue is located.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="semesterId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Semester</FormLabel>
									<Select
										onValueChange={(value) => field.onChange(parseInt(value))}
										defaultValue={field.value.toString() || undefined}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select a semester" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{semesters.map((semester) => (
												<SelectItem
													key={semester.id}
													value={semester.id.toString()}
												>
													{formatSemesterDisplay(semester)}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormDescription>
										Select the semester this venue is associated with.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? 'Creating...' : 'Create Venue'}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

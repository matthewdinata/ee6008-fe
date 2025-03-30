/* eslint-disable prettier/prettier, import/extensions */

/* eslint-disable import/extensions */
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Semester } from '@/utils/actions/admin/types';
import { Venue, updateVenue } from '@/utils/actions/admin/venue';

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

export interface VenueEditDialogProps {
	venue: Venue;
	semesters: Semester[];
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onVenueUpdated: (venue: Venue) => void;
}

const venueFormSchema = z.object({
	name: z.string().min(2, {
		message: 'Venue name must be at least 2 characters.',
	}),
	location: z.string().min(2, {
		message: 'Location must be at least 2 characters.',
	}),
	semester_id: z.coerce.number().int().positive({
		message: 'Please select a semester.',
	}),
});

type VenueFormValues = z.infer<typeof venueFormSchema>;

export function VenueEditDialog({
	venue,
	semesters,
	open,
	onOpenChange,
	onVenueUpdated,
}: VenueEditDialogProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Initialize the form with the venue data

	const form = useForm<VenueFormValues>({
		resolver: zodResolver(venueFormSchema),
		defaultValues: {
			name: venue.name,
			location: venue.location,
			semester_id: venue.semesterId,
		},
	});

	// Helper function to format semester display
	const formatSemesterDisplay = (semester: Semester): string => {
		const activeStatus = semester.isActive ? ' (Active)' : '';
		return `AY ${semester.academicYear} - ${semester.name}${activeStatus}`;
	};

	const onSubmit = async (data: VenueFormValues) => {
		try {
			setIsSubmitting(true);
			setError(null);

			const response = await updateVenue(venue.id, data);

			if (!response.success) {
				setError(response.error || 'Failed to update venue');
				return;
			}

			// Call the success callback with the updated venue
			onVenueUpdated(response.data);
			// Close the dialog
			onOpenChange(false);
		} catch (error) {
			console.error('Error updating venue:', error);
			setError(error instanceof Error ? error.message : 'An unexpected error occurred');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Edit Venue</DialogTitle>
					<DialogDescription>Make changes to the venue details below.</DialogDescription>
				</DialogHeader>

				{error && (
					<div className="rounded-md bg-destructive/15 p-3 text-destructive">
						<p>{error}</p>
					</div>
				)}

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Venue Name</FormLabel>
									<FormControl>
										<Input placeholder="e.g., Lecture Theatre 1" {...field} />
									</FormControl>
									<FormDescription>The name of the venue.</FormDescription>
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
										<Input placeholder="e.g., Block N1, Level 2" {...field} />
									</FormControl>
									<FormDescription>
										The physical location of the venue.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="semester_id"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Semester</FormLabel>
									<Select
										onValueChange={(value) =>
											field.onChange(parseInt(value, 10))
										}
										defaultValue={field.value.toString()}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select semester" />
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
										The semester this venue is associated with.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button
								type="button"
								variant="secondary"
								onClick={() => onOpenChange(false)}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? 'Saving...' : 'Save Changes'}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

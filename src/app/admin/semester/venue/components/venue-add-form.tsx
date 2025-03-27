'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Semester } from '@/utils/actions/admin/types';
import { CreateVenueData, Venue, createVenue } from '@/utils/actions/admin/venue';
import { useGetSemesters } from '@/utils/hooks/admin/use-get-semesters';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
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

// Define props for the VenueAddForm component
interface VenueAddFormProps {
	semesters?: Semester[];
	defaultSemesterId?: number;
	onVenueCreated?: (venue: Venue) => void;
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

// Helper function to format semester display
const formatSemesterDisplay = (semester: Semester): string => {
	const activeStatus = semester.isActive ? ' (Active)' : '';
	return `AY ${semester.academicYear} - ${semester.name}${activeStatus}`;
};

export function VenueAddForm({
	semesters: propSemesters,
	defaultSemesterId: propDefaultSemesterId,
	onVenueCreated,
}: VenueAddFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	// Fetch semesters if not provided via props
	const { data: fetchedSemesters = [] } = useGetSemesters();
	const semesters = propSemesters && propSemesters.length > 0 ? propSemesters : fetchedSemesters;

	// Find active semester if available
	const activeSemester = semesters.find((sem) => sem.isActive);
	const defaultSemesterId = propDefaultSemesterId || activeSemester?.id || semesters[0]?.id || 0;

	// Initialize the form with default values
	const form = useForm<VenueFormValues>({
		resolver: zodResolver(venueFormSchema),
		defaultValues: {
			name: '',
			location: '',
			semesterId: defaultSemesterId,
		},
	});

	const onSubmit = async (data: VenueFormValues) => {
		try {
			setIsSubmitting(true);
			setErrorMessage(null);
			setSuccessMessage(null);

			const venueData: CreateVenueData = {
				name: data.name,
				location: data.location,
				semesterId: data.semesterId,
			};

			const response = await createVenue(venueData);

			if (!response.success) {
				setErrorMessage(response.error || 'Failed to create venue');
				return;
			}

			// Show success message
			setSuccessMessage(`Venue "${response.data.name}" created successfully`);

			// Call the success callback with the created venue if provided
			if (onVenueCreated) {
				onVenueCreated(response.data);
			}

			// Reset form fields but keep the semester
			form.reset({
				name: '',
				location: '',
				semesterId: data.semesterId,
			});
		} catch (err) {
			console.error('Error creating venue:', err);
			setErrorMessage('An unexpected error occurred');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div>
			<h2 className="text-xl font-semibold mb-2">Add Single Venue</h2>
			<p className="text-sm text-muted-foreground mb-4">
				Create a new venue for scheduling classes and exams
			</p>

			{successMessage && (
				<Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
					<AlertDescription className="flex items-center gap-2">
						<CheckCircle2 className="h-4 w-4 text-green-500" />
						{successMessage}
					</AlertDescription>
				</Alert>
			)}

			{errorMessage && (
				<Alert className="mb-4 bg-red-50 text-red-800 border-red-200">
					<AlertDescription className="flex items-center gap-2">
						<XCircle className="h-4 w-4 text-red-500" />
						{errorMessage}
					</AlertDescription>
				</Alert>
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
									<Input placeholder="e.g., LT1, TR+01" {...field} />
								</FormControl>
								<FormDescription className="text-xs">
									Enter the name or number of the venue
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
								<FormDescription className="text-xs">
									Enter the building or area where the venue is located
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
									defaultValue={field.value?.toString()}
									value={field.value?.toString()}
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
								<FormDescription className="text-xs">
									Select the semester this venue is associated with
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Button
						type="submit"
						className="w-full"
						disabled={isSubmitting || semesters.length === 0}
					>
						{isSubmitting ? 'Creating...' : 'Create Venue'}
					</Button>
				</form>
			</Form>
		</div>
	);
}

/* eslint-disable prettier/prettier, import/extensions */
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { UpdateFacultyData, User, updateFaculty } from '@/utils/actions/admin/user';
import { useToast } from '@/utils/hooks/use-toast';

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
import { Switch } from '@/components/ui/switch';

export interface FacultyEditDialogProps {
	faculty: User;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onFacultyUpdated: () => void;
}

const facultyEditFormSchema = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters'),
	email: z
		.string()
		.email('Please enter a valid email')
		.refine((email) => email.endsWith('@e.ntu.edu.sg'), {
			message: 'Email must end with @e.ntu.edu.sg',
		}),
	isCourseCoordinator: z.boolean().default(false),
});

type FacultyEditFormValues = z.infer<typeof facultyEditFormSchema>;

export function FacultyRoleEditDialog({
	faculty,
	open,
	onOpenChange,
	onFacultyUpdated,
}: FacultyEditDialogProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { toast } = useToast();

	// Initialize the form with the faculty data
	const form = useForm<FacultyEditFormValues>({
		resolver: zodResolver(facultyEditFormSchema),
		defaultValues: {
			name: faculty.name || '',
			email: faculty.email || '',
			isCourseCoordinator:
				faculty.isCourseCoordinator || faculty.is_course_coordinator || false,
		},
	});

	const onSubmit = async (data: FacultyEditFormValues) => {
		try {
			setIsSubmitting(true);
			setError(null);

			const professorId = faculty.userId || faculty.id;

			// Prepare update data
			const updateData: UpdateFacultyData = {
				name: data.name,
				email: data.email,
				isCourseCoordinator: data.isCourseCoordinator,
			};

			const result = await updateFaculty(professorId, updateData);

			if (!result.success) {
				setError(result.error || 'Failed to update faculty information');
				return;
			}

			// Show success toast
			toast({
				title: 'Success',
				description: `Faculty information updated successfully.`,
			});

			// Log for debugging
			console.log('Faculty role updated successfully:', {
				updatedFaculty: result.data,
				isCourseCoordinator:
					result.data.isCourseCoordinator || result.data.is_course_coordinator,
			});

			// Add a small delay before triggering the UI refresh to ensure the backend has processed the change
			setTimeout(() => {
				// Call the success callback to refresh data
				onFacultyUpdated();
				// Close the dialog
				onOpenChange(false);
			}, 500);
		} catch (error) {
			console.error('Error updating faculty role:', error);
			setError(error instanceof Error ? error.message : 'An unexpected error occurred');

			toast({
				variant: 'destructive',
				title: 'Error',
				description: 'Failed to update coordinator status',
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Edit Faculty Information</DialogTitle>
					<DialogDescription>Update information for {faculty.name}.</DialogDescription>
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
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input placeholder="Faculty member name" {...field} />
									</FormControl>
									<FormDescription>
										Full name of the faculty member.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input placeholder="faculty@e.ntu.edu.sg" {...field} />
									</FormControl>
									<FormDescription>
										Must be a valid NTU email ending with @e.ntu.edu.sg.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="isCourseCoordinator"
							render={({ field }) => (
								<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
									<div className="space-y-0.5">
										<FormLabel htmlFor="isCourseCoordinator">
											Course Coordinator
										</FormLabel>
										<FormDescription>
											Assign course coordinator permissions to this faculty
											member.
										</FormDescription>
									</div>
									<FormControl>
										<Switch
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
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

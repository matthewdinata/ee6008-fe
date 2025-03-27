'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { createProgramme } from '@/utils/actions/admin/semester';
import { Programme } from '@/utils/actions/admin/types';

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
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// Form schema
const formSchema = z.object({
	name: z.string().min(2, {
		message: 'Programme name must be at least 2 characters.',
	}),
	programme_code: z.string().min(2, {
		message: 'Programme code must be at least 2 characters.',
	}),
	description: z.string().min(2, {
		message: 'Description must be at least 2 characters.',
	}),
	semester_id: z.number(),
});

type ProgrammeFormValues = z.infer<typeof formSchema>;

interface CreateProgrammeDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess: (programme: Programme) => void;
	semesterId: number;
}

export function CreateProgrammeDialog({
	open,
	onOpenChange,
	onSuccess,
	semesterId,
}: CreateProgrammeDialogProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const form = useForm<ProgrammeFormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: '',
			programme_code: '',
			description: '',
			semester_id: semesterId,
		},
	});

	const onSubmit = async (data: ProgrammeFormValues) => {
		try {
			setIsSubmitting(true);
			setError(null);

			// Call the server action to create programme
			const response = await createProgramme({
				name: data.name,
				programme_code: data.programme_code,
				description: data.description,
				semester_id: data.semester_id,
			});

			if (!response.success) {
				throw new Error(response.error || 'Failed to create programme');
			}

			if (!response.data) {
				throw new Error('No programme data returned from server');
			}

			// Pass the created programme to the parent component
			onSuccess(response.data);

			// Close the dialog
			onOpenChange(false);

			// Reset the form
			form.reset();
		} catch (error) {
			console.error('Error creating programme:', error);
			setError(error instanceof Error ? error.message : 'An unexpected error occurred');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Create New Programme</DialogTitle>
					<DialogDescription>Add a new programme to this semester.</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
									<FormLabel>Programme Name</FormLabel>
									<FormControl>
										<Input {...field} placeholder="e.g. Computer Science" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="programme_code"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Programme Code</FormLabel>
									<FormControl>
										<Input {...field} placeholder="e.g. CS" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea
											{...field}
											placeholder="Enter programme description"
											rows={3}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? 'Creating...' : 'Create Programme'}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

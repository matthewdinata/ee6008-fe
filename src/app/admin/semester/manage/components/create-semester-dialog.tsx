'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { createSemester } from '@/utils/actions/admin/semester';
import { Semester } from '@/utils/actions/admin/types';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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

// Form schema
const formSchema = z
	.object({
		name: z.string().min(2).max(50),
		academic_year: z.number().int().positive().min(2000).max(3000),
		active: z.boolean().default(false),
		min_cap: z.union([
			z.number().int().nonnegative(),
			z.nan().transform(() => undefined),
			z.undefined(),
		]),
		max_cap: z.union([
			z.number().int().positive(),
			z.nan().transform(() => undefined),
			z.undefined(),
		]),
	})
	.refine(
		(data) => {
			if (data.min_cap !== undefined && data.max_cap !== undefined) {
				return data.min_cap <= data.max_cap;
			}
			return true;
		},
		{
			message: 'Maximum capacity must be greater than or equal to minimum capacity',
			path: ['max_cap'],
		}
	);

type CreateSemesterFormValues = z.infer<typeof formSchema>;

interface CreateSemesterDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess: (semester: Semester) => void;
}

export function CreateSemesterDialog({ open, onOpenChange, onSuccess }: CreateSemesterDialogProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const form = useForm<CreateSemesterFormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			academic_year: new Date().getFullYear(),
			name: '',
			active: false,
			min_cap: undefined,
			max_cap: undefined,
		},
	});

	const onSubmit = async (data: CreateSemesterFormValues) => {
		try {
			setIsSubmitting(true);
			setError(null);

			// Ensure academic_year is properly formatted as a number
			const formattedData = {
				name: String(data.name).trim(),
				academic_year: Number(data.academic_year),
				active: Boolean(data.active),
				min_cap: data.min_cap !== undefined ? Number(data.min_cap) : null,
				max_cap: data.max_cap !== undefined ? Number(data.max_cap) : null,
			};

			console.log('Submitting semester data:', JSON.stringify(formattedData, null, 2));

			const response = await createSemester(formattedData);

			if (!response.success) {
				throw new Error(response.error || 'Failed to create semester');
			}

			if (!response.data) {
				throw new Error('No semester data returned from server');
			}

			onSuccess(response.data);
			onOpenChange(false); // Close dialog on success
		} catch (error) {
			console.error('Error creating semester:', error);
			setError(error instanceof Error ? error.message : 'Failed to create semester');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Create New Semester</DialogTitle>
					<DialogDescription>Add a new semester to the system.</DialogDescription>
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
							name="academic_year"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Academic Year</FormLabel>
									<FormControl>
										<Input
											type="number"
											placeholder="2025"
											value={field.value}
											min={2000}
											max={3000}
											onChange={(e) => {
												const value =
													e.target.value === ''
														? ''
														: parseInt(e.target.value, 10);
												field.onChange(value);
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Semester Name</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="min_cap"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Minimum Capacity</FormLabel>
									<FormControl>
										<Input
											type="number"
											placeholder="0"
											value={field.value}
											min={0}
											onChange={(e) => {
												const value =
													e.target.value === ''
														? undefined
														: parseInt(e.target.value, 10);
												field.onChange(value);
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="max_cap"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Maximum Capacity</FormLabel>
									<FormControl>
										<Input
											type="number"
											placeholder="100"
											value={field.value}
											min={1}
											onChange={(e) => {
												const value =
													e.target.value === ''
														? undefined
														: parseInt(e.target.value, 10);
												field.onChange(value);
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="active"
							render={({ field }) => (
								<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
									<FormControl>
										<Checkbox
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
									<div className="space-y-1 leading-none">
										<FormLabel>Active Semester</FormLabel>
										<p className="text-sm text-muted-foreground">
											Set as the currently active semester
										</p>
									</div>
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
								{isSubmitting ? 'Creating...' : 'Create Semester'}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

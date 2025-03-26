'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { TeamMember } from '@/utils/actions/student/types';
import {
	usePeerReviewDetails,
	useSubmitPeerReview,
	useUpdatePeerReview,
} from '@/utils/hooks/student/use-peer-reviews';
import { useToast } from '@/utils/hooks/use-toast';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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

// Define the form schema with zod
const reviewFormSchema = z.object({
	score: z.string().refine(
		(val) => {
			const score = parseInt(val, 10);
			return score >= 1 && score <= 10;
		},
		{
			message: 'Score must be between 1 and 10',
		}
	),
	comments: z
		.string()
		.min(10, {
			message: 'Comments must be at least 10 characters',
		})
		.max(1000, {
			message: 'Comments must not exceed 1000 characters',
		}),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

interface ReviewFormProps {
	reviewId?: number;
	revieweeId?: number;
	revieweeName?: string;
	projectId?: number;
	isEdit?: boolean;
	teamMember?: TeamMember;
}

export default function ReviewForm({
	reviewId,
	revieweeId,
	revieweeName,
	projectId,
	isEdit = false,
	teamMember,
}: ReviewFormProps) {
	const router = useRouter();
	const { toast } = useToast();
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Fetch review details if in edit mode
	const {
		data: reviewDetails,
		isLoading: isLoadingDetails,
		isError: isErrorDetails,
		error: detailsError,
	} = usePeerReviewDetails(isEdit ? reviewId : undefined);

	// Mutations for submitting and updating reviews
	const submitReviewMutation = useSubmitPeerReview();
	const updateReviewMutation = useUpdatePeerReview();

	// Initialize form with default values or existing review data
	const form = useForm<ReviewFormValues>({
		resolver: zodResolver(reviewFormSchema),
		defaultValues: {
			score: '',
			comments: '',
		},
	});

	// Update form values when review details are loaded
	useEffect(() => {
		if (isEdit && reviewDetails) {
			form.reset({
				score: reviewDetails.score.toString(),
				comments: reviewDetails.comments,
			});
		}
	}, [isEdit, reviewDetails, form]);

	// Handle form submission
	const onSubmit = async (values: ReviewFormValues) => {
		setIsSubmitting(true);

		try {
			if (isEdit && reviewId) {
				// Update existing review
				await updateReviewMutation.mutateAsync({
					reviewId,
					reviewData: {
						score: parseInt(values.score, 10),
						comments: values.comments,
					},
				});

				toast({
					title: 'Review updated',
					description: 'Your peer review has been successfully updated.',
				});
			} else if (revieweeId && projectId) {
				// Submit new review
				await submitReviewMutation.mutateAsync({
					projectId: projectId,
					revieweeStudentId: revieweeId,
					score: parseInt(values.score, 10),
					comments: values.comments,
				});

				toast({
					title: 'Review submitted',
					description: 'Your peer review has been successfully submitted.',
				});
			} else {
				throw new Error('Missing required data for review submission');
			}

			// Navigate back to the dashboard
			router.push('/student/peer-review');
		} catch (error) {
			console.error('Error submitting review:', error);
			toast({
				variant: 'destructive',
				title: 'Submission failed',
				description:
					error instanceof Error
						? error.message
						: 'Failed to submit review. Please try again.',
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	// Handle loading state
	if (isEdit && isLoadingDetails) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[400px]">
				<Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
				<p className="text-muted-foreground">Loading review data...</p>
			</div>
		);
	}

	// Handle error state
	if (isEdit && isErrorDetails) {
		return (
			<Alert variant="destructive" className="mb-6">
				<AlertTitle>Error</AlertTitle>
				<AlertDescription>
					{detailsError instanceof Error
						? detailsError.message
						: 'Failed to load review details. Please try again.'}
				</AlertDescription>
				<Button
					variant="outline"
					size="sm"
					onClick={() => router.push('/student/peer-review')}
					className="mt-2"
				>
					Return to Dashboard
				</Button>
			</Alert>
		);
	}

	// Get display name for the reviewee
	const displayName = isEdit
		? reviewDetails?.revieweeName
		: revieweeName || teamMember?.name || 'Team Member';

	return (
		<div className="space-y-6">
			<div className="flex items-center">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => router.push('/student/peer-review')}
					className="mr-2"
				>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Back
				</Button>
				<h1 className="text-2xl font-bold tracking-tight">
					{isEdit ? 'Edit Review' : 'New Review'}
				</h1>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Peer Review for {displayName}</CardTitle>
				</CardHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<CardContent className="space-y-6">
							<FormField
								control={form.control}
								name="score"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Score (1-10)</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select a score" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
													<SelectItem
														key={score}
														value={score.toString()}
													>
														{score}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormDescription>
											Rate your team member&apos;s performance from 1 (poor)
											to 10 (excellent)
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="comments"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Comments</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Provide feedback on your team member's contributions, strengths, and areas for improvement..."
												className="min-h-[150px]"
												{...field}
											/>
										</FormControl>
										<FormDescription>
											Be constructive and specific in your feedback
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</CardContent>
						<CardFooter className="flex justify-between">
							<Button
								type="button"
								variant="outline"
								onClick={() => router.push('/student/peer-review')}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										{isEdit ? 'Updating...' : 'Submitting...'}
									</>
								) : (
									<>
										<Save className="mr-2 h-4 w-4" />
										{isEdit ? 'Update Review' : 'Submit Review'}
									</>
								)}
							</Button>
						</CardFooter>
					</form>
				</Form>
			</Card>
		</div>
	);
}

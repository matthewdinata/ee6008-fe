'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle2, Clock, Info, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { UseFormReturn, useForm } from 'react-hook-form';
import { z } from 'zod';

import { GradingComponent } from '@/utils/actions/faculty/grading';
import { useCheckAssessmentPeriod } from '@/utils/hooks/faculty/use-check-assessment-period';
import {
	useGetModeratorGrades,
	useGetModeratorGradingComponents,
	useSubmitModeratorGrades,
} from '@/utils/hooks/faculty/use-faculty-grading';
import { useToast } from '@/utils/hooks/use-toast';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
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
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ModeratorGradingFormProps {
	projectId: number;
}

// Type definitions
interface TeamGradeFormValue {
	component_id: number;
	score: number;
}

interface GradingFormValues {
	teamGrades: TeamGradeFormValue[];
	feedback: string;
}

// Define Zod schema for validation
const createGradingSchema = (_components: GradingComponent[]): z.ZodType<GradingFormValues> => {
	return z.object({
		teamGrades: z.array(
			z.object({
				component_id: z.coerce.number(),
				score: z
					.number()
					.min(0, 'Score must be at least 0')
					.max(100, 'Score must be at most 100'),
			})
		),
		feedback: z.string().min(1, 'Overall feedback is required'),
	});
};

// Component for the loading state
function LoadingState() {
	return (
		<div className="flex justify-center items-center min-h-[40vh]">
			<div className="flex flex-col items-center gap-2">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
				<p className="text-sm text-muted-foreground">Loading grading components...</p>
			</div>
		</div>
	);
}

// Component for error state
function ErrorState({ message }: { message: string }) {
	return (
		<Alert variant="destructive">
			<AlertCircle className="h-4 w-4" />
			<AlertTitle>Error</AlertTitle>
			<AlertDescription>{message}</AlertDescription>
		</Alert>
	);
}

// Component for assessment components
function AssessmentComponentsSection({
	components,
	form,
}: {
	components: GradingComponent[];
	form: UseFormReturn<GradingFormValues>;
}) {
	if (components.length === 0) return null;

	return (
		<div>
			<h3 className="text-lg font-medium mb-4">Assessment Components</h3>
			<div className="space-y-4">
				{components.map((component, index) => (
					<Card key={component.id}>
						<CardHeader className="pb-2">
							<CardTitle className="text-base">
								{component.name} ({component.weight}%)
							</CardTitle>
							<CardDescription>{component.description}</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid gap-4">
								<FormField
									control={form.control}
									name={`teamGrades.${index}.score`}
									render={({ field }) => (
										<FormItem>
											<FormLabel htmlFor={`team-score-${component.id}`}>
												Score (0-100)
											</FormLabel>
											<FormControl>
												<Input
													id={`team-score-${component.id}`}
													type="text"
													{...field}
													onChange={(e) => {
														const value = e.target.value;
														// Only allow numbers and empty string
														if (value === '' || /^\d+$/.test(value)) {
															field.onChange(
																value === '' ? '' : Number(value)
															);
														}
													}}
													className="max-w-xs"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Hidden field for component_id */}
								<input
									type="hidden"
									{...form.register(`teamGrades.${index}.component_id`)}
									value={component.id}
								/>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}

// Component for overall feedback
function OverallFeedbackSection({ form }: { form: UseFormReturn<GradingFormValues> }) {
	return (
		<div>
			<h3 className="text-lg font-medium mb-4">Overall Feedback</h3>
			<Card>
				<CardContent className="pt-6">
					<FormField
						control={form.control}
						name="feedback"
						render={({ field }) => (
							<FormItem>
								<FormLabel htmlFor="overall-feedback">Moderator Feedback</FormLabel>
								<FormControl>
									<Textarea
										id="overall-feedback"
										placeholder="Provide overall feedback for the project..."
										rows={5}
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</CardContent>
			</Card>
		</div>
	);
}

export default function ModeratorGradingForm({ projectId }: ModeratorGradingFormProps) {
	const { toast } = useToast();

	const [gradingComponents, setComponents] = useState<GradingComponent[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [gradingCompleted, setGradingCompleted] = useState<boolean>(false);
	const [gradedAt, setGradedAt] = useState<string | null>(null);
	const [formSchema, setFormSchema] = useState<z.ZodType<GradingFormValues>>(
		z.object({
			teamGrades: z.array(
				z.object({
					component_id: z.coerce.number(),
					score: z.number(),
				})
			),
			feedback: z.string().min(1, 'Overall feedback is required'),
		})
	);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Use the assessment period check hook
	const {
		isWithinAssessmentPeriod,
		timeMessage,
		isLoading: isLoadingAssessmentPeriod,
		error: assessmentPeriodError,
	} = useCheckAssessmentPeriod();

	// Use the hooks
	const {
		data: gradingComponentsData,
		isLoading: componentsLoading,
		error: componentsError,
	} = useGetModeratorGradingComponents();

	const {
		data: existingGradesData,
		isLoading: gradesLoading,
		error: gradesError,
	} = useGetModeratorGrades(projectId);

	const {
		mutate: submitGrades,
		isPending: isSaving,
		error: submitError,
	} = useSubmitModeratorGrades();

	// Set up the form schema when components are loaded
	useEffect(() => {
		if (gradingComponents.length > 0) {
			setFormSchema(createGradingSchema(gradingComponents));
		}
	}, [gradingComponents]);

	// Initialize form with default values
	const form = useForm<GradingFormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			teamGrades:
				gradingComponents.length > 0
					? gradingComponents.map((component) => ({
							component_id: Number(component.id),
							score: 0,
						}))
					: [],
			feedback: '',
		},
		mode: 'onChange',
	});

	// Initialize components and form schema when data is loaded
	useEffect(() => {
		if (gradingComponentsData && gradingComponentsData.length > 0) {
			const components = gradingComponentsData.map((component) => ({
				...component,
				id: Number(component.id),
			}));
			setComponents(components);
		}
	}, [gradingComponentsData]);

	// Set existing grades when data is loaded
	useEffect(() => {
		if (existingGradesData && existingGradesData.length > 0) {
			// Check if grading is completed
			if (existingGradesData[0] && 'grading_completed' in existingGradesData[0]) {
				setGradingCompleted(existingGradesData[0].grading_completed as boolean);
			}

			// Check for graded_at timestamp
			if (existingGradesData[0] && 'graded_at' in existingGradesData[0]) {
				setGradedAt(existingGradesData[0].graded_at as string);
			}

			// Set existing team grades
			const teamGradesData = existingGradesData.filter((grade) => grade.component_id > 0);

			// Prepare form values from existing grades
			const teamGrades = teamGradesData.map((grade) => ({
				component_id: Number(grade.component_id),
				score: Number(grade.score),
			}));

			// Set feedback if available
			const feedbackItem = existingGradesData.find(
				(item) => item.feedback && item.component_id === 0
			);
			const feedback = feedbackItem?.feedback || '';

			// Update form with existing grades
			form.reset({
				teamGrades,
				feedback,
			});
		}
	}, [existingGradesData, form]);

	// Set error from hooks
	useEffect(() => {
		if (componentsError) {
			setError('Failed to load grading components');
		} else if (gradesError) {
			setError('Failed to load existing grades');
		} else if (submitError) {
			setError('Failed to submit grades');
		} else if (assessmentPeriodError) {
			setError('Failed to check assessment period');
		} else if (!isWithinAssessmentPeriod) {
			setError(`Assessment period is closed. ${timeMessage}`);
		} else {
			setError(null);
		}
	}, [
		componentsError,
		gradesError,
		submitError,
		assessmentPeriodError,
		isWithinAssessmentPeriod,
		timeMessage,
	]);

	// Handle form submission
	const onSubmit = (values: GradingFormValues): void => {
		setIsSubmitting(true);

		try {
			// Validate scores are within range
			const validateScores = (): boolean => {
				let isValid = true;

				// Validate team grades
				if (values.teamGrades) {
					for (const grade of values.teamGrades) {
						if (grade.score < 0 || grade.score > 100) {
							toast({
								title: 'Invalid score',
								description: 'All scores must be between 0 and 100',
								variant: 'destructive',
							});
							isValid = false;
							break;
						}
					}
				}

				return isValid;
			};

			// Exit if scores are invalid
			if (!validateScores()) {
				setIsSubmitting(false);
				return;
			}

			// Map form values to API format
			const teamGrades = values.teamGrades.map((grade) => ({
				project_id: Number(projectId),
				component_id: grade.component_id,
				score: grade.score,
			}));

			// Submit grades
			submitGrades(
				{
					projectId: Number(projectId),
					grades: {
						team_grades: teamGrades,
					},
					feedback: values.feedback,
				},
				{
					onSuccess: () => {
						toast({
							title: 'Grades submitted successfully',
							description: 'The grades have been saved.',
						});
						// Set grading as completed after successful submission
						setGradingCompleted(true);
						// Set current timestamp as graded_at
						setGradedAt(new Date().toISOString());
					},
					onError: (error) => {
						console.error('Error submitting grades:', error);
						toast({
							title: 'Error submitting grades',
							description:
								'There was an error submitting the grades. Please try again.',
							variant: 'destructive',
						});
					},
					onSettled: () => {
						setIsSubmitting(false);
					},
				}
			);
		} catch (error) {
			console.error('Error preparing grades submission:', error);
			toast({
				title: 'Error submitting grades',
				description:
					'There was an error preparing the grades submission. Please try again.',
				variant: 'destructive',
			});
			setIsSubmitting(false);
		}
	};

	useEffect(() => {
		const subscription = form.watch(() => {
			if (form.formState.errors && Object.keys(form.formState.errors).length > 0) {
				console.log('Form validation errors:', form.formState.errors);
			}
		});
		return () => subscription.unsubscribe();
	}, [form]);

	if (componentsLoading || gradesLoading || isLoadingAssessmentPeriod) {
		return <LoadingState />;
	}

	if (error) {
		return <ErrorState message={error} />;
	}

	if (!isWithinAssessmentPeriod && gradingCompleted) {
		return (
			<Alert>
				<Info className="h-4 w-4" />
				<AlertTitle>Assessment Period</AlertTitle>
				<AlertDescription>
					The assessment period has ended. Your assessments have been submitted.
				</AlertDescription>
			</Alert>
		);
	}

	if (!isWithinAssessmentPeriod && !gradingCompleted) {
		return (
			<div className="space-y-6">
				<Alert>
					<Clock className="h-4 w-4 text-amber-600" />
					<AlertTitle>Assessment Period</AlertTitle>
					<AlertDescription>{timeMessage}</AlertDescription>
				</Alert>

				<Card>
					<CardHeader>
						<CardTitle>Moderator Assessment</CardTitle>
						<CardDescription>
							Assessment is currently unavailable as you are outside the assessment
							period.
						</CardDescription>
					</CardHeader>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Display assessment period alert */}
			<Alert
				className={`mb-6 ${assessmentPeriodError ? 'bg-blue-200/20' : isWithinAssessmentPeriod ? 'bg-blue-200/20' : 'bg-amber-200/20'}`}
			>
				<Clock
					className={`h-4 w-4 ${assessmentPeriodError ? 'text-blue-600' : isWithinAssessmentPeriod ? 'text-blue-600' : 'text-amber-600'}`}
				/>
				<AlertTitle className="flex items-center gap-2">
					{assessmentPeriodError
						? 'Assessment Available'
						: isWithinAssessmentPeriod
							? 'Assessment Period Active'
							: 'Assessment Period Inactive'}
				</AlertTitle>
				<AlertDescription>{timeMessage}</AlertDescription>
			</Alert>

			<Card>
				<CardHeader>
					<CardTitle>Moderator Assessment</CardTitle>
					<CardDescription>
						Assess this project as a moderator. All scores must be between 0-100.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{gradingCompleted && gradedAt && (
						<Alert className="mb-6">
							<CheckCircle2 className="h-4 w-4" />
							<AlertTitle>Grading Complete</AlertTitle>
							<AlertDescription>
								You have completed grading for this project on{' '}
								{new Date(gradedAt).toLocaleDateString()}.
							</AlertDescription>
						</Alert>
					)}

					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							<div className="space-y-6">
								{/* Assessment Components Section */}
								{gradingComponents.length > 0 && (
									<AssessmentComponentsSection
										components={gradingComponents}
										form={form}
									/>
								)}

								{/* Overall Feedback Section */}
								<OverallFeedbackSection form={form} />
							</div>

							<CardFooter className="flex justify-end gap-2 px-0">
								<Button
									variant="outline"
									type="button"
									disabled={isSaving || isSubmitting}
									onClick={() => window.history.back()}
								>
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={
										isSaving ||
										isSubmitting ||
										!isWithinAssessmentPeriod ||
										gradingCompleted
									}
								>
									{(isSaving || isSubmitting) && (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									)}
									Save Grades
								</Button>
							</CardFooter>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}

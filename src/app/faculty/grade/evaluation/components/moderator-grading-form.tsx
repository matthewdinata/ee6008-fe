'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle2, Clock, Edit, Info, Loader2, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { UseFormReturn, useForm } from 'react-hook-form';
import { z } from 'zod';

import {
	GradingComponent,
	ModeratorGradeUpdate,
	ProjectGrade,
} from '@/utils/actions/faculty/grading';
import { useCheckAssessmentPeriod } from '@/utils/hooks/faculty/use-check-assessment-period';
import {
	useGetModeratorGrades,
	useGetModeratorGradingComponents,
	useSubmitModeratorGrades,
} from '@/utils/hooks/faculty/use-faculty-grading';
import { useGradeComponentUpdate } from '@/utils/hooks/faculty/use-grade-component-update';
import { useToast } from '@/utils/hooks/use-toast';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

// Define interface for the moderator grades response
interface ModeratorGradesResponse {
	teamGrades: Array<{
		component_id: number;
		score: number;
		feedback?: string;
	}>;
	feedback: string;
	gradedAt: string | null;
	gradingCompleted: boolean;
}

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
	projectId,
	gradesData,
	isFormDisabled,
}: {
	components: GradingComponent[];
	form: UseFormReturn<GradingFormValues>;
	projectId: number;
	gradesData?: ProjectGrade[];
	isFormDisabled: boolean;
}) {
	const { editingComponentId, setEditingComponentId, isUpdating, updateModeratorComponent } =
		useGradeComponentUpdate({ projectId, type: 'moderator' });

	// Find graded components and their timestamps
	const getGradeForComponent = (componentId: number) => {
		if (!gradesData || !Array.isArray(gradesData)) return undefined;
		return gradesData.find((grade) => grade.component_id === componentId);
	};

	if (components.length === 0) return null;

	return (
		<div>
			<h3 className="text-lg font-medium mb-4">Assessment Components</h3>
			<div className="space-y-4">
				{components.map((component, index) => {
					const existingGrade = getGradeForComponent(component.id);
					const isGraded = !!existingGrade;
					const isEditing = editingComponentId === `${component.id}`;

					return (
						<Card
							key={component.id}
							className={`${isGraded ? 'border-2 border-green-500 dark:border-green-600' : ''}`}
						>
							<CardHeader className="pb-2">
								<div className="flex justify-between items-start">
									<CardTitle className="text-base">
										{component.name} ({component.weight}%)
										{isGraded && (
											<Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 font-medium">
												Graded
											</Badge>
										)}
									</CardTitle>

									{isGraded && !isEditing && !isFormDisabled && (
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<Button
														variant="outline"
														size="sm"
														className="border-green-500 hover:bg-green-50 dark:border-green-600 dark:hover:bg-green-900/20"
														onClick={() =>
															setEditingComponentId(`${component.id}`)
														}
													>
														<Edit className="h-4 w-4 mr-1" />
														Edit
													</Button>
												</TooltipTrigger>
												<TooltipContent>
													<p>Edit this component grade</p>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									)}
								</div>
								<CardDescription>{component.description}</CardDescription>
								{isGraded && (
									<div className="flex items-center text-sm text-muted-foreground mt-2">
										<Clock className="h-4 w-4 mr-1" />
										Last updated:{' '}
										{new Date(existingGrade?.graded_at || '').toLocaleString()}
									</div>
								)}
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
												<div className="flex items-center gap-2">
													<FormControl>
														<Input
															id={`team-score-${component.id}`}
															type="text"
															{...field}
															onChange={(e) => {
																const value = e.target.value;
																// Only allow numbers and empty string
																if (
																	value === '' ||
																	/^\d+$/.test(value)
																) {
																	field.onChange(
																		value === ''
																			? ''
																			: Number(value)
																	);
																}
															}}
															className="max-w-xs"
															disabled={isFormDisabled && !isEditing}
														/>
													</FormControl>

													{isEditing && (
														<Button
															type="button"
															variant="outline"
															size="sm"
															onClick={() => {
																const update: ModeratorGradeUpdate =
																	{
																		component_id: component.id,
																		score: field.value as number,
																		comments:
																			form.getValues()
																				.feedback,
																	};
																updateModeratorComponent(
																	update,
																	form.getValues().feedback
																);
															}}
															disabled={isUpdating}
														>
															{isUpdating ? (
																<>
																	<Loader2 className="h-4 w-4 mr-1 animate-spin" />
																	Saving...
																</>
															) : (
																<>
																	<Save className="h-4 w-4 mr-1" />
																	Save
																</>
															)}
														</Button>
													)}
												</div>
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
					);
				})}
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
	const [_gradedComponentsCount, setGradedComponentsCount] = useState<number>(0);
	const [isFormDisabled, setIsFormDisabled] = useState(false);

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
		error: _submitError,
	} = useSubmitModeratorGrades();

	// Debug log for the API response
	useEffect(() => {
		if (existingGradesData) {
			console.log('API Response - Moderator Grades:', existingGradesData);
			// Check if it's an object with the expected properties
			const isValidResponse =
				existingGradesData !== null &&
				typeof existingGradesData === 'object' &&
				'gradingCompleted' in existingGradesData;
			console.log('API Response - Has gradingCompleted property:', isValidResponse);
			if (isValidResponse) {
				// Cast to unknown first to avoid TypeScript errors
				const typedData = existingGradesData as unknown as ModeratorGradesResponse;
				console.log('API Response - gradingCompleted value:', typedData.gradingCompleted);
			}
		}
	}, [existingGradesData]);

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

	// Process existing grades data
	useEffect(() => {
		// Skip if no data or if form is not ready
		if (!existingGradesData || !form) {
			return;
		}

		console.log('Processing existing grades data:', existingGradesData);

		// Cast to unknown first to avoid TypeScript errors
		const isObject = existingGradesData !== null && typeof existingGradesData === 'object';
		if (!isObject) return;

		const data = existingGradesData as unknown as Record<string, unknown>;

		// Check if the project is already graded
		const isGraded = 'gradingCompleted' in data && data.gradingCompleted === true;

		const gradedAtValue = 'gradedAt' in data ? (data.gradedAt as string | null) : null;

		console.log('Grading status check:', { isGraded, gradedAtValue });

		if (isGraded) {
			// Set state to indicate grading is completed
			setGradingCompleted(true);
			setGradedAt(gradedAtValue);
			setIsFormDisabled(true);

			// Show toast and redirect
			toast({
				title: 'Project Already Graded',
				description: 'Redirecting to graded components view...',
				variant: 'default',
			});

			return;
		}

		// If not graded, set up the form with existing data
		try {
			// Check if existingGradesData has teamGrades property
			if ('teamGrades' in data && Array.isArray(data.teamGrades)) {
				// Cast to appropriate type for teamGrades
				const teamGradesData = data.teamGrades as Array<{
					component_id: number;
					score: number;
				}>;
				const teamGrades = teamGradesData.map((grade) => ({
					component_id: grade.component_id,
					score: grade.score,
				}));

				const feedback = 'feedback' in data ? (data.feedback as string) || '' : '';

				// Set form values
				form.setValue('teamGrades', teamGrades);
				form.setValue('feedback', feedback);

				console.log('Form values set with existing data:', { teamGrades, feedback });
			}
		} catch (error) {
			console.error('Error setting form values:', error);
			setError('Failed to load existing grades');
		}
	}, [existingGradesData, form, toast, projectId]);

	// Set up the form schema when components are loaded
	useEffect(() => {
		if (gradingComponents.length > 0) {
			setFormSchema(createGradingSchema(gradingComponents));
		}
	}, [gradingComponents]);

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

	// Set error from hooks
	useEffect(() => {
		if (componentsError) {
			setError('Failed to load grading components');
		} else if (gradesError) {
			setError('Failed to load existing grades');
		} else if (_submitError) {
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
		_submitError,
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
						// Update graded components count
						setGradedComponentsCount(teamGrades.length);
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

	// Check if form should be disabled
	useEffect(() => {
		setIsFormDisabled(!isWithinAssessmentPeriod || gradingCompleted);
	}, [isWithinAssessmentPeriod, gradingCompleted]);

	// Get the last update timestamp
	const getLastUpdateTimestamp = () => {
		if (
			!existingGradesData ||
			!Array.isArray(existingGradesData) ||
			existingGradesData.length === 0
		)
			return null;

		const sortedGrades = [...existingGradesData].sort(
			(a, b) => new Date(b.graded_at).getTime() - new Date(a.graded_at).getTime()
		);

		return sortedGrades[0]?.graded_at;
	};

	const _lastUpdateTimestamp = getLastUpdateTimestamp();

	// Debug render
	console.log('Render state:', {
		isFormDisabled,
		gradingCompleted,
		existingGradesLoaded: !!existingGradesData?.length,
		componentsLoaded: !!gradingComponents?.length,
	});

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
		<div className="space-y-8">
			{/* Show alert when project is already graded */}
			{isFormDisabled && gradingCompleted && (
				<Alert className="max-w-2xl mx-auto mb-4">
					<AlertCircle className="h-4 w-4" />
					<AlertTitle>Project Already Graded</AlertTitle>
					<AlertDescription>
						<p>This project has already been graded. You cannot submit grades again.</p>
						<p className="mt-2">
							Please click on the <strong>&quot;Graded Components&quot;</strong> tab
							above to view the grades.
						</p>
					</AlertDescription>
				</Alert>
			)}

			{/* Disable the form when project is already graded */}
			<div
				className={
					isFormDisabled && gradingCompleted ? 'opacity-60 pointer-events-none' : ''
				}
			>
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
											projectId={projectId}
											gradesData={existingGradesData}
											isFormDisabled={isFormDisabled}
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
										disabled={isSaving || isSubmitting || isFormDisabled}
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
		</div>
	);
}

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Clock, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { UseFormReturn, useForm } from 'react-hook-form';
import { z } from 'zod';

import { GradingComponent } from '@/utils/actions/faculty/grading';
import { useCheckAssessmentPeriod } from '@/utils/hooks/faculty/use-check-assessment-period';
import {
	useGetSupervisorGrades,
	useGetSupervisorGradingComponents,
	useSubmitSupervisorGrades,
} from '@/utils/hooks/faculty/use-faculty-grading';
import { useToast } from '@/utils/hooks/use-toast';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

interface StudentMember {
	student_id: number;
	name: string;
	email: string;
	matriculation_number: string;
}

interface SupervisorGradingFormProps {
	projectId: number;
	teamMembers: StudentMember[];
}

// Type definitions
interface TeamGradeFormValue {
	component_id: number;
	score: number;
}

interface StudentGradeFormValue {
	student_id: number;
	component_id: number;
	score: number;
}

interface GradingFormValues {
	teamGrades: TeamGradeFormValue[];
	feedback: string;
	[key: string]: TeamGradeFormValue[] | string | StudentGradeFormValue[]; // For dynamic student grade fields
}

interface SupervisorGrade {
	project_id: number;
	student_id?: number;
	component_id: number;
	score: number;
}

// Component for the loading state
function LoadingState() {
	return (
		<div className="flex justify-center items-center min-h-[40vh]">
			<div className="flex flex-col items-center gap-2">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
				<p>Loading grading form...</p>
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

// Component for the team assessment section
function TeamAssessmentSection({
	teamComponents,
	form,
}: {
	teamComponents: GradingComponent[];
	form: UseFormReturn<GradingFormValues>;
}) {
	if (teamComponents.length === 0) return null;

	return (
		<div>
			<h3 className="text-lg font-medium mb-4">Team Assessment</h3>
			<div className="space-y-4">
				{teamComponents.map((component, index) => (
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

// Component for individual student component
function StudentComponentCard({
	component,
	student,
	index,
	form,
}: {
	component: GradingComponent;
	student: StudentMember;
	index: number;
	form: UseFormReturn<GradingFormValues>;
}) {
	return (
		<Card key={`${student.student_id}-${component.id}`}>
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
						name={`student_${student.student_id}.${index}.score`}
						render={({ field }) => (
							<FormItem>
								<FormLabel
									htmlFor={`student-${student.student_id}-score-${component.id}`}
								>
									Score (0-100)
								</FormLabel>
								<FormControl>
									<Input
										id={`student-${student.student_id}-score-${component.id}`}
										type="text"
										{...field}
										onChange={(e) => {
											const value = e.target.value;
											// Only allow numbers and empty string
											if (value === '' || /^\d+$/.test(value)) {
												field.onChange(value === '' ? '' : Number(value));
											}
										}}
										className="max-w-xs"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Hidden fields for student_id and component_id */}
					<input
						type="hidden"
						{...form.register(`student_${student.student_id}.${index}.student_id`)}
						value={student.student_id}
					/>
					<input
						type="hidden"
						{...form.register(`student_${student.student_id}.${index}.component_id`)}
						value={component.id}
					/>
				</div>
			</CardContent>
		</Card>
	);
}

// Component for the individual assessment section
function IndividualAssessmentSection({
	individualComponents,
	teamMembers,
	form,
}: {
	individualComponents: GradingComponent[];
	teamMembers: StudentMember[];
	form: UseFormReturn<GradingFormValues>;
}) {
	const [activeStudent, setActiveStudent] = useState<number | null>(
		teamMembers.length > 0 ? teamMembers[0].student_id : null
	);

	if (individualComponents.length === 0 || teamMembers.length === 0) return null;

	return (
		<div>
			<h3 className="text-lg font-medium mb-4">Individual Assessment</h3>

			<Tabs
				value={activeStudent?.toString() || ''}
				onValueChange={(value) => setActiveStudent(Number(value))}
			>
				<TabsList className="mb-4">
					{teamMembers.map((student) => (
						<TabsTrigger key={student.student_id} value={student.student_id.toString()}>
							{student.name}
						</TabsTrigger>
					))}
				</TabsList>

				{teamMembers.map((student) => (
					<TabsContent key={student.student_id} value={student.student_id.toString()}>
						<div className="space-y-4">
							{individualComponents.map((component, index) => (
								<StudentComponentCard
									key={`${student.student_id}-${component.id}`}
									component={component}
									student={student}
									index={index}
									form={form}
								/>
							))}
						</div>
					</TabsContent>
				))}
			</Tabs>
		</div>
	);
}

// Component for overall feedback
function OverallFeedbackSection({ form }: { form: UseFormReturn<GradingFormValues> }) {
	return (
		<div className="mt-8">
			<h3 className="text-lg font-medium mb-4">Overall Feedback</h3>
			<FormField
				control={form.control}
				name="feedback"
				render={({ field }) => (
					<FormItem>
						<FormLabel htmlFor="feedback">Feedback</FormLabel>
						<FormControl>
							<Textarea
								id="feedback"
								rows={5}
								placeholder="Provide overall feedback for the project..."
								{...field}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		</div>
	);
}

// Main component
export function SupervisorGradingForm({ projectId, teamMembers }: SupervisorGradingFormProps) {
	const { toast } = useToast();
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [components, setComponents] = useState<GradingComponent[]>([]);
	const [teamComponents, setTeamComponents] = useState<GradingComponent[]>([]);
	const [individualComponents, setIndividualComponents] = useState<GradingComponent[]>([]);

	// Get grading components
	const {
		data: gradingComponents,
		isLoading: componentsLoading,
		error: componentsError,
	} = useGetSupervisorGradingComponents();

	// Get existing grades
	const {
		data: gradesData,
		isLoading: gradesLoading,
		error: gradesError,
		refetch,
	} = useGetSupervisorGrades(projectId);

	// Check assessment period
	const {
		isWithinAssessmentPeriod,
		timeMessage: assessmentPeriodMessage,
		isLoading: isLoadingAssessmentPeriod,
		error: assessmentPeriodError,
	} = useCheckAssessmentPeriod();

	// Submit grades mutation
	const { mutateAsync: submitGrades, error: submitError } = useSubmitSupervisorGrades();

	// Initialize form
	const form = useForm<GradingFormValues>({
		resolver: zodResolver(
			// Use a basic schema initially, will be updated when components are loaded
			z
				.object({
					teamGrades: z.array(
						z.object({
							componentId: z.number().optional(),
							component_id: z.number().optional(),
							componentName: z.string().optional(),
							component_name: z.string().optional(),
							score: z.number().min(0).max(100),
						})
					),
					feedback: z.string(),
				})
				.passthrough() // Allow additional properties for student grades
		),
		defaultValues: {
			teamGrades: [],
			feedback: '',
		},
	});

	// Initialize form values
	const initializeFormValues = useCallback(
		(teamComps: GradingComponent[], individualComps: GradingComponent[]) => {
			// Initialize team grades
			const initialTeamGrades = teamComps.map((comp) => ({
				component_id: comp.id,
				score: 0,
			}));

			// Initialize student grades
			const studentGradesMap: Record<string, StudentGradeFormValue[]> = {};
			teamMembers.forEach((student) => {
				studentGradesMap[`student_${student.student_id}`] = individualComps.map((comp) => ({
					student_id: student.student_id,
					component_id: comp.id,
					score: 0,
				}));
			});

			// Set default values
			form.reset({
				teamGrades: initialTeamGrades,
				...studentGradesMap,
				feedback: '',
			});
		},
		[form, teamMembers]
	);

	// Process components when loaded
	useEffect(() => {
		if (gradingComponents && gradingComponents.length > 0 && teamMembers.length > 0) {
			// Set components
			setComponents(gradingComponents);

			// Separate team and individual components
			const teamComps = gradingComponents.filter((comp) => comp.is_team_based);
			const individualComps = gradingComponents.filter((comp) => !comp.is_team_based);

			setTeamComponents(teamComps);
			setIndividualComponents(individualComps);

			// Initialize form values
			initializeFormValues(teamComps, individualComps);
		}
	}, [gradingComponents, teamMembers, initializeFormValues]);

	// Load existing grades if available
	useEffect(() => {
		if (gradesData && components.length > 0) {
			// Create a structured object from the array of ProjectGrade
			const teamGradesData: TeamGradeFormValue[] = [];
			const studentGradesData: StudentGradeFormValue[] = [];
			let feedbackText = '';

			// Process the grades data
			gradesData.forEach((grade) => {
				// Find the component to check if it's team-based
				const component = components.find((comp) => comp.id === grade.component_id);

				if (component?.is_team_based) {
					// Team grade
					teamGradesData.push({
						component_id: grade.component_id,
						score: grade.score,
					});
				} else if (grade.student_id) {
					// Student grade
					studentGradesData.push({
						student_id: grade.student_id,
						component_id: grade.component_id,
						score: grade.score,
					});
				}

				// Get feedback from any grade (assuming it's the same for all)
				if (grade.feedback && !feedbackText) {
					feedbackText = grade.feedback;
				}
			});

			// Group student grades by student ID
			const studentGradesMap: Record<string, StudentGradeFormValue[]> = {};
			teamMembers.forEach((student) => {
				studentGradesMap[`student_${student.student_id}`] = [];
			});

			studentGradesData.forEach((grade) => {
				const studentKey = `student_${grade.student_id}`;
				if (studentGradesMap[studentKey]) {
					studentGradesMap[studentKey].push({
						student_id: grade.student_id,
						component_id: grade.component_id,
						score: grade.score,
					});
				}
			});

			// Set form values
			form.reset({
				teamGrades: teamGradesData,
				...studentGradesMap,
				feedback: feedbackText || '',
			});
		}
	}, [gradesData, components, teamMembers, form]);

	// Check if assessment period is closed
	useEffect(() => {
		if (!isWithinAssessmentPeriod) {
			setError(`Assessment period is closed. ${assessmentPeriodMessage}`);
		}
	}, [isWithinAssessmentPeriod, assessmentPeriodMessage]);

	// Handle errors
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
			// Already handled in the previous useEffect
		} else {
			setError(null);
		}
	}, [
		componentsError,
		gradesError,
		submitError,
		assessmentPeriodError,
		isWithinAssessmentPeriod,
	]);

	// Handle form submission
	const onSubmit = async (values: GradingFormValues) => {
		try {
			setIsSubmitting(true);

			// Extract team grades
			const teamGrades = values.teamGrades.map((grade) => ({
				project_id: projectId,
				component_id: grade.component_id,
				score: grade.score,
			}));

			// Extract student grades from all student fields
			const studentGrades: SupervisorGrade[] = [];
			teamMembers.forEach((student) => {
				const studentId = student.student_id;
				const grades = values[`student_${studentId}`] as StudentGradeFormValue[];
				if (grades) {
					grades.forEach((grade) => {
						studentGrades.push({
							project_id: projectId,
							student_id: grade.student_id,
							component_id: grade.component_id,
							score: grade.score,
						});
					});
				}
			});

			// Submit grades
			await submitGrades({
				projectId,
				grades: {
					team_grades: teamGrades,
					student_grades: studentGrades,
				},
				feedback: values.feedback,
			});

			// Show success message
			toast({
				title: 'Grades submitted successfully',
				description: 'The project grades have been saved.',
				variant: 'default',
			});

			// Refresh data
			await refetch();
		} catch (error: unknown) {
			console.error('Error submitting grades:', error);
			toast({
				title: 'Error submitting grades',
				description: 'There was an error submitting the grades. Please try again.',
				variant: 'destructive',
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	if (componentsLoading || gradesLoading || isLoadingAssessmentPeriod) {
		return <LoadingState />;
	}

	if (error) {
		return <ErrorState message={error} />;
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				{/* Assessment Period Info */}
				{assessmentPeriodMessage && isWithinAssessmentPeriod && (
					<Alert>
						<Clock className="h-4 w-4" />
						<AlertTitle>Assessment Period</AlertTitle>
						<AlertDescription>{assessmentPeriodMessage}</AlertDescription>
					</Alert>
				)}

				{/* Team Assessment Section */}
				<TeamAssessmentSection teamComponents={teamComponents} form={form} />

				{/* Individual Assessment Section */}
				<IndividualAssessmentSection
					individualComponents={individualComponents}
					teamMembers={teamMembers}
					form={form}
				/>

				{/* Overall Feedback Section */}
				<OverallFeedbackSection form={form} />

				{/* Submit Button */}
				<div className="flex justify-end">
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Submitting...
							</>
						) : (
							'Submit Grades'
						)}
					</Button>
				</div>
			</form>
		</Form>
	);
}

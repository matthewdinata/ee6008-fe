'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle2, Clock, Edit, Eye, Info, Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { UseFormReturn, useForm } from 'react-hook-form';
import { z } from 'zod';

import {
	GradingComponent,
	ProjectGrade,
	SupervisorGradeUpdate,
} from '@/utils/actions/faculty/grading';
import { useCheckAssessmentPeriod } from '@/utils/hooks/faculty/use-check-assessment-period';
import {
	useGetSupervisorGrades,
	useGetSupervisorGradingComponents,
	useSubmitSupervisorGrades,
} from '@/utils/hooks/faculty/use-faculty-grading';
import { useGradeComponentUpdate } from '@/utils/hooks/faculty/use-grade-component-update';
import { useToast } from '@/utils/hooks/use-toast';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
	comments: string;
}

interface StudentGradeFormValue {
	student_id: number;
	component_id: number;
	score: number;
	comments: string;
}

interface GradingFormValues {
	teamGrades: TeamGradeFormValue[];
	feedback: string;
	[key: string]: TeamGradeFormValue[] | string | StudentGradeFormValue[]; // For dynamic student grade fields
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
	projectId,
	gradesData,
	isFormDisabled,
}: {
	teamComponents: GradingComponent[];
	form: UseFormReturn<GradingFormValues>;
	projectId: number;
	gradesData?: ProjectGrade[];
	isFormDisabled: boolean;
}) {
	const { editingComponentId, setEditingComponentId, isUpdating, updateSupervisorComponent } =
		useGradeComponentUpdate({ projectId, type: 'supervisor' });

	// Find graded components and their timestamps
	const getGradeForComponent = (componentId: number) => {
		if (!gradesData || !Array.isArray(gradesData)) return undefined;
		return gradesData.find((grade) => grade.component_id === componentId && !grade.student_id);
	};

	return (
		<div className="space-y-8">
			{teamComponents.map((component, index) => {
				const existingGrade = getGradeForComponent(component.id);
				const isGraded = !!existingGrade;
				const isEditing = editingComponentId === `${component.id}`;

				return (
					<div
						key={component.id}
						className={`border rounded-lg p-6 bg-card shadow-sm ${isGraded ? 'border-2 border-green-500 dark:border-green-600' : ''}`}
					>
						<div className="flex justify-between items-start mb-4">
							<h4 className="text-xl font-semibold">
								{component.name} ({component.weight}%)
								{isGraded && (
									<Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 font-medium">
										Graded
									</Badge>
								)}
							</h4>

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

						<p className="text-muted-foreground mb-4">{component.description}</p>

						{isGraded && (
							<div className="flex items-center text-sm text-muted-foreground mb-4">
								<Clock className="h-4 w-4 mr-1" />
								Last updated:{' '}
								{new Date(existingGrade?.graded_at || '').toLocaleString()}
							</div>
						)}

						<div className="grid gap-4">
							<FormField
								control={form.control}
								name={`teamGrades.${index}.score`}
								render={({ field }) => (
									<FormItem>
										<FormLabel
											htmlFor={`team-score-${component.id}`}
											className="text-base"
										>
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
														if (value === '' || /^\d+$/.test(value)) {
															field.onChange(
																value === '' ? '' : Number(value)
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
														const update: SupervisorGradeUpdate = {
															component_id: component.id,
															score: field.value as number,
															comments: form.getValues().feedback,
														};
														updateSupervisorComponent(update);
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
						</div>
					</div>
				);
			})}
		</div>
	);
}

// Component for individual student component
function StudentComponentCard({
	component,
	student,
	index,
	form,
	projectId,
	gradesData,
	isFormDisabled,
}: {
	component: GradingComponent;
	student: StudentMember;
	index: number;
	form: UseFormReturn<GradingFormValues>;
	projectId: number;
	gradesData?: ProjectGrade[];
	isFormDisabled: boolean;
}) {
	const { editingComponentId, setEditingComponentId, isUpdating, updateSupervisorComponent } =
		useGradeComponentUpdate({ projectId, type: 'supervisor' });

	// Find graded components and their timestamps
	const getGradeForStudentComponent = (componentId: number, studentId: number) => {
		return Array.isArray(gradesData)
			? gradesData.find(
					(grade) => grade.component_id === componentId && grade.student_id === studentId
				)
			: undefined;
	};

	const studentKey = `student_${student.student_id}`;
	const existingGrade = getGradeForStudentComponent(component.id, student.student_id);
	const isGraded = !!existingGrade;

	// Create a composite key for editing that includes both component ID and student ID
	const compositeEditKey = `${component.id}-${student.student_id}`;
	const isEditing = editingComponentId === compositeEditKey;

	return (
		<Card className={`${isGraded ? 'border-2 border-green-500 dark:border-green-600' : ''}`}>
			<CardHeader className="pb-2">
				<div className="flex justify-between items-start">
					<CardTitle>
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
										onClick={() => setEditingComponentId(compositeEditKey)}
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
						Last updated: {new Date(existingGrade?.graded_at || '').toLocaleString()}
					</div>
				)}
			</CardHeader>
			<CardContent>
				<FormField
					control={form.control}
					name={`${studentKey}.${index}.score`}
					render={({ field }) => (
						<FormItem>
							<FormLabel
								htmlFor={`student-score-${component.id}-${student.student_id}`}
							>
								Score (0-100)
							</FormLabel>
							<div className="flex items-center gap-2">
								<FormControl>
									<Input
										id={`student-score-${component.id}-${student.student_id}`}
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
										disabled={isFormDisabled && !isEditing}
									/>
								</FormControl>

								{isEditing && (
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => {
											const update: SupervisorGradeUpdate = {
												component_id: component.id,
												student_id: student.student_id,
												score: field.value as number,
												comments: form.getValues().feedback,
											};
											updateSupervisorComponent(update);
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
			</CardContent>
		</Card>
	);
}

// Component for the individual assessment section
function IndividualAssessmentSection({
	individualComponents,
	teamMembers,
	form,
	projectId,
	gradesData,
	isFormDisabled,
}: {
	individualComponents: GradingComponent[];
	teamMembers: StudentMember[];
	form: UseFormReturn<GradingFormValues>;
	projectId: number;
	gradesData?: ProjectGrade[];
	isFormDisabled: boolean;
}) {
	const [_activeTab, setActiveTab] = useState<string>('0');

	return (
		<div className="space-y-8">
			<Tabs defaultValue="0" onValueChange={setActiveTab}>
				<TabsList className="mb-4">
					{teamMembers.map((student, index) => (
						<TabsTrigger key={student.student_id} value={index.toString()}>
							{student.name}
						</TabsTrigger>
					))}
				</TabsList>

				{teamMembers.map((student, tabIndex) => (
					<TabsContent key={student.student_id} value={tabIndex.toString()}>
						<div className="grid gap-6">
							{individualComponents.map((component, index) => (
								<StudentComponentCard
									key={component.id}
									component={component}
									student={student}
									index={index}
									form={form}
									projectId={projectId}
									gradesData={gradesData}
									isFormDisabled={isFormDisabled}
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
	const router = useRouter();
	const { toast } = useToast();
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [components, setComponents] = useState<GradingComponent[]>([]);
	const [teamComponents, setTeamComponents] = useState<GradingComponent[]>([]);
	const [individualComponents, setIndividualComponents] = useState<GradingComponent[]>([]);
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);
	const [isFormDisabled, setIsFormDisabled] = useState(false);
	const [gradingProgress, setGradingProgress] = useState({ completed: 0, total: 0 });
	const [isAlreadyGraded, setIsAlreadyGraded] = useState(false);

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
		refetch: _refetch,
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
							comments: z.string().optional(),
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
				comments: '',
			}));

			// Initialize student grades
			const studentGradesMap: Record<string, StudentGradeFormValue[]> = {};
			teamMembers.forEach((student) => {
				studentGradesMap[`student_${student.student_id}`] = [];
			});

			individualComps.forEach((comp) => {
				teamMembers.forEach((student) => {
					studentGradesMap[`student_${student.student_id}`].push({
						student_id: student.student_id,
						component_id: comp.id,
						score: 0,
						comments: '',
					});
				});
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

			// Separate team and individual components based on isTeamBased property
			// Check which property name is used for team-based flag
			const hasIsTeamBased =
				gradingComponents.length > 0 &&
				('isTeamBased' in gradingComponents[0] || 'is_team_based' in gradingComponents[0]);

			if (hasIsTeamBased) {
				// Handle both camelCase and snake_case property names
				const teamComps = gradingComponents.filter(
					(comp) => comp.isTeamBased === true || comp.is_team_based === true
				);
				const individualComps = gradingComponents.filter(
					(comp) => comp.isTeamBased === false || comp.is_team_based === false
				);

				setTeamComponents(teamComps);
				setIndividualComponents(individualComps);
			} else {
				// Fallback to component names if isTeamBased is not available
				const teamComps = gradingComponents.filter((comp) =>
					[
						'Project Charter',
						'Project Report',
						'Video presentation & demonstration',
					].includes(comp.name)
				);
				const individualComps = gradingComponents.filter(
					(comp) =>
						![
							'Project Charter',
							'Project Report',
							'Video presentation & demonstration',
						].includes(comp.name)
				);

				setTeamComponents(teamComps);
				setIndividualComponents(individualComps);
			}

			// Initialize form values
			initializeFormValues(teamComponents, individualComponents);
		}
	}, [
		gradingComponents,
		teamMembers,
		initializeFormValues,
		individualComponents,
		teamComponents,
	]);

	// Define interface for the new gradesData structure
	interface SupervisorGradesResponse {
		studentGrades: Array<{
			student_id: number;
			component_id: number;
			score: number;
			comments?: string;
		}>;
		teamGrades: Array<{
			component_id: number;
			score: number;
			comments?: string;
		}>;
		feedback: string;
		gradedAt: string;
		gradingCompleted: boolean;
	}

	// Load existing grades if available
	useEffect(() => {
		if (gradesData && components.length > 0) {
			// Create a structured object from the array of ProjectGrade
			const teamGradesData: TeamGradeFormValue[] = [];
			const studentGradesData: StudentGradeFormValue[] = [];
			let feedbackText = '';

			// Check if gradesData is an object with studentGrades and teamGrades properties
			if (
				gradesData &&
				typeof gradesData === 'object' &&
				'studentGrades' in gradesData &&
				'teamGrades' in gradesData
			) {
				console.log('Processing gradesData as object:', gradesData);

				// Cast gradesData to the new type
				const gradesResponse = gradesData as unknown as SupervisorGradesResponse;

				// Set the already graded flag if grading is completed
				if (gradesResponse.gradingCompleted) {
					setIsAlreadyGraded(true);

					// Show toast notification
					toast({
						title: 'Project Already Graded',
						description:
							'This project has already been graded. Please click on the "Graded Components" tab to view the grades.',
						variant: 'default',
					});
				}

				// Process team grades
				if (Array.isArray(gradesResponse.teamGrades)) {
					gradesResponse.teamGrades.forEach((grade) => {
						teamGradesData.push({
							component_id: grade.component_id,
							score: grade.score,
							comments: grade.comments || '',
						});
					});
				}

				// Process student grades
				if (Array.isArray(gradesResponse.studentGrades)) {
					gradesResponse.studentGrades.forEach((grade) => {
						studentGradesData.push({
							student_id: grade.student_id,
							component_id: grade.component_id,
							score: grade.score,
							comments: grade.comments || '',
						});
					});
				}

				// Set feedback
				if (gradesResponse.feedback) {
					feedbackText = gradesResponse.feedback;
				}
			} else if (Array.isArray(gradesData)) {
				console.log('Processing gradesData as array:', gradesData);
				gradesData.forEach((grade) => {
					// Find the component to check if it's team-based
					const component = components.find((comp) => comp.id === grade.component_id);

					if (component?.is_team_based) {
						// Team grade
						teamGradesData.push({
							component_id: grade.component_id,
							score: grade.score,
							comments: '', // ProjectGrade doesn't have comments, use empty string
						});
					} else if (grade.student_id) {
						// Student grade
						studentGradesData.push({
							student_id: grade.student_id,
							component_id: grade.component_id,
							score: grade.score,
							comments: '', // ProjectGrade doesn't have comments, use empty string
						});
					}

					// Get feedback from any grade (assuming it's the same for all)
					if (grade.feedback && !feedbackText) {
						feedbackText = grade.feedback;
					}
				});
			} else {
				console.error('gradesData is not in a recognized format:', gradesData);
			}

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
						comments: grade.comments !== undefined ? grade.comments : '',
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
	}, [gradesData, components, teamMembers, form, toast]);

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

	// Calculate grading progress
	useEffect(() => {
		if (gradesData && components.length > 0) {
			// Count total components (team + individual for each student)
			const totalTeamComponents = teamComponents.length;
			const totalIndividualComponents = individualComponents.length * teamMembers.length;
			const totalComponents = totalTeamComponents + totalIndividualComponents;

			// Count completed components
			const completedTeamComponents = teamComponents.filter(
				(comp) =>
					Array.isArray(gradesData) &&
					gradesData.some((grade) => grade.component_id === comp.id && !grade.student_id)
			).length;

			const completedIndividualComponents = teamMembers.reduce((count, student) => {
				const studentCompletedComponents = individualComponents.filter(
					(comp) =>
						Array.isArray(gradesData) &&
						gradesData.some(
							(grade) =>
								grade.component_id === comp.id &&
								grade.student_id === student.student_id
						)
				).length;
				return count + studentCompletedComponents;
			}, 0);

			const totalCompleted = completedTeamComponents + completedIndividualComponents;

			setGradingProgress({
				completed: totalCompleted,
				total: totalComponents,
			});
		}
	}, [gradesData, components, teamComponents, individualComponents, teamMembers]);

	// Check if grades have already been submitted
	useEffect(() => {
		// Check if the project has already been graded
		if (gradesData && gradesData.length > 0) {
			// Check if we have at least one grade for each team component
			const teamGradesComplete =
				teamComponents.length > 0 &&
				teamComponents.every(
					(comp) =>
						Array.isArray(gradesData) &&
						gradesData.some(
							(grade) =>
								grade.component_id === comp.id &&
								grade.score !== null &&
								grade.score !== undefined
						)
				);

			// Check if we have at least one grade for each individual component for each student
			const individualGradesComplete =
				individualComponents.length > 0
					? teamMembers.every((student) =>
							individualComponents.every(
								(comp) =>
									Array.isArray(gradesData) &&
									gradesData.some(
										(grade) =>
											grade.component_id === comp.id &&
											grade.student_id === student.student_id &&
											grade.score !== null &&
											grade.score !== undefined
									)
							)
						)
					: true; // If no individual components, consider it complete

			// If we have a complete set of grades, disable the form and mark as already graded
			if (teamGradesComplete && individualGradesComplete) {
				setIsFormDisabled(true);
				setIsAlreadyGraded(true);
				toast({
					title: 'Grades already submitted',
					description:
						'This evaluation has already been completed. You can view the graded components.',
					variant: 'default',
				});
			}
		}
	}, [gradesData, teamComponents, individualComponents, teamMembers, toast]);

	// Handle form submission
	const onSubmit = useCallback(async (_data: GradingFormValues) => {
		console.log('Submit button clicked, showing confirmation dialog');
		setShowConfirmDialog(true);
	}, []);

	const handleConfirmedSubmit = async () => {
		console.log('Confirmation dialog confirmed, submitting grades');
		setShowConfirmDialog(false);
		setIsSubmitting(true);

		try {
			// Extract team grades with proper type assertion
			const formValues = form.getValues();
			const teamGradesValues = formValues.teamGrades as TeamGradeFormValue[];

			// Map team grades with component_id from teamComponents
			const teamGradesData = teamComponents.map((component, index) => {
				const grade = teamGradesValues[index] || { score: 0, comments: '' };
				return {
					project_id: Number(projectId),
					component_id: component.id, // Use the component ID directly from the component
					score: Number(grade.score) || 0,
					comments: grade.comments || '',
				};
			});

			// Extract individual grades for each student
			const individualGradesData = teamMembers.flatMap((student) => {
				const studentKey = `student_${student.student_id}`;
				const studentGradesValues =
					(formValues[studentKey] as StudentGradeFormValue[]) || [];

				// Map individual grades with component_id from individualComponents
				return individualComponents.map((component, index) => {
					const grade = studentGradesValues[index] || { score: 0, comments: '' };
					return {
						project_id: Number(projectId),
						student_id: Number(student.student_id),
						component_id: component.id, // Use the component ID directly from the component
						score: Number(grade.score) || 0,
						comments: grade.comments || '',
					};
				});
			});

			// Get feedback
			const feedback = formValues.feedback;

			// Log the payload for debugging
			console.log('Submitting grades with payload:', {
				projectId,
				grades: {
					team_grades: teamGradesData,
					student_grades: individualGradesData,
				},
				feedback,
			});

			// Use the existing hook to submit grades
			await submitGrades({
				projectId,
				grades: {
					team_grades: teamGradesData,
					student_grades: individualGradesData,
				},
				feedback,
			});

			toast({
				title: 'Success',
				description: 'Grades submitted successfully',
			});

			// Refresh the page to show updated grades
			setTimeout(() => {
				router.refresh();
			}, 1000);
		} catch (error) {
			console.error('Error submitting grades:', error);
			toast({
				title: 'Error',
				description: 'Failed to submit grades. Please try again.',
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

	// Get the last update timestamp
	const getLastUpdateTimestamp = () => {
		if (!gradesData || !Array.isArray(gradesData) || gradesData.length === 0) return null;

		const sortedGrades = [...gradesData].sort(
			(a, b) => new Date(b.graded_at).getTime() - new Date(a.graded_at).getTime()
		);

		return sortedGrades[0]?.graded_at;
	};

	const lastUpdateTimestamp = getLastUpdateTimestamp();

	return (
		<div className="space-y-8">
			{/* Show alert when project is already graded */}
			{isAlreadyGraded && (
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
			<div className={isAlreadyGraded ? 'opacity-60 pointer-events-none' : ''}>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
						{/* Grading Status Alert */}
						{gradesData && Array.isArray(gradesData) && gradesData.length > 0 && (
							<Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
								<Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
								<AlertTitle className="text-base font-semibold">
									You&#39;ve already graded this project
								</AlertTitle>
								<AlertDescription>
									<p className="mb-2">
										You can review and edit your grades for any component by
										clicking the &quot;Edit&quot; button next to each graded
										component.
									</p>
									<div className="flex items-center justify-between mt-2">
										{lastUpdateTimestamp && (
											<div className="text-sm flex items-center">
												<Clock className="h-4 w-4 mr-1" />
												Last updated:{' '}
												{new Date(lastUpdateTimestamp).toLocaleString()}
											</div>
										)}
										<Button
											variant="outline"
											size="sm"
											className="border-blue-300 hover:bg-blue-50 dark:border-blue-700 dark:hover:bg-blue-900/20"
											onClick={() =>
												(window.location.href = `/faculty/grade/evaluation/${projectId}/graded-components?role=supervisor`)
											}
										>
											<Eye className="h-4 w-4 mr-1" />
											View All Graded Components
										</Button>
									</div>
								</AlertDescription>
							</Alert>
						)}

						{/* Grading Progress */}
						{gradesData && gradesData.length > 0 && (
							<Alert
								className={
									gradingProgress.completed === gradingProgress.total
										? 'bg-green-50 dark:bg-green-900/20'
										: 'bg-blue-50 dark:bg-blue-900/20'
								}
							>
								<CheckCircle2
									className={`h-5 w-5 ${gradingProgress.completed === gradingProgress.total ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}
								/>
								<AlertTitle className="text-base">
									Grading Progress: {gradingProgress.completed}/
									{gradingProgress.total} components
								</AlertTitle>
								<AlertDescription>
									{gradingProgress.completed === gradingProgress.total
										? 'All components have been graded.'
										: `${gradingProgress.total - gradingProgress.completed} components still need to be graded.`}
									{lastUpdateTimestamp && (
										<div className="mt-2 text-sm flex items-center">
											<Clock className="h-4 w-4 mr-1" />
											Last updated:{' '}
											{new Date(lastUpdateTimestamp).toLocaleString()}
										</div>
									)}
								</AlertDescription>
							</Alert>
						)}

						{/* Team Assessment Section */}
						<div className="space-y-8">
							<h2 className="text-2xl font-bold">Team Assessment</h2>
							<TeamAssessmentSection
								teamComponents={teamComponents}
								form={form}
								projectId={projectId}
								gradesData={gradesData}
								isFormDisabled={isFormDisabled}
							/>
						</div>

						{/* Individual Assessment Section */}
						{individualComponents.length > 0 && (
							<div className="space-y-8">
								<h2 className="text-2xl font-bold">Individual Assessment</h2>
								<IndividualAssessmentSection
									individualComponents={individualComponents}
									teamMembers={teamMembers}
									form={form}
									projectId={projectId}
									gradesData={gradesData}
									isFormDisabled={isFormDisabled}
								/>
							</div>
						)}

						{/* Overall Feedback Section */}
						<div className="space-y-8">
							<h2 className="text-2xl font-bold">Overall Feedback</h2>
							<OverallFeedbackSection form={form} />
						</div>

						{/* Submit Button */}
						<div className="flex justify-end">
							<Button
								type="submit"
								size="lg"
								disabled={isSubmitting || isFormDisabled}
								className="min-w-[150px]"
							>
								{isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Submitting...
									</>
								) : (
									<>Submit Assessment</>
								)}
							</Button>
						</div>

						{/* Confirmation Dialog */}
						<AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Confirm Submission</AlertDialogTitle>
									<AlertDialogDescription>
										Are you sure you want to submit this assessment? This action
										cannot be undone.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction onClick={handleConfirmedSubmit}>
										Submit
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</form>
				</Form>
			</div>
		</div>
	);
}

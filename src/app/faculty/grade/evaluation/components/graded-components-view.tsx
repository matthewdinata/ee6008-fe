'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, ArrowLeft, Clock, Edit, Info, Loader2, Save as _Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useGetProjectDetails } from '@/utils/hooks/faculty/use-faculty-get-project-details';
import { useGetSupervisorGrades } from '@/utils/hooks/faculty/use-faculty-grading';
import { useGetSupervisorGradingComponents } from '@/utils/hooks/faculty/use-faculty-grading';
import { useGetModeratorGrades } from '@/utils/hooks/faculty/use-faculty-grading';
import { useGetModeratorGradingComponents } from '@/utils/hooks/faculty/use-faculty-grading';
import { useGradeComponentUpdate } from '@/utils/hooks/faculty/use-grade-component-update';
import { useToast } from '@/utils/hooks/use-toast';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Define the props interface
interface GradedComponentsViewProps {
	projectId: number;
	role: 'supervisor' | 'moderator';
	disabled?: boolean;
}

interface GradingComponent {
	isTeamBased: boolean;
	id: number;
	name: string;
	description: string;
	weight: number;
	max_score: number;
	component_type: string;
	is_team_based?: boolean;
}

interface GradeItem {
	componentId: number;
	studentId?: number;
	score: number;
	feedback?: string;
	gradedAt?: string;
}

interface StructuredGrades {
	studentGrades?: GradeItem[];
	teamGrades?: GradeItem[];
	feedback?: string;
	gradedAt?: string;
	gradingCompleted?: boolean;
}

// Loading state component
const LoadingState = () => (
	<div className="flex flex-col items-center justify-center py-12">
		<Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
		<p className="text-muted-foreground">Loading graded components...</p>
	</div>
);

// Component grade schema
const componentGradeSchema = z.object({
	score: z.coerce.number().min(0).max(100),
	comments: z.string().optional(),
});

export function GradedComponentsView({
	projectId,
	role,
	disabled = false,
}: GradedComponentsViewProps) {
	const router = useRouter();
	const { toast: _toast } = useToast();
	const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
	const [componentToUpdate, setComponentToUpdate] = useState<{
		component_id: number;
		student_id?: number;
		score: number;
		comments?: string;
	} | null>(null);

	// Fetch project details
	const { data: projectDetails, isLoading: isLoadingProject } = useGetProjectDetails(projectId);

	// Initialize hooks with conditional fetching based on role
	const { data: supervisorComponents = [], isLoading: isLoadingSupervisorComponents } =
		useGetSupervisorGradingComponents({
			enabled: role === 'supervisor',
		});

	const { data: moderatorComponents = [], isLoading: isLoadingModeratorComponents } =
		useGetModeratorGradingComponents({
			enabled: role === 'moderator',
		});

	// Only fetch supervisor grades if the role is supervisor
	const { data: supervisorGrades, isLoading: isLoadingSupervisorGrades } = useGetSupervisorGrades(
		role === 'supervisor' ? projectId : null
	);

	// Only fetch moderator grades if the role is moderator
	const { data: moderatorGrades, isLoading: isLoadingModeratorGrades } = useGetModeratorGrades(
		role === 'moderator' ? projectId : null
	);

	// Use the appropriate data based on role
	const components = role === 'supervisor' ? supervisorComponents : moderatorComponents;
	// Type cast the data to match the structured grades interface
	const grades: StructuredGrades =
		role === 'supervisor'
			? (supervisorGrades as unknown as StructuredGrades)
			: (moderatorGrades as unknown as StructuredGrades);
	const _isLoadingComponents =
		role === 'supervisor' ? isLoadingSupervisorComponents : isLoadingModeratorComponents;
	const _isLoadingGrades =
		role === 'supervisor' ? isLoadingSupervisorGrades : isLoadingModeratorGrades;

	// Debug: Print API results to console
	useEffect(() => {
		console.log('===== DEBUG: API RESULTS =====');
		console.log('Project Details:', projectDetails);
		console.log('Role:', role);

		if (role === 'supervisor') {
			console.log('Supervisor Components:', supervisorComponents);
			console.log('Supervisor Grades:', supervisorGrades);
		} else {
			console.log('Moderator Components:', moderatorComponents);
			console.log('Moderator Grades:', moderatorGrades);
		}

		console.log('===== END DEBUG =====');
	}, [
		projectDetails,
		supervisorComponents,
		supervisorGrades,
		moderatorComponents,
		moderatorGrades,
		role,
	]);

	// Use the grade component update hook
	const {
		editingComponentId,
		setEditingComponentId,
		isUpdating,
		updateSupervisorComponent,
		updateModeratorComponent,
	} = useGradeComponentUpdate({ projectId, type: role });

	// Setup form
	const form = useForm<z.infer<typeof componentGradeSchema>>({
		resolver: zodResolver(componentGradeSchema),
		defaultValues: {
			score: 0,
			comments: '',
		},
	});

	// Determine if data is still loading
	const isLoading =
		isLoadingProject ||
		(role === 'supervisor' && (isLoadingSupervisorComponents || isLoadingSupervisorGrades)) ||
		(role === 'moderator' && (isLoadingModeratorComponents || isLoadingModeratorGrades));

	// Function to find the grade for a specific component and student
	const findGrade = (componentId: number, studentId?: number) => {
		if (!grades) return undefined;

		if (studentId) {
			// For individual components, look in studentGrades
			return grades.studentGrades?.find(
				(grade: GradeItem) =>
					grade.componentId === componentId && grade.studentId === studentId
			);
		} else {
			// For team components, look in teamGrades
			return grades.teamGrades?.find((grade: GradeItem) => grade.componentId === componentId);
		}
	};

	// Function to check if grades exist
	const checkIfGraded = () => {
		return !!grades?.gradedAt;
	};

	// Function to handle edit button click
	const handleEditClick = (component: GradingComponent, studentId?: number) => {
		console.log('Edit button clicked for:', {
			component_id: component.id,
			student_id: studentId,
			component_name: component.name,
		});

		// Log the current editingComponentId state
		console.log('Current editingComponentId:', editingComponentId);

		// Get the existing grade if any
		const existingGrade = findGrade(component.id, studentId);
		console.log('Existing grade:', existingGrade);

		// If there's an existing grade, populate the form with its values
		if (existingGrade) {
			form.reset({
				score: existingGrade.score,
				comments: existingGrade.feedback,
			});
		} else {
			// Otherwise reset to default values
			form.reset({
				score: 0,
				comments: '',
			});
		}

		// Create the new editingComponentId
		const newEditingId = studentId ? `${component.id}-${studentId}` : `${component.id}`;
		console.log('Setting editingComponentId to:', newEditingId);

		setEditingComponentId(newEditingId);
	};

	// Function to handle form submission
	const onSubmit = (values: z.infer<typeof componentGradeSchema>) => {
		// Determine if we're editing a team or individual component
		const isIndividualComponent = editingComponentId?.toString().includes('-');
		console.log('Form submission - editingComponentId:', editingComponentId);
		console.log('Is individual component:', isIndividualComponent);

		if (isIndividualComponent && editingComponentId) {
			// Parse the component ID and student ID from the composite ID
			const [componentId, studentId] = editingComponentId.split('-').map(Number);
			const updatePayload = {
				component_id: componentId,
				student_id: studentId,
				score: values.score,
				comments: values.comments || '', // Handle null/undefined with empty string
			};

			console.log('Individual component update payload:', updatePayload);
			setComponentToUpdate({
				component_id: updatePayload.component_id,
				student_id: updatePayload.student_id,
				score: updatePayload.score,
				comments: updatePayload.comments,
			});
		} else {
			const updatePayload = {
				component_id: parseInt(editingComponentId as string),
				score: values.score,
				comments: values.comments || '', // Always send empty string for comments
			};

			console.log('Team component update payload:', updatePayload);
			setComponentToUpdate({
				component_id: updatePayload.component_id,
				score: updatePayload.score,
				comments: updatePayload.comments,
			});
		}

		setConfirmDialogOpen(true);
	};

	// Function to confirm update
	const confirmUpdate = () => {
		if (!componentToUpdate) return;

		console.log('Confirming update with payload:', componentToUpdate);

		if (role === 'supervisor') {
			updateSupervisorComponent(componentToUpdate);
		} else {
			// For moderator, make sure we omit student_id if it's present
			const { student_id: _student_id, ...moderatorPayload } = componentToUpdate;
			updateModeratorComponent(moderatorPayload);
		}

		setConfirmDialogOpen(false);
		setComponentToUpdate(null);
	};

	// Function to cancel edit
	const cancelEdit = () => {
		setEditingComponentId(null);
		form.reset();
	};

	// Set grade update disabled status
	const [isGradeUpdateDisabled, setIsGradeUpdateDisabled] = useState(false);

	useEffect(() => {
		// Disable grade updates if:
		// 1. External disabled prop is true (grading period inactive)
		// 2. Grades are locked/completed
		// 3. Still loading components or grades
		const isComponentsLoading =
			role === 'supervisor' ? isLoadingSupervisorComponents : isLoadingModeratorComponents;
		const isGradesLoading =
			role === 'supervisor' ? isLoadingSupervisorGrades : isLoadingModeratorGrades;
		const gradesData = role === 'supervisor' ? supervisorGrades : moderatorGrades;

		// Check if grades are completed based on the first item's locked status or some other logic
		const areGradesCompleted =
			gradesData && gradesData.length > 0 ? gradesData[0]?.is_locked : false;

		setIsGradeUpdateDisabled(
			disabled || areGradesCompleted || false || isComponentsLoading || isGradesLoading
		);
	}, [
		role,
		isLoadingSupervisorComponents,
		isLoadingModeratorComponents,
		isLoadingSupervisorGrades,
		isLoadingModeratorGrades,
		supervisorGrades,
		moderatorGrades,
		disabled,
	]);

	// Return loading state if data is still loading
	if (isLoading) {
		return <LoadingState />;
	}

	// Get team and individual components with correct property names
	let teamComponents: Array<GradingComponent> = [];
	let individualComponents: Array<GradingComponent> = [];

	if (components && Array.isArray(components)) {
		// Check which property name is used for team-based flag
		const hasIsTeamBased = components.length > 0 && 'isTeamBased' in components[0];

		if (hasIsTeamBased) {
			teamComponents = components.filter((component) => component.isTeamBased === true);
			individualComponents = components.filter(
				(component) => component.isTeamBased === false
			);
		} else {
			// Fallback to other properties if isTeamBased is not available
			teamComponents = components.filter(
				(component) =>
					component.component_type?.toLowerCase().includes('team') ||
					component.name?.toLowerCase().includes('team')
			);
			individualComponents = components.filter(
				(component) =>
					component.component_type?.toLowerCase().includes('individual') ||
					component.name?.toLowerCase().includes('individual')
			);
		}
	}

	// Use the correct typing for gradedAt property
	const formatGradedDate = () => {
		if (!grades?.gradedAt) return 'Not graded yet';
		return new Date(grades.gradedAt).toLocaleString();
	};

	const lastUpdateTimestamp = formatGradedDate();

	return (
		<div className="space-y-8">
			<div className="flex items-center justify-between">
				<div>
					<Button
						variant="outline"
						size="sm"
						className="mb-4"
						onClick={() => router.back()}
					>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Evaluation
					</Button>
					<h2 className="text-3xl font-bold tracking-tight">
						Graded Components
						<Badge className="ml-3 text-sm" variant="outline">
							{role === 'supervisor' ? 'Supervisor' : 'Moderator'}
						</Badge>
					</h2>
					<p className="text-muted-foreground mt-1">
						Review and edit grades for {projectDetails?.title}
					</p>
				</div>

				{lastUpdateTimestamp && (
					<div className="text-sm text-muted-foreground flex items-center">
						<Clock className="h-4 w-4 mr-1" />
						Last updated: {lastUpdateTimestamp}
					</div>
				)}
			</div>

			{/* Status Alert */}
			<Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
				<Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
				<AlertTitle className="text-base font-semibold">
					Editing Graded Components
				</AlertTitle>
				<AlertDescription>
					<p>
						You can edit any graded component by clicking the &apos;Edit&apos; button.
						Your changes will be saved immediately after confirmation.
					</p>
				</AlertDescription>
			</Alert>

			<Tabs defaultValue="team" className="w-full">
				<TabsList className="grid w-full max-w-md grid-cols-2">
					<TabsTrigger value="team">Team Components</TabsTrigger>
					<TabsTrigger value="individual">Individual Components</TabsTrigger>
				</TabsList>

				{/* Team Components Tab */}
				<TabsContent value="team" className="space-y-6 mt-6">
					{teamComponents.length === 0 ? (
						<Alert>
							<Info className="h-4 w-4" />
							<AlertTitle>No team components</AlertTitle>
							<AlertDescription>
								There are no team components available for this project.
							</AlertDescription>
						</Alert>
					) : (
						<div className="grid gap-6">
							{teamComponents.map((component) => {
								const grade = findGrade(component.id);
								const isEditing = editingComponentId === `${component.id}`;
								const hasGrade = checkIfGraded();
								// Use weighting property if weight is not available
								const weightValue = component.weight || 0;

								return (
									<Card
										key={component.id}
										className={
											hasGrade
												? 'border-2 border-green-500 dark:border-green-600'
												: ''
										}
									>
										<CardHeader className="pb-2">
											<div className="flex justify-between items-start">
												<CardTitle>
													{component.name} ({weightValue}%)
													{hasGrade && (
														<Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 font-medium">
															Graded
														</Badge>
													)}
												</CardTitle>

												{!isEditing && (
													<TooltipProvider>
														<Tooltip>
															<TooltipTrigger asChild>
																<Button
																	variant="outline"
																	size="sm"
																	className={
																		hasGrade
																			? 'border-green-500 hover:bg-green-50 dark:border-green-600 dark:hover:bg-green-900/20'
																			: ''
																	}
																	onClick={() =>
																		handleEditClick(component)
																	}
																	disabled={
																		isGradeUpdateDisabled ||
																		isUpdating
																	}
																>
																	<Edit className="h-4 w-4 mr-1" />
																	{hasGrade ? 'Edit' : 'Grade'}
																</Button>
															</TooltipTrigger>
															<TooltipContent>
																<p>
																	{hasGrade
																		? 'Edit this component grade'
																		: 'Grade this component'}
																</p>
															</TooltipContent>
														</Tooltip>
													</TooltipProvider>
												)}
											</div>
											<CardDescription>
												{component.description}
											</CardDescription>
										</CardHeader>

										<CardContent>
											{isEditing ? (
												<Form {...form}>
													<form
														onSubmit={form.handleSubmit(onSubmit)}
														className="space-y-4"
													>
														<FormField
															control={form.control}
															name="score"
															render={({ field }) => (
																<FormItem>
																	<FormLabel>
																		Score (out of{' '}
																		{component.max_score || 100}
																		)
																	</FormLabel>
																	<FormControl>
																		<Input
																			type="number"
																			{...field}
																			min={0}
																			max={
																				component.max_score ||
																				100
																			}
																			step={0.1}
																		/>
																	</FormControl>
																	<FormDescription>
																		Enter a score between 0 and{' '}
																		{component.max_score || 100}
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
																		<Input
																			type="text"
																			{...field}
																		/>
																	</FormControl>
																	<FormDescription>
																		Enter any additional
																		comments for this grade.
																	</FormDescription>
																	<FormMessage />
																</FormItem>
															)}
														/>

														<div className="flex justify-end gap-2">
															<Button
																type="button"
																variant="outline"
																onClick={cancelEdit}
															>
																Cancel
															</Button>
															<Button
																type="submit"
																disabled={
																	isGradeUpdateDisabled ||
																	isUpdating
																}
															>
																{isUpdating && (
																	<Loader2 className="mr-2 h-4 w-4 animate-spin" />
																)}
																Save Changes
															</Button>
														</div>
													</form>
												</Form>
											) : (
												<div className="space-y-4">
													{hasGrade ? (
														<>
															<div>
																<h3 className="text-sm font-medium mb-1">
																	Score
																</h3>
																<p className="text-2xl font-bold">
																	{grade?.score ?? 0} /{' '}
																	{component.max_score || 100}
																	<span className="text-base font-normal text-muted-foreground ml-2">
																		(
																		{(
																			((grade?.score ?? 0) /
																				(component.max_score ||
																					100)) *
																			100
																		).toFixed(1)}
																		%)
																	</span>
																</p>
															</div>

															{grades && grades.gradedAt && (
																<div className="text-xs text-muted-foreground flex items-center mt-4 pt-4 border-t">
																	<Clock className="h-3 w-3 mr-1" />
																	Graded on {formatGradedDate()}
																</div>
															)}
														</>
													) : (
														<div className="py-4 text-center text-muted-foreground">
															<p>
																This component has not been graded
																yet.
															</p>
															<Button
																variant="outline"
																size="sm"
																className="mt-2"
																onClick={() =>
																	handleEditClick(component)
																}
																disabled={
																	isGradeUpdateDisabled ||
																	isUpdating
																}
															>
																<Edit className="h-4 w-4 mr-1" />
																Grade now
															</Button>
														</div>
													)}
												</div>
											)}
										</CardContent>
									</Card>
								);
							})}
						</div>
					)}
				</TabsContent>

				{/* Individual Components Tab */}
				<TabsContent value="individual" className="space-y-6 mt-6">
					{individualComponents.length === 0 ? (
						<Alert>
							<Info className="h-4 w-4" />
							<AlertTitle>No individual components</AlertTitle>
							<AlertDescription>
								There are no individual components available for this project.
							</AlertDescription>
						</Alert>
					) : (
						<div className="grid gap-6">
							{individualComponents.map((component) => {
								// Use weighting property if weight is not available
								const weightValue = component.weight || 0;

								return (
									<Card key={component.id}>
										<CardHeader>
											<CardTitle>
												{component.name} ({weightValue}%)
											</CardTitle>
											<CardDescription>
												{component.description}
											</CardDescription>
										</CardHeader>

										<CardContent>
											{!projectDetails?.team_members ||
											projectDetails.team_members.length === 0 ? (
												<Alert>
													<AlertCircle className="h-4 w-4" />
													<AlertTitle>No students</AlertTitle>
													<AlertDescription>
														There are no students assigned to this
														project.
													</AlertDescription>
												</Alert>
											) : (
												<div className="space-y-6">
													{projectDetails.team_members.map((student) => {
														const studentId = student.student_id;
														const grade = findGrade(
															component.id,
															studentId
														);
														const hasGrade = !!grade;
														const compositeKey = `${component.id}-${studentId}`;

														return (
															<Card
																key={`${component.id}-${studentId}`}
																className={
																	hasGrade
																		? 'border-2 border-green-500 dark:border-green-600'
																		: 'border border-gray-200 dark:border-gray-800'
																}
															>
																<CardHeader className="pb-2">
																	<div className="flex justify-between items-start">
																		<CardTitle className="text-lg">
																			{student.name}
																			<div className="text-sm font-normal text-muted-foreground mt-1">
																				Matric:{' '}
																				{
																					student.matriculation_number
																				}
																			</div>
																			{hasGrade && (
																				<Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 font-medium">
																					Graded
																				</Badge>
																			)}
																		</CardTitle>

																		{!editingComponentId ||
																		editingComponentId !==
																			compositeKey ? (
																			<TooltipProvider>
																				<Tooltip>
																					<TooltipTrigger
																						asChild
																					>
																						<Button
																							variant="outline"
																							size="sm"
																							className={
																								hasGrade
																									? 'border-green-500 hover:bg-green-50 dark:border-green-600 dark:hover:bg-green-900/20'
																									: ''
																							}
																							onClick={() =>
																								handleEditClick(
																									component,
																									studentId
																								)
																							}
																							disabled={
																								isGradeUpdateDisabled ||
																								isUpdating
																							}
																						>
																							<Edit className="h-4 w-4 mr-1" />
																							{hasGrade
																								? 'Edit'
																								: 'Grade'}
																						</Button>
																					</TooltipTrigger>
																					<TooltipContent>
																						<p>
																							{hasGrade
																								? "Edit this student's grade"
																								: 'Grade this student'}
																						</p>
																					</TooltipContent>
																				</Tooltip>
																			</TooltipProvider>
																		) : null}
																	</div>
																</CardHeader>

																<CardContent>
																	{editingComponentId ===
																	compositeKey ? (
																		<Form {...form}>
																			<form
																				onSubmit={form.handleSubmit(
																					onSubmit
																				)}
																				className="space-y-4"
																			>
																				<FormField
																					control={
																						form.control
																					}
																					name="score"
																					render={({
																						field,
																					}) => (
																						<FormItem>
																							<FormLabel>
																								Score
																								(out
																								of{' '}
																								{component.max_score ||
																									100}
																								)
																							</FormLabel>
																							<FormControl>
																								<Input
																									type="number"
																									{...field}
																									min={
																										0
																									}
																									max={
																										component.max_score ||
																										100
																									}
																									step={
																										0.1
																									}
																								/>
																							</FormControl>
																							<FormDescription>
																								Enter
																								a
																								score
																								between
																								0
																								and{' '}
																								{component.max_score ||
																									100}
																							</FormDescription>
																							<FormMessage />
																						</FormItem>
																					)}
																				/>

																				<FormField
																					control={
																						form.control
																					}
																					name="comments"
																					render={({
																						field,
																					}) => (
																						<FormItem>
																							<FormLabel>
																								Comments
																							</FormLabel>
																							<FormControl>
																								<Input
																									type="text"
																									{...field}
																								/>
																							</FormControl>
																							<FormDescription>
																								Enter
																								any
																								additional
																								comments
																								for
																								this
																								grade.
																							</FormDescription>
																							<FormMessage />
																						</FormItem>
																					)}
																				/>

																				<div className="flex justify-end gap-2">
																					<Button
																						type="button"
																						variant="outline"
																						onClick={
																							cancelEdit
																						}
																					>
																						Cancel
																					</Button>
																					<Button
																						type="submit"
																						disabled={
																							isGradeUpdateDisabled ||
																							isUpdating
																						}
																					>
																						{isUpdating && (
																							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
																						)}
																						Save Changes
																					</Button>
																				</div>
																			</form>
																		</Form>
																	) : (
																		<div className="space-y-4">
																			{hasGrade ? (
																				<>
																					<div>
																						<h3 className="text-sm font-medium mb-1">
																							Score
																						</h3>
																						<p className="text-2xl font-bold">
																							{grade?.score ??
																								0}{' '}
																							/{' '}
																							{component.max_score ||
																								100}
																							<span className="text-base font-normal text-muted-foreground ml-2">
																								(
																								{(
																									((grade?.score ??
																										0) /
																										(component.max_score ||
																											100)) *
																									100
																								).toFixed(
																									1
																								)}
																								%)
																							</span>
																						</p>
																					</div>

																					{grades &&
																						grades.gradedAt && (
																							<div className="text-xs text-muted-foreground flex items-center mt-2">
																								<Clock className="h-3 w-3 mr-1" />
																								Graded
																								on{' '}
																								{formatGradedDate()}
																							</div>
																						)}
																				</>
																			) : (
																				<div className="py-4 text-center text-muted-foreground">
																					<p>
																						This student
																						has not been
																						graded for
																						this
																						component
																						yet.
																					</p>
																					<Button
																						variant="outline"
																						size="sm"
																						className="mt-2"
																						onClick={() =>
																							handleEditClick(
																								component,
																								studentId
																							)
																						}
																						disabled={
																							isGradeUpdateDisabled ||
																							isUpdating
																						}
																					>
																						<Edit className="h-4 w-4 mr-1" />
																						Grade now
																					</Button>
																				</div>
																			)}
																		</div>
																	)}
																</CardContent>
															</Card>
														);
													})}
												</div>
											)}
										</CardContent>
									</Card>
								);
							})}
						</div>
					)}
				</TabsContent>
			</Tabs>

			{/* Confirmation Dialog */}
			<Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Confirm Grade Update</DialogTitle>
						<DialogDescription>
							Are you sure you want to update this grade? This action cannot be
							undone.
						</DialogDescription>
					</DialogHeader>

					<div className="py-4">
						<p className="font-medium">New Score: {componentToUpdate?.score}</p>
						<p className="font-medium">Comments: {componentToUpdate?.comments}</p>
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
							Cancel
						</Button>
						<Button onClick={confirmUpdate} disabled={isUpdating}>
							{isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Confirm Update
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

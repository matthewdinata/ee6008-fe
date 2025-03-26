'use client';

import { AlertCircle, CheckCircle2, Eye, Info, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { useGetProjectDetails } from '@/utils/hooks/faculty/use-faculty-get-project-details';
import { useGetFinalProjectGrades } from '@/utils/hooks/faculty/use-faculty-grading';

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

interface ComponentGrade {
	component_id?: number;
	componentId?: number;
	component_name?: string;
	componentName?: string;
	is_team_based?: boolean;
	isTeamBased?: boolean;
	weighting?: number;
	score?: number;
	graded_by?: string;
	gradedBy?: string;
}

interface StudentGrade {
	student_id: number;
	student_name: string;
	matric_number: string;
	supervisor_grade: number;
	moderator_grade: number;
	final_grade: number;
	letter_grade: string;
	component_grades: ComponentGrade[];
}

interface GradesSummary {
	project_id: number;
	project_title: string;
	supervisor_name: string;
	moderator_name: string;
	supervisor_feedback: string;
	moderator_feedback: string;
	supervisor_graded_at: string | null;
	moderator_graded_at: string | null;
	grading_completed: boolean;
	student_grades: StudentGrade[];
}

interface ProjectGradesSummaryProps {
	projectId: number;
}

interface GradesDataWithStudentGrades {
	studentGrades: Array<{
		studentId?: number;
		student_id?: number;
		studentName?: string;
		student_name?: string;
		matricNumber?: string;
		supervisorGrade?: number;
		supervisor_score?: number;
		moderatorGrade?: number;
		moderator_score?: number;
		finalGrade?: number;
		final_score?: number;
		letterGrade?: string;
		grade?: string;
		componentGrades?: Array<ComponentGrade>;
	}>;
	supervisorName?: string;
	moderatorName?: string;
	supervisorFeedback?: string;
	moderatorFeedback?: string;
	supervisorGradedAt?: string | null;
	moderatorGradedAt?: string | null;
	gradingCompleted?: boolean;
}

type GradesDataArray = Array<{
	student_id?: number;
	studentId?: number;
	student_name?: string;
	studentName?: string;
	matricNumber?: string;
	final_score?: number;
	finalGrade?: number;
	supervisor_score?: number;
	supervisorGrade?: number;
	moderator_score?: number;
	grade?: string;
	letterGrade?: string;
	componentGrades?: Array<ComponentGrade>;
}>;

export default function ProjectGradesSummary({ projectId }: ProjectGradesSummaryProps) {
	const [summary, setSummary] = useState<GradesSummary | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [userRole, setUserRole] = useState<{ isSupervisor: boolean; isModerator: boolean }>({
		isSupervisor: false,
		isModerator: false,
	});

	// Get user email from cookies
	const userEmail = useMemo(() => {
		if (typeof document !== 'undefined') {
			const cookies = document.cookie.split(';');

			// Try to find the user-email cookie first
			let email = '';
			for (const cookie of cookies) {
				const [key, value] = cookie.trim().split('=');
				if (key === 'user-email') {
					email = decodeURIComponent(value);
					break;
				}
				// Also check for just 'email' cookie
				if (key === 'email') {
					email = decodeURIComponent(value);
					break;
				}
			}

			return email;
		}
		return '';
	}, []);

	// Use hooks for fetching project grades and details
	const {
		data: gradesData,
		isLoading: isLoadingGrades,
		error: gradesError,
	} = useGetFinalProjectGrades(projectId);

	const {
		data: projectDetails,
		isLoading: isLoadingDetails,
		error: detailsError,
	} = useGetProjectDetails(projectId);

	// Determine overall loading state
	const isLoading = isLoadingGrades || isLoadingDetails;

	// Determine user role based on the project details
	useEffect(() => {
		if (projectDetails && typeof projectDetails === 'object' && userEmail) {
			console.log('Checking roles for user:', userEmail);

			// Check if user is supervisor (professor)
			// Handle both nested object structure and direct property access
			const professorEmail =
				projectDetails.professor?.email ||
				(projectDetails as { professor_email?: string }).professor_email;

			// Check if user is moderator
			// Handle both nested object structure and direct property access
			const moderatorEmail =
				projectDetails.moderator?.email ||
				(projectDetails as { moderator_email?: string }).moderator_email;

			console.log('Role check:', {
				userEmail,
				professorEmail,
				moderatorEmail,
				isSupervisor: professorEmail === userEmail,
				isModerator: moderatorEmail === userEmail,
			});

			// Compare emails
			const isSupervisor = professorEmail === userEmail;
			const isModerator = moderatorEmail === userEmail;

			setUserRole({ isSupervisor, isModerator });
		}
	}, [projectDetails, userEmail]);

	// Process the data when both grades and project details are available
	useEffect(() => {
		// Log the complete raw data structures
		console.log('Raw gradesData:', gradesData);
		console.log('Raw projectDetails:', projectDetails);

		if (!gradesData) {
			console.log('No grades data available');
			return;
		}

		// Determine if gradesData is an array or an object with studentGrades
		const isGradesArray = Array.isArray(gradesData);
		const hasStudentGradesProperty =
			!isGradesArray &&
			typeof gradesData === 'object' &&
			gradesData !== null &&
			'studentGrades' in gradesData;

		// Get the actual student grades array based on the structure
		const studentGradesArray = isGradesArray
			? (gradesData as GradesDataArray)
			: hasStudentGradesProperty &&
				  Array.isArray((gradesData as GradesDataWithStudentGrades).studentGrades)
				? (gradesData as GradesDataWithStudentGrades).studentGrades
				: [];

		console.log('Data Processing Effect:', {
			hasGradesData: !!gradesData,
			gradesDataType: typeof gradesData,
			isGradesArray,
			hasStudentGradesProperty,
			studentGradesCount: studentGradesArray.length,
			hasProjectDetails: !!projectDetails,
			projectDetailsType: projectDetails ? typeof projectDetails : 'null',
		});

		// If we have studentGrades, log the first one to see its structure
		if (studentGradesArray.length > 0) {
			console.log('First studentGrade item:', studentGradesArray[0]);
		}

		if (studentGradesArray.length > 0 && projectDetails && typeof projectDetails === 'object') {
			const typedGradesData = gradesData as GradesDataWithStudentGrades | GradesDataArray;

			console.log('Creating summary with data:', {
				projectTitle: projectDetails.title || 'Untitled Project',
				supervisorName: isGradesArray
					? projectDetails.professor && projectDetails.professor.name
					: (typedGradesData as GradesDataWithStudentGrades).supervisorName ||
						(projectDetails.professor && projectDetails.professor.name),
				moderatorName: isGradesArray
					? projectDetails.moderator && projectDetails.moderator.name
					: (typedGradesData as GradesDataWithStudentGrades).moderatorName ||
						(projectDetails.moderator && projectDetails.moderator.name),
				teamMembersCount: Array.isArray(projectDetails.team_members)
					? projectDetails.team_members.length
					: 0,
				studentGradesCount: studentGradesArray.length,
			});

			// Create a summary from the available data
			const transformedData: GradesSummary = {
				project_id: projectId,
				project_title: projectDetails.title || 'Untitled Project',
				supervisor_name: isGradesArray
					? (projectDetails.professor && projectDetails.professor.name) || 'Not Assigned'
					: (typedGradesData as GradesDataWithStudentGrades).supervisorName ||
						(projectDetails.professor && projectDetails.professor.name) ||
						'Not Assigned',
				moderator_name: isGradesArray
					? (projectDetails.moderator && projectDetails.moderator.name) || 'Not Assigned'
					: (typedGradesData as GradesDataWithStudentGrades).moderatorName ||
						(projectDetails.moderator && projectDetails.moderator.name) ||
						'Not Assigned',
				supervisor_feedback: isGradesArray
					? ''
					: (typedGradesData as GradesDataWithStudentGrades).supervisorFeedback || '',
				moderator_feedback: isGradesArray
					? ''
					: (typedGradesData as GradesDataWithStudentGrades).moderatorFeedback || '',
				supervisor_graded_at: isGradesArray
					? null
					: (typedGradesData as GradesDataWithStudentGrades).supervisorGradedAt || null,
				moderator_graded_at: isGradesArray
					? null
					: (typedGradesData as GradesDataWithStudentGrades).moderatorGradedAt || null,
				grading_completed: isGradesArray
					? studentGradesArray.some(
							(grade) =>
								(typeof grade.final_score === 'number' && grade.final_score > 0) ||
								(typeof grade.finalGrade === 'number' && grade.finalGrade > 0)
						)
					: (typedGradesData as GradesDataWithStudentGrades).gradingCompleted || false,
				student_grades: studentGradesArray.map(
					(
						grade: GradesDataWithStudentGrades['studentGrades'][0] | GradesDataArray[0]
					) => {
						// Find the corresponding team member for this student
						const studentId = grade.studentId || grade.student_id || 0;
						const teamMember = Array.isArray(projectDetails.team_members)
							? projectDetails.team_members.find(
									(member) => member && member.student_id === studentId
								)
							: undefined;

						// Log each student grade mapping for debugging
						console.log('Mapping student grade:', {
							rawGrade: grade,
							foundTeamMember: !!teamMember,
							teamMemberDetails: teamMember,
							mappedStudentId: studentId,
							mappedStudentName:
								grade.studentName ||
								grade.student_name ||
								(teamMember && teamMember.name) ||
								'Student',
							mappedMatricNumber:
								grade.matricNumber ||
								(teamMember && teamMember.matriculation_number) ||
								'',
						});

						return {
							student_id: studentId,
							student_name:
								grade.studentName ||
								grade.student_name ||
								(teamMember && teamMember.name) ||
								'Student',
							matric_number:
								grade.matricNumber ||
								(teamMember && teamMember.matriculation_number) ||
								'',
							supervisor_grade: grade.supervisorGrade || grade.supervisor_score || 0,
							moderator_grade: grade.moderator_score || 0,
							final_grade: grade.finalGrade || grade.final_score || 0,
							letter_grade:
								grade.letterGrade ||
								grade.grade ||
								getLetterGrade(grade.finalGrade || grade.final_score || 0),
							component_grades: Array.isArray(grade.componentGrades)
								? grade.componentGrades.map((component: ComponentGrade) => ({
										component_id:
											component.componentId || component.component_id || 0,
										component_name:
											component.componentName ||
											component.component_name ||
											'Unknown Component',
										is_team_based:
											typeof component.isTeamBased === 'boolean'
												? component.isTeamBased
												: typeof component.is_team_based === 'boolean'
													? component.is_team_based
													: false,
										weighting: component.weighting || 0,
										score: component.score || 0,
										graded_by:
											component.gradedBy || component.graded_by || 'Unknown',
									}))
								: [],
						};
					}
				),
			};

			console.log('Summary created successfully:', {
				projectId: transformedData.project_id,
				projectTitle: transformedData.project_title,
				studentGradesCount: transformedData.student_grades.length,
			});

			setSummary(transformedData);
		} else {
			console.log('Cannot create summary, conditions not met:', {
				gradesDataExists: !!gradesData,
				isGradesArray,
				hasStudentGradesProperty,
				studentGradesCount: studentGradesArray.length,
				projectDetailsExists: !!projectDetails,
				projectDetailsIsObject: projectDetails && typeof projectDetails === 'object',
			});
		}
	}, [gradesData, projectDetails, projectId]);

	// Add these logs right after your hooks
	useEffect(() => {
		console.log('API Data:', {
			gradesData,
			gradesDataLength: gradesData?.length || 0,
			projectDetails,
			isLoadingGrades,
			isLoadingDetails,
			gradesError,
			detailsError,
		});
	}, [gradesData, projectDetails, isLoadingGrades, isLoadingDetails, gradesError, detailsError]);

	// Also add a log before rendering to see what's actually being rendered
	console.log('Render state:', {
		isLoading,
		hasError: !!error,
		hasSummary: !!summary,
		errorMessage: error,
		summaryStudentCount: summary?.student_grades?.length,
	});

	// Set error from hooks
	useEffect(() => {
		if (gradesError) {
			setError('Failed to load grades summary');
		} else if (detailsError) {
			setError('Failed to load project details');
		} else {
			setError(null);
		}
	}, [gradesError, detailsError]);

	// Helper to get letter grade based on score
	const getLetterGrade = (score: number): string => {
		if (score >= 85) return 'A+';
		if (score >= 80) return 'A';
		if (score >= 75) return 'A-';
		if (score >= 70) return 'B+';
		if (score >= 65) return 'B';
		if (score >= 60) return 'B-';
		if (score >= 55) return 'C+';
		if (score >= 50) return 'C';
		if (score >= 45) return 'D+';
		if (score >= 40) return 'D';
		return 'F';
	};

	// Helper to get color class based on grade
	const getGradeColor = (grade: number): string => {
		if (grade >= 85) return 'text-green-600';
		if (grade >= 70) return 'text-blue-600';
		if (grade >= 60) return 'text-amber-600';
		if (grade >= 50) return 'text-orange-600';
		return 'text-red-600';
	};

	if (isLoading) {
		return (
			<div className="flex justify-center items-center min-h-[40vh]">
				<div className="flex flex-col items-center gap-2">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<p className="text-sm text-muted-foreground">Loading grades summary...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<Alert variant="destructive">
				<AlertCircle className="h-4 w-4" />
				<AlertTitle>Error</AlertTitle>
				<AlertDescription>{error}</AlertDescription>
			</Alert>
		);
	}

	if (!summary) {
		return (
			<Alert>
				<Info className="h-4 w-4" />
				<AlertTitle>No Grades Available</AlertTitle>
				<AlertDescription>
					No grades have been submitted for this project yet.
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Grading Summary</CardTitle>
					<CardDescription>Overall project grade summary and breakdown</CardDescription>
				</CardHeader>
				<CardContent>
					{/* Grading Status */}
					<Alert
						className={
							summary.grading_completed ? 'bg-green-50 mb-6' : 'bg-amber-50 mb-6'
						}
					>
						{summary.grading_completed ? (
							<CheckCircle2 className="h-4 w-4 text-green-600" />
						) : (
							<Info className="h-4 w-4 text-amber-600" />
						)}
						<AlertTitle>
							{summary.grading_completed
								? 'Assessment Complete'
								: 'Assessment In Progress'}
						</AlertTitle>
						<AlertDescription>
							{summary.grading_completed
								? 'Both supervisor and moderator have completed assessment for this project.'
								: 'Assessment is still in progress for this project.'}
						</AlertDescription>
					</Alert>

					{/* Assessment Timeline */}
					<div className="mb-6">
						<h3 className="text-lg font-medium mb-2">Assessment Timeline</h3>
						<div className="space-y-4">
							{/* Supervisor Assessment */}
							<div className="flex items-start justify-between border-b pb-4">
								<div>
									<div className="flex items-center gap-2">
										<h4 className="font-medium">Supervisor Assessment</h4>
										{summary.supervisor_graded_at &&
											summary.supervisor_graded_at !== null &&
											!isNaN(
												new Date(summary.supervisor_graded_at).getTime()
											) &&
											new Date(summary.supervisor_graded_at).getFullYear() >
												1970 && (
												<Badge
													variant="outline"
													className="bg-green-50 text-green-700"
												>
													Graded
												</Badge>
											)}
									</div>
									<p className="text-sm text-muted-foreground">
										Supervisor: {summary.supervisor_name}
									</p>
									{summary.supervisor_graded_at &&
										summary.supervisor_graded_at !== null &&
										!isNaN(new Date(summary.supervisor_graded_at).getTime()) &&
										new Date(summary.supervisor_graded_at).getFullYear() >
											1970 && (
											<p className="text-xs text-muted-foreground mt-1">
												Graded on:{' '}
												{new Date(
													summary.supervisor_graded_at
												).toLocaleString()}
											</p>
										)}
								</div>
								<div className="flex items-center gap-2">
									{summary.supervisor_graded_at &&
										summary.supervisor_graded_at !== null &&
										!isNaN(new Date(summary.supervisor_graded_at).getTime()) &&
										new Date(summary.supervisor_graded_at).getFullYear() >
											1970 &&
										userRole.isSupervisor && (
											<Button
												variant="outline"
												size="sm"
												className="border-green-500 hover:bg-green-50 dark:border-green-600 dark:hover:bg-green-900/20"
												onClick={() =>
													(window.location.href = `/faculty/grade/evaluation/${projectId}/graded-components?role=supervisor`)
												}
											>
												<Eye className="h-4 w-4 mr-1" />
												View Graded Components
											</Button>
										)}
								</div>
							</div>

							{/* Moderator Assessment */}
							<div className="flex items-start justify-between">
								<div>
									<div className="flex items-center gap-2">
										<h4 className="font-medium">Moderator Assessment</h4>
										{summary.moderator_graded_at &&
											summary.moderator_graded_at !== null &&
											!isNaN(
												new Date(summary.moderator_graded_at).getTime()
											) &&
											new Date(summary.moderator_graded_at).getFullYear() >
												1970 && (
												<Badge
													variant="outline"
													className="bg-green-50 text-green-700"
												>
													Graded
												</Badge>
											)}
									</div>
									<p className="text-sm text-muted-foreground">
										Moderator: {summary.moderator_name}
									</p>
									{summary.moderator_graded_at &&
										summary.moderator_graded_at !== null &&
										!isNaN(new Date(summary.moderator_graded_at).getTime()) &&
										new Date(summary.moderator_graded_at).getFullYear() >
											1970 && (
											<p className="text-xs text-muted-foreground mt-1">
												Graded on:{' '}
												{new Date(
													summary.moderator_graded_at
												).toLocaleString()}
											</p>
										)}
								</div>
								<div className="flex items-center gap-2">
									{summary.moderator_graded_at &&
										summary.moderator_graded_at !== null &&
										!isNaN(new Date(summary.moderator_graded_at).getTime()) &&
										new Date(summary.moderator_graded_at).getFullYear() >
											1970 &&
										userRole.isModerator && (
											<Button
												variant="outline"
												size="sm"
												className="border-green-500 hover:bg-green-50 dark:border-green-600 dark:hover:bg-green-900/20"
												onClick={() =>
													(window.location.href = `/faculty/grade/evaluation/${projectId}/graded-components?role=moderator`)
												}
											>
												<Eye className="h-4 w-4 mr-1" />
												View Graded Components
											</Button>
										)}
								</div>
							</div>
						</div>
					</div>

					{/* Student Grades Table */}
					<div className="mb-6">
						<h3 className="text-lg font-medium mb-2">Student Grades</h3>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Student</TableHead>
									<TableHead>Matric Number</TableHead>
									{(userRole.isSupervisor ||
										(!userRole.isSupervisor && !userRole.isModerator)) && (
										<TableHead className="text-right">
											Supervisor Grade
										</TableHead>
									)}
									{(userRole.isModerator ||
										(!userRole.isSupervisor && !userRole.isModerator)) && (
										<TableHead className="text-right">
											Moderator Grade
										</TableHead>
									)}
									<TableHead className="text-center">Letter Grade</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{summary.student_grades.map((student) => (
									<TableRow key={student.student_id}>
										<TableCell className="font-medium">
											{student.student_name}
										</TableCell>
										<TableCell>{student.matric_number}</TableCell>
										{(userRole.isSupervisor ||
											(!userRole.isSupervisor && !userRole.isModerator)) && (
											<TableCell className="text-right">
												<div className="flex flex-col gap-1">
													<span>
														{student.supervisor_grade.toFixed(1)}
													</span>
													<Progress
														value={student.supervisor_grade}
														className="h-1"
													/>
												</div>
											</TableCell>
										)}
										{(userRole.isModerator ||
											(!userRole.isSupervisor && !userRole.isModerator)) && (
											<TableCell className="text-right">
												<div className="flex flex-col gap-1">
													<span>
														{student.moderator_grade.toFixed(1)}
													</span>
													<Progress
														value={student.moderator_grade}
														className="h-1"
													/>
												</div>
											</TableCell>
										)}
										<TableCell className="text-center">
											<Badge
												variant="outline"
												className={`font-bold ${getGradeColor(student.final_grade)}`}
											>
												{student.letter_grade}
											</Badge>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>

					{/* Detailed Breakdown Accordion */}
					<div>
						<h3 className="text-lg font-medium mb-2">Detailed Breakdown</h3>
						{/* For moderators who are not also supervisors, or for admins, show simplified view with just two components */}
						{(userRole.isModerator && !userRole.isSupervisor) ||
						(!userRole.isModerator && !userRole.isSupervisor) ? (
							<Card className="mb-4">
								<CardHeader>
									<CardTitle className="text-base">
										Team Grade Components
									</CardTitle>
									<CardDescription>
										Overall team grade components assigned by moderator
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{(() => {
											// Get the first student's component grades
											const componentGrades =
												summary.student_grades[0]?.component_grades || [];

											// Filter for moderator components
											const moderatorComponents = componentGrades.filter(
												(grade) =>
													grade.graded_by
														?.toLowerCase()
														.includes('moderator') &&
													grade.is_team_based
											);

											// If no moderator components found, show placeholder message
											if (moderatorComponents.length === 0) {
												return (
													<div className="text-sm text-muted-foreground">
														No moderator grade components found for this
														project.
													</div>
												);
											}

											// Calculate total weighted score (this is the sum of each component's weighted score)
											const totalWeightedScore = moderatorComponents.reduce(
												(total, component) =>
													total +
													((component.score || 0) *
														(component.weighting || 0)) /
														100,
												0
											);

											// Calculate total weighting
											const totalWeighting = moderatorComponents.reduce(
												(total, component) =>
													total + (component.weighting || 0),
												0
											);

											// Calculate the overall grade out of 100 based on component scores
											// This should match what's shown in your example: (100*15 + 30*15)/(15+15) = 65
											const calculatedGrade =
												totalWeighting > 0
													? (totalWeightedScore / totalWeighting) * 100
													: 0;

											// Calculate what this contributes to the final grade (e.g., 65 * 30% = 19.5)
											const moderatorContribution =
												(calculatedGrade * 30) / 100;

											return (
												<>
													<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
														{moderatorComponents.map((component) => {
															// Calculate what percentage of the total moderator weight this component represents
															const percentOfModeratorTotal =
																totalWeighting > 0
																	? ((component.weighting || 0) /
																			totalWeighting) *
																		30
																	: 0;

															// Calculate the weighted score as a percentage of the total moderator weight
															const weightedScoreOfTotal =
																((component.score || 0) *
																	percentOfModeratorTotal) /
																100;

															return (
																<div
																	key={component.component_id}
																	className="border rounded-lg p-4"
																>
																	<div className="flex justify-between items-center mb-2">
																		<h4 className="font-medium">
																			{
																				component.component_name
																			}
																		</h4>
																		<div className="text-right">
																			<span>
																				{(
																					component.score ||
																					0
																				).toFixed(1)}
																			</span>
																			<span className="text-sm text-muted-foreground ml-1">
																				/ 100
																			</span>
																		</div>
																	</div>
																	<Progress
																		value={component.score || 0}
																		className="h-2"
																	/>
																	<div className="flex flex-col space-y-1 mt-2">
																		<div className="flex justify-between">
																			<p className="text-sm text-muted-foreground">
																				{
																					component.weighting
																				}
																				% of overall grade
																			</p>
																			<p className="text-sm">
																				{percentOfModeratorTotal.toFixed(
																					1
																				)}
																				% of 30%
																			</p>
																		</div>
																		<div className="flex justify-between">
																			<p className="text-sm">
																				Weighted:{' '}
																				<span>
																					{(
																						((component.score ||
																							0) *
																							(component.weighting ||
																								0)) /
																						100
																					).toFixed(1)}
																				</span>
																			</p>
																			<p className="text-sm">
																				<span>
																					{weightedScoreOfTotal.toFixed(
																						1
																					)}
																					%
																				</span>{' '}
																				of 30%
																			</p>
																		</div>
																	</div>
																</div>
															);
														})}
													</div>

													<div className="flex flex-col space-y-2">
														<div className="flex justify-between items-center p-3 bg-muted rounded-lg">
															<h4 className="font-medium">
																Overall Team Grade
															</h4>
															<div className="text-right">
																<div>
																	<span className="font-bold">
																		{calculatedGrade.toFixed(1)}
																	</span>
																	<span className="text-sm text-muted-foreground ml-1">
																		/ 100
																	</span>
																</div>
																<div className="text-sm">
																	<span>
																		{moderatorContribution.toFixed(
																			1
																		)}
																	</span>{' '}
																	of 30% total
																</div>
															</div>
														</div>
													</div>
												</>
											);
										})()}
									</div>
								</CardContent>
							</Card>
						) : (
							<Accordion type="single" collapsible className="w-full">
								{summary.student_grades.map((student) => (
									<AccordionItem
										key={student.student_id}
										value={`student-${student.student_id}`}
									>
										<AccordionTrigger>
											{student.student_name} - Grade Breakdown
										</AccordionTrigger>
										<AccordionContent>
											<Table>
												<TableHeader>
													<TableRow>
														<TableHead>Component</TableHead>
														<TableHead>Weighting</TableHead>
														<TableHead>Score</TableHead>
														<TableHead>Graded By</TableHead>
														<TableHead>Type</TableHead>
													</TableRow>
												</TableHeader>
												<TableBody>
													{student.component_grades
														.filter((grade) => {
															// If user is both supervisor and moderator, show all components
															if (
																userRole.isSupervisor &&
																userRole.isModerator
															) {
																return true;
															}

															// Filter components based on user role
															const gradedBySupervisor =
																grade.graded_by?.toLowerCase() ===
																'supervisor';

															// Show only components graded by the supervisor
															return (
																userRole.isSupervisor &&
																gradedBySupervisor
															);
														})
														.map((grade) => (
															<TableRow
																key={`${student.student_id}-${grade.component_id}`}
															>
																<TableCell>
																	{grade.component_name}
																</TableCell>
																<TableCell>
																	{(grade.weighting || 0).toFixed(
																		1
																	)}
																	%{' '}
																</TableCell>
																<TableCell
																	className={getGradeColor(
																		grade.score || 0
																	)}
																>
																	{(grade.score || 0).toFixed(1)}
																</TableCell>
																<TableCell>
																	{grade.graded_by}
																</TableCell>
																<TableCell>
																	<Badge variant="outline">
																		{grade.is_team_based
																			? 'Team'
																			: 'Individual'}
																	</Badge>
																</TableCell>
															</TableRow>
														))}
												</TableBody>
											</Table>
										</AccordionContent>
									</AccordionItem>
								))}
							</Accordion>
						)}
					</div>

					{/* Feedback Section */}
					<div className="mt-6 space-y-4">
						<h3 className="text-lg font-medium">Feedback</h3>

						{userRole.isSupervisor && (
							<Card>
								<CardHeader>
									<CardTitle className="text-base">Supervisor Feedback</CardTitle>
								</CardHeader>
								<CardContent>
									{summary.supervisor_feedback ? (
										<p className="whitespace-pre-wrap">
											{summary.supervisor_feedback}
										</p>
									) : (
										<p className="text-muted-foreground italic">
											No feedback provided by supervisor
										</p>
									)}
								</CardContent>
							</Card>
						)}

						{userRole.isModerator && (
							<Card>
								<CardHeader>
									<CardTitle className="text-base">Moderator Feedback</CardTitle>
								</CardHeader>
								<CardContent>
									{summary.moderator_feedback ? (
										<p className="whitespace-pre-wrap">
											{summary.moderator_feedback}
										</p>
									) : (
										<p className="text-muted-foreground italic">
											No feedback provided by moderator
										</p>
									)}
								</CardContent>
							</Card>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

'use client';

import { AlertCircle, Clock, HelpCircle, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { useGetProjectDetails } from '@/utils/hooks/faculty/use-faculty-get-project-details';
import { useGetFinalProjectGrades } from '@/utils/hooks/faculty/use-faculty-grading';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
	component_grades: ComponentGrade[];
	letter_grade?: string;
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
	team_grade: number;
}

interface AdminProjectGradesSummaryProps {
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
	teamGrade?: number;
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

export default function AdminProjectGradesSummary({ projectId }: AdminProjectGradesSummaryProps) {
	const [summary, setSummary] = useState<GradesSummary | null>(null);

	// Function to convert numeric grade to letter grade
	const getLetterGrade = useCallback((score: number): string => {
		if (score > 90) return 'A+';
		if (score >= 85) return 'A';
		if (score >= 80) return 'A-';
		if (score >= 75) return 'B+';
		if (score >= 70) return 'B';
		if (score >= 65) return 'B-';
		if (score >= 60) return 'C+';
		if (score >= 55) return 'C';
		if (score >= 50) return 'C-';
		if (score >= 45) return 'D+';
		if (score >= 40) return 'D';
		return 'F';
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

	// Process the data when both grades and project details are available
	useEffect(() => {
		if (!gradesData) {
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

		if (studentGradesArray.length > 0 && projectDetails && typeof projectDetails === 'object') {
			const typedGradesData = gradesData as GradesDataWithStudentGrades | GradesDataArray;

			// Create a standardized summary object from the potentially complex data structure
			const newSummary: GradesSummary = {
				project_id: projectId,
				project_title: projectDetails.title || 'Untitled Project',
				supervisor_name: isGradesArray
					? projectDetails.professor?.name || ''
					: (typedGradesData as GradesDataWithStudentGrades).supervisorName ||
						projectDetails.professor?.name ||
						'',
				moderator_name: isGradesArray
					? projectDetails.moderator?.name || ''
					: (typedGradesData as GradesDataWithStudentGrades).moderatorName ||
						projectDetails.moderator?.name ||
						'',
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
					? false
					: (typedGradesData as GradesDataWithStudentGrades).gradingCompleted || false,
				team_grade: isGradesArray
					? 0
					: (typedGradesData as GradesDataWithStudentGrades).teamGrade || 0,
				student_grades: studentGradesArray.map((student) => {
					// Map the student data to a standardized format
					const studentId = student.student_id || student.studentId || 0;
					const studentName = student.student_name || student.studentName || '';
					const matricNumber = student.matricNumber || '';
					const supervisorGrade =
						student.supervisor_score || student.supervisorGrade || 0;
					const moderatorGrade = student.moderator_score || 0;
					const finalGrade = student.final_score || student.finalGrade || 0;
					const letterGrade =
						student.grade || student.letterGrade || getLetterGrade(finalGrade);

					// Get or infer component grades (could be empty if not provided)
					const componentGrades = student.componentGrades || [];

					return {
						student_id: studentId,
						student_name: studentName,
						matric_number: matricNumber,
						supervisor_grade: supervisorGrade,
						moderator_grade: moderatorGrade,
						final_grade: finalGrade,
						component_grades: componentGrades,
						letter_grade: letterGrade,
					};
				}),
			};

			setSummary(newSummary);
		}
	}, [gradesData, projectDetails, projectId, getLetterGrade]);

	// Helper to get color class based on grade
	const getGradeColor = (grade: number): string => {
		if (grade >= 70) return 'text-green-600';
		if (grade >= 55) return 'text-amber-600';
		if (grade >= 40) return 'text-orange-600';
		return 'text-red-600';
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-6">
				<div className="flex flex-col items-center gap-2">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<p className="text-muted-foreground">Loading project grades...</p>
				</div>
			</div>
		);
	}

	if (gradesError || detailsError) {
		return (
			<Alert variant="destructive" className="mb-6">
				<AlertCircle className="h-4 w-4" />
				<AlertTitle>Error</AlertTitle>
				<AlertDescription>
					{gradesError?.message ||
						detailsError?.message ||
						'Failed to load project grades'}
				</AlertDescription>
			</Alert>
		);
	}

	if (!summary || summary.student_grades.length === 0) {
		return (
			<Alert variant="default" className="mb-6">
				<AlertCircle className="h-4 w-4" />
				<AlertTitle>No grades found</AlertTitle>
				<AlertDescription>
					No grades have been submitted for this project yet.
					{summary?.grading_completed === false &&
						' The assessment is still in progress.'}
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className="space-y-6">
			{/* Grading Status Card */}
			<Card className="mb-4">
				<CardHeader>
					<CardTitle>Grading Summary</CardTitle>
					<CardDescription>Overall project grade summary and breakdown</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Assessment In Progress Alert */}
					{!summary.grading_completed && (
						<Alert
							variant="default"
							className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800"
						>
							<AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
							<AlertTitle className="text-amber-800 dark:text-amber-300">
								Assessment In Progress
							</AlertTitle>
							<AlertDescription className="text-amber-700 dark:text-amber-300">
								Assessment is still in progress for this project.
							</AlertDescription>
						</Alert>
					)}

					{/* Assessment Timeline */}
					<div className="space-y-4">
						<h3 className="text-lg font-medium">Assessment Timeline</h3>

						{/* Supervisor Assessment */}
						<div className="flex items-center justify-between py-2 border-b">
							<div className="space-y-1">
								<h4 className="font-medium">Supervisor Assessment</h4>
								<p className="text-sm text-muted-foreground">
									Supervisor: {summary.supervisor_name || 'Not assigned'}
								</p>
							</div>
							<div className="text-right">
								{summary.supervisor_graded_at ? (
									<div className="flex items-center text-sm text-green-600 dark:text-green-400">
										<Clock className="h-4 w-4 mr-1" />
										{new Date(summary.supervisor_graded_at).toLocaleString()}
									</div>
								) : (
									<span className="text-sm text-yellow-600 dark:text-yellow-400 italic flex items-center gap-1">
										<HelpCircle className="h-4 w-4" /> No grades submitted yet
									</span>
								)}
							</div>
						</div>

						{/* Moderator Assessment */}
						<div className="flex items-center justify-between py-2 border-b">
							<div className="space-y-1">
								<h4 className="font-medium">Moderator Assessment</h4>
								<p className="text-sm text-muted-foreground">
									Moderator: {summary.moderator_name || 'Not assigned'}
								</p>
							</div>
							<div className="text-right">
								{summary.moderator_graded_at ? (
									<div className="flex items-center text-sm text-green-600 dark:text-green-400">
										<Clock className="h-4 w-4 mr-1" />
										{new Date(summary.moderator_graded_at).toLocaleString()}
									</div>
								) : (
									<span className="text-sm text-yellow-600 dark:text-yellow-400 italic flex items-center gap-1">
										<HelpCircle className="h-4 w-4" /> No grades submitted yet
									</span>
								)}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Main grades display content */}
			<Card>
				<CardHeader>
					<CardTitle>Project Grades</CardTitle>
					<CardDescription>
						Final grades for all students in the project {summary.project_title}
					</CardDescription>
				</CardHeader>
				<CardContent className="px-1 sm:px-6">
					{summary.student_grades.length > 0 && (
						<div>
							{/* Show warning if grading isn't complete */}
							{!summary.grading_completed && (
								<Alert
									variant="default"
									className="mb-4 bg-amber-50 dark:bg-amber-950"
								>
									<AlertCircle className="h-4 w-4" />
									<AlertTitle>Grades are preliminary</AlertTitle>
									<AlertDescription>
										Shown grades may change as the assessment process is still
										in progress.
									</AlertDescription>
								</Alert>
							)}

							{/* Grade Table - Always shown */}
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Student</TableHead>
										<TableHead>Matric Number</TableHead>
										<TableHead className="text-center">
											{summary.grading_completed
												? 'Final Grade'
												: 'Current Grade'}
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{summary.student_grades.map((student) => (
										<TableRow key={student.student_id}>
											<TableCell className="font-medium">
												{student.student_name}
											</TableCell>
											<TableCell>{student.matric_number}</TableCell>
											<TableCell className="text-center">
												{student.final_grade > 0 ||
												student.supervisor_grade > 0 ||
												student.moderator_grade > 0 ? (
													<Badge
														variant="outline"
														className={`text-base font-bold ${getGradeColor(
															student.final_grade ||
																student.supervisor_grade ||
																0
														)}`}
													>
														{student.letter_grade &&
														student.letter_grade !== 'F'
															? student.letter_grade
															: 'NO GRADE GIVEN'}
													</Badge>
												) : (
													<span className="text-sm text-muted-foreground italic">
														Pending
													</span>
												)}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

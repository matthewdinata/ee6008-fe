'use client';

import { AlertCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { ProjectGradeResponse } from '@/types/grade';
import { ProjectGradeSummary } from '@/utils/actions/admin/grades';
import { useGetAllProjectGrades } from '@/utils/hooks/admin/use-get-all-project-grades';
import { useGetSemesters } from '@/utils/hooks/admin/use-get-semesters';
import { useToast } from '@/utils/hooks/use-toast';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import GradeBellCurveChart from './grade-bell-curve-chart';
import GradeDistributionChart from './grade-distribution-chart';
import ProjectComparisonChart from './project-comparison-chart';
import ProjectsTable from './projects-table';

export default function GradeAnalyticsDashboard() {
	const { toast } = useToast();
	const [selectedSemesterId, setSelectedSemesterId] = useState<number | undefined>(undefined);
	const [_activeTab, setActiveTab] = useState<string>('overview');

	// Fetch semesters
	const {
		data: semesters = [],
		isLoading: isLoadingSemesters,
		error: semestersError,
	} = useGetSemesters({});

	// Handle error for semesters
	useEffect(() => {
		if (semestersError) {
			console.error('Error fetching semesters:', semestersError);
			toast({
				title: 'Error',
				description: 'Failed to load semesters. Please try again.',
				variant: 'destructive',
			});
		}
	}, [semestersError, toast]);

	// Fetch grades for selected semester
	const {
		data: projectGrades = [],
		isLoading: isLoadingGrades,
		error: gradesError,
	} = useGetAllProjectGrades(selectedSemesterId ? selectedSemesterId.toString() : null, {
		enabled: !!selectedSemesterId,
	});

	// Handle error for grades
	useEffect(() => {
		if (gradesError) {
			console.error('Error fetching grades:', gradesError);
			toast({
				title: 'Error',
				description: 'Failed to load grade data. Please try again.',
				variant: 'destructive',
			});
		}
	}, [gradesError, toast]);

	// Check if grades are available or all zeros
	const [allGradesZero, setAllGradesZero] = useState<boolean>(false);

	// Calculate grade statistics and prepare data for visualizations
	const {
		gradeStats,
		letterGradeDistribution,
		bellCurveData,
		projectComparisonData,
		gradeTiers,
	} = useMemo(() => {
		if (!projectGrades || projectGrades.length === 0) {
			return {
				gradeStats: null,
				letterGradeDistribution: {},
				bellCurveData: [],
				projectComparisonData: [],
				gradeTiers: { excellent: 0, good: 0, average: 0, poor: 0, failing: 0 },
				areAllGradesZero: true,
			};
		}

		const allStudents = projectGrades.flatMap((project) => project.students || []);
		if (!allStudents.length) {
			return {
				gradeStats: null,
				letterGradeDistribution: {},
				bellCurveData: [],
				projectComparisonData: [],
				gradeTiers: { excellent: 0, good: 0, average: 0, poor: 0, failing: 0 },
				areAllGradesZero: true,
			};
		}

		// Only include students with valid, non-zero grades for analytics
		// This prevents students with F grades or ungraded students from skewing the analytics
		const validStudents = allStudents.filter(
			(student) =>
				student.finalGrade !== undefined &&
				student.finalGrade !== null &&
				student.finalGrade > 0
		);

		// Check if we have any valid grades at all

		// We'll handle the state update in a useEffect, not here in useMemo

		if (!validStudents.length) {
			return {
				gradeStats: null,
				letterGradeDistribution: {},
				bellCurveData: [],
				projectComparisonData: [],
				gradeTiers: { excellent: 0, good: 0, average: 0, poor: 0, failing: 0 },
				areAllGradesZero: true, // Track this value for useEffect
			};
		}

		// Calculate the statistics
		const grades = validStudents.map((student) => student.finalGrade || 0);
		const sum = grades.reduce((acc, grade) => acc + grade, 0);
		const avg = sum / grades.length;
		const max = Math.max(...grades);
		const min = Math.min(...grades);

		// Calculate the standard deviation
		const squaredDifferences = grades.map((grade) => Math.pow(grade - avg, 2));
		const variance =
			squaredDifferences.reduce((acc, squaredDiff) => acc + squaredDiff, 0) / grades.length;
		const stdDev = Math.sqrt(variance);

		// Calculate the letter grade distribution
		const letterGradeDistribution: Record<string, number> = {};
		grades.forEach((grade) => {
			const letterGrade = assignLetterGrade(grade);
			letterGradeDistribution[letterGrade] = (letterGradeDistribution[letterGrade] || 0) + 1;
		});

		// Group grades into ranges for bell curve
		const generatedBellCurveData = generateBellCurveData(grades, avg, stdDev);
		// Map to the expected DataPoint format
		const bellCurveData = generatedBellCurveData.map((item) => ({
			range: item.x,
			count: item.y,
			normalDistribution: item.normalY,
		}));

		// Project comparison data
		const projectComparisonData = projectGrades
			.filter((project) => project.students && project.students.length > 0)
			.map((project) => {
				const projectStudents = project.students || [];

				const validProjectStudents = projectStudents.filter(
					(student) => student.finalGrade !== undefined && student.finalGrade !== null
				);

				if (!validProjectStudents.length) {
					return null; // Return null for projects with no valid students
				}

				const projectGrades = validProjectStudents.map(
					(student) => student.finalGrade || 0
				);
				const projectSum = projectGrades.reduce((acc, grade) => acc + grade, 0);
				const projectAvg = projectSum / projectGrades.length;

				// Return with the expected ProjectData format
				return {
					projectId: project.projectId,
					title: project.title,
					averageGrade: parseFloat(projectAvg.toFixed(2)),
					studentCount: projectStudents.length,
				};
			})
			.sort((a, b) => {
				if (a === null || b === null) return 0;
				return b.averageGrade - a.averageGrade;
			}) // Sort by highest average
			.slice(0, 10); // Top 10 projects

		// Count students by grade tiers
		const gradeTiers = {
			excellent: validStudents.filter((s) => (s.finalGrade || 0) >= 85).length,
			good: validStudents.filter((s) => (s.finalGrade || 0) >= 70 && (s.finalGrade || 0) < 85)
				.length,
			average: validStudents.filter(
				(s) => (s.finalGrade || 0) >= 55 && (s.finalGrade || 0) < 70
			).length,
			poor: validStudents.filter((s) => (s.finalGrade || 0) >= 40 && (s.finalGrade || 0) < 55)
				.length,
			failing: validStudents.filter((s) => (s.finalGrade || 0) < 40).length,
		};

		return {
			gradeStats: {
				average: avg.toFixed(2),
				max,
				min,
				count: validStudents.length,
				stdDev: stdDev.toFixed(2),
				median: calculateMedian(grades).toFixed(2),
				passingRate: (
					(validStudents.filter((s) => (s.finalGrade || 0) >= 40).length /
						validStudents.length) *
					100
				).toFixed(2),
			},
			letterGradeDistribution,
			bellCurveData,
			projectComparisonData,
			gradeTiers,
		};
	}, [projectGrades]);

	// Update the state for allGradesZero based on the computed value from useMemo
	useEffect(() => {
		// Check if the analytics data has the areAllGradesZero flag
		if (
			gradeStats === null &&
			'areAllGradesZero' in
				{
					gradeStats,
					letterGradeDistribution,
					bellCurveData,
					projectComparisonData,
					gradeTiers,
				}
		) {
			setAllGradesZero(true);
		} else {
			setAllGradesZero(false);
		}
	}, [gradeStats, letterGradeDistribution, bellCurveData, projectComparisonData, gradeTiers]);

	// Helper function to assign letter grade based on numeric grade
	function assignLetterGrade(grade: number): string {
		if (grade >= 85) return 'A';
		if (grade >= 80) return 'A-';
		if (grade >= 75) return 'B+';
		if (grade >= 70) return 'B';
		if (grade >= 65) return 'B-';
		if (grade >= 60) return 'C+';
		if (grade >= 55) return 'C';
		if (grade >= 50) return 'C-';
		if (grade >= 45) return 'D+';
		if (grade >= 40) return 'D';
		return 'F';
	}

	// Helper function to generate bell curve data
	function generateBellCurveData(grades: number[], mean: number, stdDev: number) {
		// Create histogram data first (actual grade distribution)
		const min = Math.min(...grades);
		const max = Math.max(...grades);
		// Round to nearest multiples of 5 for cleaner bins
		const binMin = Math.floor(min / 5) * 5;
		const binMax = Math.ceil(max / 5) * 5;
		const binSize = 5;
		const binCount = (binMax - binMin) / binSize;

		// Initialize bins
		const bins: { x: string; y: number }[] = [];
		for (let i = 0; i <= binCount; i++) {
			const binStart = binMin + i * binSize;
			const binLabel = `${binStart}`;
			bins.push({ x: binLabel, y: 0 });
		}

		// Count grades in each bin
		grades.forEach((grade) => {
			const binIndex = Math.floor((grade - binMin) / binSize);
			if (binIndex >= 0 && binIndex < bins.length) {
				bins[binIndex].y += 1;
			}
		});

		// Add bell curve data points
		const bellCurveData = bins.map((bin) => {
			const x = parseInt(bin.x);
			const normalY =
				(1 / (stdDev * Math.sqrt(2 * Math.PI))) *
				Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
			// Scale the normal distribution to match the histogram
			const scaleFactor = grades.length * binSize;
			return {
				x: bin.x,
				y: bin.y, // Histogram count
				normalY: normalY * scaleFactor, // Bell curve
			};
		});

		return bellCurveData;
	}

	// Helper function to calculate median
	function calculateMedian(values: number[]): number {
		if (!values.length) return 0;

		// Sort values
		const sorted = [...values].sort((a, b) => a - b);
		const middle = Math.floor(sorted.length / 2);

		// If odd length, return middle value; if even, return average of two middle values
		if (sorted.length % 2 === 0) {
			return (sorted[middle - 1] + sorted[middle]) / 2;
		} else {
			return sorted[middle];
		}
	}

	// Convert ProjectGradeSummary to ProjectGradeResponse for the ProjectsTable component
	function adaptProjectGrades(projects: ProjectGradeSummary[]): ProjectGradeResponse[] {
		return projects.map((project) => {
			const students = project.students || [];
			const validStudents = students.filter(
				(s) => s.finalGrade !== undefined && s.finalGrade !== null
			);

			const avgGrade =
				validStudents.length > 0
					? validStudents.reduce((sum, student) => sum + (student.finalGrade || 0), 0) /
						validStudents.length
					: 0;

			const letterGrade = assignLetterGrade(avgGrade);

			return {
				projectId: project.projectId,
				project_id: project.projectId,
				title: project.title,
				supervisorName: project.supervisorName || '',
				supervisor_name: project.supervisorName || '',
				moderatorName: project.moderatorName || '',
				moderator_name: project.moderatorName || '',
				// Fill in required fields with default values
				description: '',
				role: 'supervisor' as const,
				supervisorEmail: '',
				supervisor_email: '',
				moderatorEmail: '',
				moderator_email: '',
				students: students,
				// Add custom properties for the table
				averageGrade: avgGrade.toFixed(2),
				letterGrade,
				studentCount: students.length,
			};
		});
	}

	// Handle semester change
	function handleSemesterChange(value: string) {
		setSelectedSemesterId(parseInt(value));
	}

	if (semestersError || gradesError) {
		return (
			<Alert variant="destructive">
				<AlertCircle className="h-4 w-4" />
				<AlertTitle>Error</AlertTitle>
				<AlertDescription>
					{semestersError ? 'Failed to load semesters.' : 'Failed to load grade data.'}
					Please try refreshing the page.
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className="space-y-6">
			{/* Semester Selector */}
			<Card>
				<CardHeader>
					<CardTitle>Select Semester</CardTitle>
					<CardDescription>
						Choose a semester to view detailed grade analytics
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoadingSemesters ? (
						<Skeleton className="h-10 w-full" />
					) : (
						<Select
							value={selectedSemesterId?.toString() || ''}
							onValueChange={handleSemesterChange}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select a semester" />
							</SelectTrigger>
							<SelectContent>
								{semesters.map((semester) => (
									<SelectItem key={semester.id} value={semester.id.toString()}>
										AY {semester.academicYear} - {semester.name}
										{semester.isActive ? ' (Active)' : ''}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
				</CardContent>
			</Card>

			{/* Grade Analytics Content */}
			{!selectedSemesterId ? (
				<Alert>
					<AlertCircle className="h-4 w-4" />
					<AlertTitle>Select a Semester</AlertTitle>
					<AlertDescription>
						Please select a semester to view detailed grade analytics.
					</AlertDescription>
				</Alert>
			) : isLoadingGrades ? (
				<div className="space-y-4">
					<Skeleton className="h-[300px] w-full" />
					<Skeleton className="h-[400px] w-full" />
				</div>
			) : !projectGrades || projectGrades.length === 0 ? (
				<Alert>
					<AlertCircle className="h-4 w-4" />
					<AlertTitle>No Data</AlertTitle>
					<AlertDescription>
						THERE&apos;S NO GRADE FOR THIS SEMESTER YET. Please check back later.
					</AlertDescription>
				</Alert>
			) : allGradesZero ? (
				<Alert className="bg-muted">
					<AlertCircle className="h-4 w-4" />
					<AlertTitle>No Grades Available</AlertTitle>
					<AlertDescription>
						Grades have not been entered for this semester yet. Analytics will be
						available once grades are submitted.
					</AlertDescription>
				</Alert>
			) : (
				<div className="space-y-6">
					<Tabs defaultValue="overview" onValueChange={setActiveTab}>
						<TabsList className="grid w-full grid-cols-3">
							<TabsTrigger value="overview">Overview</TabsTrigger>
							<TabsTrigger value="distribution">Grade Distribution</TabsTrigger>
							<TabsTrigger value="projects">Project Analysis</TabsTrigger>
						</TabsList>

						{/* Overview Tab */}
						<TabsContent value="overview" className="space-y-6">
							{gradeStats && (
								<>
									{/* Key Metrics */}
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
										<Card>
											<CardHeader className="pb-2">
												<CardTitle className="text-sm font-medium">
													Average Grade
												</CardTitle>
											</CardHeader>
											<CardContent>
												<div className="text-2xl font-bold">
													{gradeStats.average}
												</div>
												<p className="text-xs text-muted-foreground">
													Standard Deviation: {gradeStats.stdDev}
												</p>
											</CardContent>
										</Card>
										<Card>
											<CardHeader className="pb-2">
												<CardTitle className="text-sm font-medium">
													Median Grade
												</CardTitle>
											</CardHeader>
											<CardContent>
												<div className="text-2xl font-bold">
													{gradeStats.median}
												</div>
												<p className="text-xs text-muted-foreground">
													Middle value in the grade distribution
												</p>
											</CardContent>
										</Card>
										<Card>
											<CardHeader className="pb-2">
												<CardTitle className="text-sm font-medium">
													Passing Rate
												</CardTitle>
											</CardHeader>
											<CardContent>
												<div className="text-2xl font-bold">
													{gradeStats.passingRate}%
												</div>
												<p className="text-xs text-muted-foreground">
													Students with grade ≥ 40
												</p>
											</CardContent>
										</Card>
										<Card>
											<CardHeader className="pb-2">
												<CardTitle className="text-sm font-medium">
													Total Students
												</CardTitle>
											</CardHeader>
											<CardContent>
												<div className="text-2xl font-bold">
													{gradeStats.count}
												</div>
												<p className="text-xs text-muted-foreground">
													Range: {gradeStats.min} - {gradeStats.max}
												</p>
											</CardContent>
										</Card>
									</div>

									{/* Grade Distribution by Tier */}
									<Card>
										<CardHeader>
											<CardTitle>Grade Distribution by Tier</CardTitle>
											<CardDescription>
												Breakdown of students across different grade tiers
											</CardDescription>
										</CardHeader>
										<CardContent>
											<div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
												<div>
													<div className="text-xl font-bold text-green-500">
														{gradeTiers.excellent}
													</div>
													<div className="text-sm font-medium">
														Excellent
													</div>
													<div className="text-xs text-muted-foreground">
														85-100
													</div>
												</div>
												<div>
													<div className="text-xl font-bold text-emerald-500">
														{gradeTiers.good}
													</div>
													<div className="text-sm font-medium">Good</div>
													<div className="text-xs text-muted-foreground">
														70-84
													</div>
												</div>
												<div>
													<div className="text-xl font-bold text-yellow-500">
														{gradeTiers.average}
													</div>
													<div className="text-sm font-medium">
														Average
													</div>
													<div className="text-xs text-muted-foreground">
														55-69
													</div>
												</div>
												<div>
													<div className="text-xl font-bold text-orange-500">
														{gradeTiers.poor}
													</div>
													<div className="text-sm font-medium">Poor</div>
													<div className="text-xs text-muted-foreground">
														40-54
													</div>
												</div>
												<div>
													<div className="text-xl font-bold text-red-500">
														{gradeTiers.failing}
													</div>
													<div className="text-sm font-medium">
														Failing
													</div>
													<div className="text-xs text-muted-foreground">
														0-39
													</div>
												</div>
											</div>
										</CardContent>
									</Card>

									{/* Bell Curve Chart */}
									<Card>
										<CardHeader>
											<CardTitle>Grade Distribution Bell Curve</CardTitle>
											<CardDescription>
												Normal distribution of grades with histogram overlay
											</CardDescription>
										</CardHeader>
										<CardContent>
											<div className="h-[400px]">
												<GradeBellCurveChart
													data={bellCurveData}
													mean={parseFloat(gradeStats.average)}
													stdDev={parseFloat(gradeStats.stdDev)}
													median={parseFloat(gradeStats.median)}
												/>
											</div>
										</CardContent>
									</Card>
								</>
							)}
						</TabsContent>

						{/* Distribution Tab */}
						<TabsContent value="distribution" className="space-y-6">
							{/* Letter Grade Distribution */}
							<Card>
								<CardHeader>
									<CardTitle>Letter Grade Distribution</CardTitle>
									<CardDescription>
										Distribution of letter grades across all students
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="h-[400px]">
										<GradeDistributionChart
											distribution={letterGradeDistribution}
										/>
									</div>
								</CardContent>
							</Card>

							{/* Top Projects by Average Grade */}
							<Card>
								<CardHeader>
									<CardTitle>Top Projects by Average Grade</CardTitle>
									<CardDescription>
										Projects with the highest average student grades
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="h-[400px]">
										<ProjectComparisonChart data={projectComparisonData} />
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						{/* Projects Tab */}
						<TabsContent value="projects" className="space-y-6">
							{/* Project Performance Analysis */}
							<Card>
								<CardHeader>
									<CardTitle>Project Performance Analysis</CardTitle>
									<CardDescription>
										Detailed breakdown of all projects and their grades
									</CardDescription>
								</CardHeader>
								<CardContent>
									<ProjectsTable projects={adaptProjectGrades(projectGrades)} />
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</div>
			)}
		</div>
	);
}

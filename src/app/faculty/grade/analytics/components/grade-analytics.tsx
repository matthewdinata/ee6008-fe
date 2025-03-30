'use client';

import { AlertCircle } from 'lucide-react';
import { useMemo, useState } from 'react';

import { useGetSemesters } from '@/utils/hooks/admin/use-get-semesters';
import { useGetSemesterGrades } from '@/utils/hooks/faculty/use-get-semester-grades';
import { useToast } from '@/utils/hooks/use-toast';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
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

import _GradeDistributionChart from '@/app/faculty/grade/analytics/components/grade-distribution-chart';
import ProjectGradesTable from '@/app/faculty/grade/analytics/components/project-grades-table';

export default function GradeAnalytics() {
	const { toast } = useToast();
	const [selectedSemesterId, setSelectedSemesterId] = useState<number | undefined>(undefined);

	// Fetch semesters
	const {
		data: semesters = [],
		isLoading: isLoadingSemesters,
		error: semestersError,
	} = useGetSemesters({
		onError: (error) => {
			console.error('Error fetching semesters:', error);
			toast({
				title: 'Error',
				description: 'Failed to load semesters. Please try again.',
				variant: 'destructive',
			});
		},
	});

	// Fetch grades for selected semester
	const {
		data: projectGrades = [],
		isLoading: isLoadingGrades,
		error: gradesError,
	} = useGetSemesterGrades(selectedSemesterId, {
		enabled: !!selectedSemesterId,
		onError: (error) => {
			console.error('Error fetching grades:', error);
			toast({
				title: 'Error',
				description: 'Failed to load grade data. Please try again.',
				variant: 'destructive',
			});
		},
	});

	// Filter projects by role
	const supervisorProjects = useMemo(
		() => projectGrades.filter((project) => project.role === 'supervisor'),
		[projectGrades]
	);

	const moderatorProjects = useMemo(
		() => projectGrades.filter((project) => project.role === 'moderator'),
		[projectGrades]
	);

	// Calculate grade statistics
	const _gradeStats = useMemo(() => {
		if (!projectGrades.length) return null;

		const allStudents = projectGrades.flatMap((project) => project.students || []);
		if (!allStudents.length) return null;

		const validStudents = allStudents.filter(
			(student) => student.finalGrade !== undefined && student.finalGrade !== null
		);
		if (!validStudents.length) return null;

		const grades = validStudents.map((student) => student.finalGrade || 0);
		const sum = grades.reduce((acc, grade) => acc + grade, 0);
		const avg = sum / grades.length;
		const max = Math.max(...grades);
		const min = Math.min(...grades);

		// Count letter grades
		const letterGradeCounts: Record<string, number> = {};
		validStudents.forEach((student) => {
			const letterGrade = student.letterGrade || 'N/A';
			letterGradeCounts[letterGrade] = (letterGradeCounts[letterGrade] || 0) + 1;
		});

		return {
			average: avg.toFixed(2),
			max,
			min,
			count: validStudents.length,
			letterGradeCounts,
		};
	}, [projectGrades]);

	// Handle semester change
	const handleSemesterChange = (value: string) => {
		setSelectedSemesterId(Number(value));
	};

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
					<CardDescription>Choose a semester to view grade analytics</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoadingSemesters ? (
						<Skeleton className="h-10 w-full max-w-xs" />
					) : (
						<Select onValueChange={handleSemesterChange}>
							<SelectTrigger className="w-full max-w-xs">
								<SelectValue placeholder="Select a semester" />
							</SelectTrigger>
							<SelectContent>
								{semesters.map((semester) => (
									<SelectItem key={semester.id} value={semester.id.toString()}>
										{semester.name} - AY {semester.academicYear}{' '}
										{semester.isActive ? '(Active)' : ''}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
				</CardContent>
			</Card>

			{/* Grade Analytics Content */}
			{selectedSemesterId ? (
				isLoadingGrades ? (
					<div className="space-y-4">
						<Skeleton className="h-[300px] w-full" />
						<Skeleton className="h-[400px] w-full" />
					</div>
				) : projectGrades.length === 0 ? (
					<Alert>
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>No Data</AlertTitle>
						<AlertDescription>
							No grade data available for the selected semester.
						</AlertDescription>
					</Alert>
				) : (
					<div className="space-y-6">
						{/* Overview Cards
						{_gradeStats && (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
								<Card>
									<CardHeader className="pb-2">
										<CardTitle className="text-sm font-medium">
											Average Grade
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="text-2xl font-bold">
											{_gradeStats.average}
										</div>
									</CardContent>
								</Card>
								<Card>
									<CardHeader className="pb-2">
										<CardTitle className="text-sm font-medium">
											Highest Grade
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="text-2xl font-bold">{_gradeStats.max}</div>
									</CardContent>
								</Card>
								<Card>
									<CardHeader className="pb-2">
										<CardTitle className="text-sm font-medium">
											Lowest Grade
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="text-2xl font-bold">{_gradeStats.min}</div>
									</CardContent>
								</Card>
								<Card>
									<CardHeader className="pb-2">
										<CardTitle className="text-sm font-medium">
											Total Students
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="text-2xl font-bold">{_gradeStats.count}</div>
									</CardContent>
								</Card>
							</div>
						)} */}

						{/* Grade Distribution
						{_gradeStats && (
							<Card>
								<CardHeader>
									<CardTitle>Grade Distribution</CardTitle>
									<CardDescription>
										Distribution of letter grades across projects
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="h-[300px]">
										<_GradeDistributionChart
											data={_gradeStats.letterGradeCounts}
										/>
									</div>
								</CardContent>
							</Card>
						)} */}

						{/* Projects Tabs */}
						<Card>
							<CardHeader>
								<CardTitle>Project Grades</CardTitle>
								<CardDescription>View grades by your role</CardDescription>
							</CardHeader>
							<CardContent>
								<Tabs defaultValue="supervisor" className="space-y-4">
									<TabsList>
										<TabsTrigger value="supervisor">
											As Supervisor
											{supervisorProjects.length > 0 && (
												<Badge variant="secondary" className="ml-2">
													{supervisorProjects.length}
												</Badge>
											)}
										</TabsTrigger>
										<TabsTrigger value="moderator">
											As Moderator
											{moderatorProjects.length > 0 && (
												<Badge variant="secondary" className="ml-2">
													{moderatorProjects.length}
												</Badge>
											)}
										</TabsTrigger>
									</TabsList>

									<TabsContent value="supervisor" className="space-y-4">
										{supervisorProjects.length === 0 ? (
											<Alert>
												<AlertCircle className="h-4 w-4" />
												<AlertTitle>No Projects</AlertTitle>
												<AlertDescription>
													You are not supervising any projects in this
													semester.
												</AlertDescription>
											</Alert>
										) : (
											<ProjectGradesTable
												projects={supervisorProjects}
												role="supervisor"
											/>
										)}
									</TabsContent>

									<TabsContent value="moderator" className="space-y-4">
										{moderatorProjects.length === 0 ? (
											<Alert>
												<AlertCircle className="h-4 w-4" />
												<AlertTitle>No Projects</AlertTitle>
												<AlertDescription>
													You are not moderating any projects in this
													semester.
												</AlertDescription>
											</Alert>
										) : (
											<ProjectGradesTable
												projects={moderatorProjects}
												role="moderator"
											/>
										)}
									</TabsContent>
								</Tabs>
							</CardContent>
						</Card>
					</div>
				)
			) : (
				<Alert>
					<AlertCircle className="h-4 w-4" />
					<AlertTitle>Select a Semester</AlertTitle>
					<AlertDescription>
						Please select a semester to view grade analytics.
					</AlertDescription>
				</Alert>
			)}
		</div>
	);
}

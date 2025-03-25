'use client';

import { AlertCircle, Loader2 } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useGetProjectsBySemester } from '@/utils/hooks/admin/use-get-projects-by-semester';
import { useGetSemesters } from '@/utils/hooks/admin/use-get-semesters';
import { useGetProjectDetails } from '@/utils/hooks/faculty/use-faculty-get-project-details';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import ProjectGradesSummary from '@/app/faculty/grade/evaluation/components/project-grades-sumary';

import AllProjectGrades from './components/all-project-grades';

export default function AdminProjectGradingPage() {
	const { projectId } = useParams();
	const router = useRouter();
	const searchParams = useSearchParams();

	const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
	const [semesterId, setSemesterId] = useState<number | null>(null);
	const [activeTab, setActiveTab] = useState('single');

	// Get tab from URL if available
	useEffect(() => {
		const tab = searchParams.get('tab');
		if (tab === 'all' || tab === 'single') {
			setActiveTab(tab);
		}
	}, [searchParams]);

	// Get available semesters
	const { data: semesters, isLoading: isSemestersLoading } = useGetSemesters();

	// Set default semester when semesters are loaded
	useEffect(() => {
		if (semesters && semesters.length > 0 && !semesterId) {
			// Find an active semester first
			const activeSemester = semesters.find((sem) => sem.isActive);
			if (activeSemester) {
				setSemesterId(activeSemester.id);
			} else {
				// If no active semester, use the first one
				setSemesterId(semesters[0].id);
			}
		}
	}, [semesters, semesterId]);

	// Fetch all projects based on semester (for admin view)
	const { data: allProjects, isLoading: isProjectsLoading } = useGetProjectsBySemester(
		semesterId || 0,
		{
			enabled: !!semesterId,
		}
	);

	// Set selected project when projects are loaded or when projectId from URL changes
	useEffect(() => {
		if (allProjects && allProjects.length > 0) {
			if (projectId) {
				// If we have a projectId from the URL, use it
				setSelectedProjectId(Number(projectId));
			} else if (!selectedProjectId) {
				// Otherwise select the first project
				setSelectedProjectId(allProjects[0].id);
			}
		}
	}, [allProjects, projectId, selectedProjectId]);

	// Fetch project details for the selected project
	const { isLoading: projectDetailsLoading, error: projectDetailsError } =
		useGetProjectDetails(selectedProjectId);

	// Handle project selection change
	const handleProjectChange = (value: string) => {
		const newProjectId = parseInt(value, 10);
		setSelectedProjectId(newProjectId);

		// Update URL without refreshing the page
		const params = new URLSearchParams(searchParams.toString());
		params.set('projectId', newProjectId.toString());
		router.push(`/admin/project/grade/evaluation?${params.toString()}`, { scroll: false });
	};

	// Handle semester selection change
	const handleSemesterChange = (value: string) => {
		const newSemesterId = parseInt(value, 10);
		setSemesterId(newSemesterId);
		setSelectedProjectId(null); // Reset selected project when semester changes
	};

	// Handle tab change
	const handleTabChange = (value: string) => {
		setActiveTab(value);

		// Update URL without refreshing the page
		const params = new URLSearchParams(searchParams.toString());
		params.set('tab', value);
		router.push(`/admin/project/grade/evaluation?${params.toString()}`, { scroll: false });
	};

	// Show loading state but don't block rendering
	const loadingContent = (
		<div className="flex justify-center items-center min-h-[60vh] mb-8">
			<div className="flex flex-col items-center gap-2">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
				<p>Loading project grading...</p>
			</div>
		</div>
	);

	// Show error for project details fetch if needed
	const errorContent = projectDetailsError ? (
		<Alert variant="destructive" className="mb-8">
			<AlertCircle className="h-4 w-4" />
			<AlertTitle>Error</AlertTitle>
			<AlertDescription>
				Failed to load project details. Please try again later.
			</AlertDescription>
		</Alert>
	) : null;

	return (
		<div className="container py-6 space-y-6">
			<div className="flex flex-col gap-2">
				<h1 className="text-2xl font-bold">Project Grades</h1>
				<p className="text-muted-foreground">
					View and manage project grades for all students.
				</p>
			</div>

			{/* Semester Selection */}
			<Card>
				<CardHeader>
					<CardTitle>Select Semester</CardTitle>
					<CardDescription>Choose a semester to view its project grades.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-2 max-w-md">
						<label htmlFor="semester" className="text-sm font-medium">
							Semester
						</label>
						<Select
							value={semesterId?.toString() || ''}
							onValueChange={handleSemesterChange}
							disabled={isSemestersLoading}
						>
							<SelectTrigger id="semester">
								<SelectValue placeholder="Select Semester" />
							</SelectTrigger>
							<SelectContent>
								{semesters?.map((semester) => (
									<SelectItem key={semester.id} value={semester.id.toString()}>
										{semester.name} - AY {semester.academicYear}{' '}
										{semester.isActive ? '(Active)' : ''}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Tabs for different views */}
			<Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
				<TabsList className="grid w-full max-w-md grid-cols-2">
					<TabsTrigger value="single">Single Project</TabsTrigger>
					<TabsTrigger value="all">All Projects</TabsTrigger>
				</TabsList>

				{/* Single Project View */}
				<TabsContent value="single" className="space-y-4">
					{/* Project Selection */}
					<Card>
						<CardHeader>
							<CardTitle>Select Project</CardTitle>
							<CardDescription>
								Choose a project to view its detailed grades.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex flex-col gap-2 max-w-md">
								<label htmlFor="project" className="text-sm font-medium">
									Project
								</label>
								<Select
									value={selectedProjectId?.toString() || ''}
									onValueChange={handleProjectChange}
									disabled={isProjectsLoading || !semesterId}
								>
									<SelectTrigger id="project">
										<SelectValue placeholder="Select Project" />
									</SelectTrigger>
									<SelectContent>
										{allProjects?.map((project) => (
											<SelectItem
												key={project.id}
												value={project.id.toString()}
											>
												{project.title}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</CardContent>
					</Card>

					{/* Show loading state or error if applicable */}
					{(isProjectsLoading || projectDetailsLoading) && loadingContent}
					{errorContent}

					{/* Project Grades Summary */}
					{selectedProjectId && !projectDetailsLoading && !projectDetailsError && (
						<ProjectGradesSummary projectId={selectedProjectId} />
					)}
				</TabsContent>

				{/* All Projects View */}
				<TabsContent value="all" className="mt-6">
					{isProjectsLoading ? (
						loadingContent
					) : (
						<AllProjectGrades
							semesterId={semesterId}
							academicYear={semesters?.find((s) => s.id === semesterId)?.academicYear}
						/>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}

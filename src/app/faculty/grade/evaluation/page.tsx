'use client';

import { AlertCircle, Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { useGetSemesters } from '@/utils/hooks/admin/use-get-semesters';
import { useGetProjectDetails } from '@/utils/hooks/faculty/use-faculty-get-project-details';
import { useGetFacultyProjects } from '@/utils/hooks/faculty/use-faculty-get-projects';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { GradedComponentsView } from './components/graded-components-view';
import ModeratorGradingForm from './components/moderator-grading-form';
import { PeerReviewTab } from './components/peer-review-tab';
import ProjectGradesSummary from './components/project-grades-sumary';
import { SupervisorGradingForm } from './components/supervisor-grading-form';

export default function ProjectGradingPage() {
	const { projectId } = useParams();
	const { toast } = useToast();

	const [activeTab, setActiveTab] = useState('supervisor');
	const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
	const [semesterId, setSemesterId] = useState<number | null>(null);
	const [isSupervisor, setIsSupervisor] = useState(false);
	const [isModerator, setIsModerator] = useState(false);

	// Get user email from cookies
	const userEmail = useMemo(() => {
		if (typeof document !== 'undefined') {
			const cookies = document.cookie.split(';');
			console.log('All cookies:', cookies);

			// Try to find the user-email cookie first
			let email = '';
			for (const cookie of cookies) {
				const [key, value] = cookie.trim().split('=');
				console.log('Cookie key:', key, 'value:', value);
				if (key === 'user-email') {
					email = decodeURIComponent(value);
					console.log('Found user-email in cookies:', email);
					break;
				}
				// Also check for just 'email' cookie
				if (key === 'email') {
					email = decodeURIComponent(value);
					console.log('Found email in cookies:', email);
					break;
				}
			}

			console.log('Final parsed email:', email);
			return email;
		}
		return '';
	}, []);

	// Get available semesters
	const { data: semesters, isLoading: isSemestersLoading } = useGetSemesters();

	// Set default semester when semesters are loaded
	useEffect(() => {
		if (semesters && semesters.length > 0 && !semesterId) {
			// Find an active semester first
			const activeSemester = semesters.find((sem) => sem.isActive);
			if (activeSemester) {
				console.log('Setting active semester:', activeSemester);
				setSemesterId(activeSemester.id);
			} else {
				// If no active semester, use the first one
				console.log('Setting first semester:', semesters[0]);
				setSemesterId(semesters[0].id);
			}
		}
	}, [semesters, semesterId]);

	// Fetch faculty projects based on semester
	const {
		data: facultyProjects,
		isLoading: isProjectsLoading,
		error: projectsError,
	} = useGetFacultyProjects(semesterId, userEmail);

	// Add debug logging for faculty projects
	useEffect(() => {
		if (semesterId) {
			console.log('Semester ID changed to:', semesterId);
			console.log('User email being used:', userEmail);
		}

		if (facultyProjects) {
			console.log('Faculty projects loaded:', facultyProjects.length);
			console.log('Faculty projects:', facultyProjects);
		}
	}, [semesterId, facultyProjects, userEmail]);

	// Set selected project when projects are loaded or when projectId from URL changes
	useEffect(() => {
		if (facultyProjects && facultyProjects.length > 0) {
			if (projectId) {
				// If we have a projectId from the URL, use it
				setSelectedProjectId(Number(projectId));
			} else if (!selectedProjectId) {
				// Otherwise select the first project
				setSelectedProjectId(facultyProjects[0].id);
			}
		}
	}, [facultyProjects, projectId, selectedProjectId]);

	// Fetch project details for the selected project
	const {
		data: projectDetails,
		isLoading: projectDetailsLoading,
		error: projectDetailsError,
	} = useGetProjectDetails(selectedProjectId);

	// Update role access when project details change
	useEffect(() => {
		if (projectDetails && userEmail) {
			console.log('Checking roles for user:', userEmail);
			console.log('Project details:', projectDetails);

			// Check if user is supervisor (professor)
			// Handle both nested object structure and direct property access
			const professorEmail =
				projectDetails.professor?.email ||
				(projectDetails as { professor_email?: string }).professor_email;
			console.log('Project professor email:', professorEmail);

			// Check if user is moderator
			// Handle both nested object structure and direct property access
			const moderatorEmail =
				projectDetails.moderator?.email ||
				(projectDetails as { moderator_email?: string }).moderator_email;
			console.log('Project moderator email:', moderatorEmail);

			// Compare emails
			const supervisorMatch = professorEmail === userEmail;
			console.log('Is supervisor match?', supervisorMatch);
			setIsSupervisor(supervisorMatch);

			const moderatorMatch = moderatorEmail === userEmail;
			console.log('Is moderator match?', moderatorMatch);
			setIsModerator(moderatorMatch);

			// Set default active tab based on role
			if (supervisorMatch) {
				console.log('Setting active tab to supervisor');
				setActiveTab('supervisor');
			} else if (moderatorMatch) {
				console.log('Setting active tab to moderator');
				setActiveTab('moderator');
			}

			// If user has no role for this project, show a toast notification
			if (!supervisorMatch && !moderatorMatch) {
				toast({
					title: 'Access Restricted',
					description: "You don't have permission to grade this project.",
					variant: 'destructive',
				});
			}
		}
	}, [projectDetails, userEmail, toast]);

	// Handle project selection change
	const handleProjectChange = (value: string) => {
		const newProjectId = parseInt(value, 10);
		setSelectedProjectId(newProjectId);
	};

	// Handle semester selection change
	const handleSemesterChange = (value: string) => {
		const newSemesterId = parseInt(value, 10);
		console.log('Semester changed to:', newSemesterId);
		setSemesterId(newSemesterId);
		setSelectedProjectId(null); // Reset selected project when semester changes
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
		<Alert variant="destructive" className="max-w-2xl mx-auto my-8">
			<AlertCircle className="h-4 w-4" />
			<AlertTitle>Error</AlertTitle>
			<AlertDescription>Failed to load project details. Please try again.</AlertDescription>
		</Alert>
	) : null;

	// Show error for projects fetch if needed
	const projectsErrorContent = projectsError ? (
		<Alert variant="destructive" className="max-w-2xl mx-auto my-4">
			<AlertCircle className="h-4 w-4" />
			<AlertTitle>Error</AlertTitle>
			<AlertDescription>
				Failed to load projects. Please try again or select a different semester.
			</AlertDescription>
		</Alert>
	) : null;

	return (
		<div className="container mx-auto py-8 px-4">
			<div className="mb-8">
				<h1 className="text-2xl font-bold mb-4">Project Grading</h1>

				<div className="flex flex-col md:flex-row gap-4 mb-6">
					{/* Semester selector */}
					<div className="w-full md:w-1/3">
						<label className="text-sm font-medium mb-1 block">Semester</label>
						<Select
							value={semesterId?.toString() || ''}
							onValueChange={handleSemesterChange}
							disabled={isSemestersLoading}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select semester" />
							</SelectTrigger>
							<SelectContent>
								{semesters?.map((semester) => (
									<SelectItem key={semester.id} value={semester.id.toString()}>
										{semester.academicYear} - {semester.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Project selector */}
					<div className="w-full md:w-2/3">
						<label className="text-sm font-medium mb-1 block">Project</label>
						<Select
							value={selectedProjectId?.toString() || ''}
							onValueChange={handleProjectChange}
							disabled={
								isProjectsLoading ||
								!facultyProjects ||
								facultyProjects.length === 0
							}
						>
							<SelectTrigger className="w-full">
								<SelectValue
									placeholder={
										isProjectsLoading ? 'Loading projects...' : 'Select project'
									}
								/>
							</SelectTrigger>
							<SelectContent>
								{facultyProjects?.map((project) => (
									<SelectItem key={project.id} value={project.id.toString()}>
										{project.title}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				{selectedProjectId && projectDetails && (
					<p className="text-muted-foreground">{projectDetails?.title}</p>
				)}
			</div>

			{(isProjectsLoading || projectDetailsLoading) && loadingContent}
			{errorContent}
			{projectsErrorContent}

			{selectedProjectId && projectDetails && (
				<>
					<Card className="mb-8">
						<CardHeader>
							<CardTitle>Project Details</CardTitle>
							<CardDescription>Key information about this project</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<h3 className="font-medium">Project ID</h3>
									<p>{projectDetails?.id}</p>
								</div>
								<div>
									<h3 className="font-medium">Semester</h3>
									<p>
										{projectDetails?.academic_year} - {projectDetails?.semester}
									</p>
								</div>
								<div>
									<h3 className="font-medium">Supervisor</h3>
									<p>{projectDetails?.professor?.name}</p>
								</div>
								<div>
									<h3 className="font-medium">Moderator</h3>
									<p>{projectDetails?.moderator?.name || 'Not assigned'}</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
						<TabsList>
							<TabsTrigger value="supervisor">Supervisor Assessment</TabsTrigger>
							<TabsTrigger value="moderator">Moderator Assessment</TabsTrigger>
							<TabsTrigger value="peerReview">Peer Reviews</TabsTrigger>
							<TabsTrigger value="gradedComponents">Graded Components</TabsTrigger>
							<TabsTrigger value="summary">Assessment Summary</TabsTrigger>
						</TabsList>

						<TabsContent value="supervisor" className="space-y-4">
							{isSupervisor ? (
								<SupervisorGradingForm
									projectId={selectedProjectId}
									teamMembers={projectDetails?.team_members || []}
								/>
							) : (
								<Alert className="max-w-2xl mx-auto my-8">
									<AlertCircle className="h-4 w-4" />
									<AlertTitle>Access Restricted</AlertTitle>
									<AlertDescription>
										You are not a supervisor for this project. If you believe
										this is an error, please contact the admin or course
										coordinator.
									</AlertDescription>
								</Alert>
							)}
						</TabsContent>

						<TabsContent value="moderator" className="space-y-4">
							{isModerator ? (
								<ModeratorGradingForm projectId={selectedProjectId} />
							) : (
								<Alert className="max-w-2xl mx-auto my-8">
									<AlertCircle className="h-4 w-4" />
									<AlertTitle>Access Restricted</AlertTitle>
									<AlertDescription>
										You are not a moderator for this project. If you believe
										this is an error, please contact the admin or course
										coordinator.
									</AlertDescription>
								</Alert>
							)}
						</TabsContent>

						<TabsContent value="peerReview" className="space-y-4">
							{isSupervisor || isModerator ? (
								<PeerReviewTab projectId={selectedProjectId} />
							) : (
								<Alert className="max-w-2xl mx-auto my-8">
									<AlertCircle className="h-4 w-4" />
									<AlertTitle>Access Restricted</AlertTitle>
									<AlertDescription>
										You need to be a supervisor or moderator to view peer
										reviews for this project.
									</AlertDescription>
								</Alert>
							)}
						</TabsContent>

						<TabsContent value="gradedComponents" className="space-y-4">
							{isSupervisor || isModerator ? (
								<GradedComponentsView
									projectId={selectedProjectId}
									role={isSupervisor ? 'supervisor' : 'moderator'}
								/>
							) : (
								<Alert className="max-w-2xl mx-auto my-8">
									<AlertCircle className="h-4 w-4" />
									<AlertTitle>Access Restricted</AlertTitle>
									<AlertDescription>
										You need to be a supervisor or moderator to view graded
										components for this project.
									</AlertDescription>
								</Alert>
							)}
						</TabsContent>

						<TabsContent value="summary" className="space-y-4">
							<ProjectGradesSummary projectId={selectedProjectId} />
						</TabsContent>
					</Tabs>
				</>
			)}

			{!selectedProjectId && facultyProjects && facultyProjects.length === 0 && (
				<Alert className="max-w-2xl mx-auto my-8">
					<AlertCircle className="h-4 w-4" />
					<AlertTitle>No Projects Found</AlertTitle>
					<AlertDescription>
						No projects were found for the selected semester. Please select a different
						semester or contact your administrator.
					</AlertDescription>
				</Alert>
			)}
		</div>
	);
}

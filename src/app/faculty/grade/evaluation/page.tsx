'use client';

import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Clock, Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { getActiveSemester } from '@/utils/actions/admin/get-active-semester';
import { useGetSemesterTimeline } from '@/utils/hooks/admin/use-get-semester-timeline';
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
	const [isSupervisor, setIsSupervisor] = useState(false);
	const [isModerator, setIsModerator] = useState(false);
	const [isGradingPeriodActive, setIsGradingPeriodActive] = useState<boolean | null>(null);
	const [gradingPeriodMessage, setGradingPeriodMessage] = useState<string>('');

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

	// Get active semester
	const {
		data: activeSemester,
		isLoading: isSemesterLoading,
		error: semesterError,
	} = useQuery({
		queryKey: ['active-semester'],
		queryFn: async () => {
			return await getActiveSemester();
		},
	});

	// Get semester timeline
	const {
		data: timelineEvents,
		isLoading: isTimelineLoading,
		error: _timelineError,
	} = useGetSemesterTimeline(activeSemester?.id || 0);

	// Check if current date is within the Faculty Mark Entry period
	useEffect(() => {
		if (timelineEvents) {
			console.log('SEMESTER TIMELINE EVENTS:', timelineEvents);
			console.log('Total timeline events:', timelineEvents.length);

			// Log each event with its type and dates
			timelineEvents.forEach((event) => {
				// Using name field instead of type, based on the logged data structure
				console.log(
					`Event name: ${event.name}, Start: ${event.start_date}, End: ${event.end_date}`
				);
			});

			// Find the faculty mark entry event
			const markEntryEvent = timelineEvents.find((e) => e.name === 'Faculty Mark Entry');

			if (markEntryEvent) {
				console.log('Faculty mark entry period:', markEntryEvent);
				const now = new Date();
				const startDate = markEntryEvent.start_date
					? new Date(markEntryEvent.start_date)
					: now;
				const endDate = markEntryEvent.end_date ? new Date(markEntryEvent.end_date) : now;

				const isWithinPeriod = now >= startDate && now <= endDate;
				console.log('Is mark entry active now?', isWithinPeriod);

				setIsGradingPeriodActive(isWithinPeriod);

				if (now < startDate) {
					// Grading period hasn't started yet
					const daysUntilStart = Math.ceil(
						(startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
					);
					setGradingPeriodMessage(
						`The grading period will start in ${daysUntilStart} day${daysUntilStart !== 1 ? 's' : ''} (${startDate.toLocaleDateString()})`
					);
				} else if (now > endDate) {
					// Grading period has ended
					setGradingPeriodMessage(
						`The grading period has ended on ${endDate.toLocaleDateString()}`
					);
				}
			} else {
				// No faculty mark entry event found
				setIsGradingPeriodActive(false);
				setGradingPeriodMessage('No grading period has been scheduled for this semester');
			}
		}
	}, [timelineEvents]);

	// Fetch faculty projects based on active semester
	const {
		data: facultyProjects,
		isLoading: isProjectsLoading,
		error: projectsError,
	} = useGetFacultyProjects(activeSemester?.id || null, userEmail);

	// Add debug logging for faculty projects
	useEffect(() => {
		if (activeSemester) {
			console.log('Active semester:', activeSemester);
			console.log('User email being used:', userEmail);
		}

		if (facultyProjects) {
			console.log('Faculty projects loaded:', facultyProjects.length);
			console.log('Faculty projects:', facultyProjects);
		}
	}, [activeSemester, facultyProjects, userEmail]);

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
			<AlertDescription>Failed to load projects. Please try again.</AlertDescription>
		</Alert>
	) : null;

	// Show error for semester fetch if needed
	const semesterErrorContent = semesterError ? (
		<Alert variant="destructive" className="max-w-2xl mx-auto my-4">
			<AlertCircle className="h-4 w-4" />
			<AlertTitle>Error</AlertTitle>
			<AlertDescription>
				Failed to load active semester. Please try again later.
			</AlertDescription>
		</Alert>
	) : null;

	// Show grading period inactive message
	const gradingPeriodInactiveContent =
		isGradingPeriodActive === false ? (
			<Alert className="mb-6 bg-amber-200/20">
				<Clock className="h-4 w-4 text-amber-600" />
				<AlertTitle className="flex items-center gap-2">Grading Period Inactive</AlertTitle>
				<AlertDescription>{gradingPeriodMessage}</AlertDescription>
			</Alert>
		) : (
			<Alert className="mb-6 bg-blue-200/20">
				<Clock className="h-4 w-4 text-blue-600" />
				<AlertTitle className="flex items-center gap-2">Grading Period Active</AlertTitle>
				<AlertDescription>
					You can submit grades until the end of the faculty mark entry period.
				</AlertDescription>
			</Alert>
		);

	// Check if page is still loading timeline or semester data
	const isLoadingInitialData = isSemesterLoading || isTimelineLoading;

	// Main function to render page content based on grading period status
	const renderPageContent = () => {
		// If still loading initial data, show loading
		if (isLoadingInitialData) {
			return loadingContent;
		}

		// Show the regular content, with disabled tabs/forms if grading period is inactive
		return (
			<>
				{/* Display grading period alert */}
				{gradingPeriodInactiveContent}

				<div className="mb-8">
					<div className="flex flex-col md:flex-row gap-4 mb-6">
						{/* Active semester info */}
						<div className="w-full md:w-1/3">
							<label className="text-sm font-medium mb-1 block">
								Active Semester
							</label>
							<div className="h-10 px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background flex items-center">
								{isSemesterLoading ? (
									<span className="text-muted-foreground">
										Loading semester...
									</span>
								) : activeSemester ? (
									<span>
										{activeSemester.academicYear} - {activeSemester.name}
									</span>
								) : (
									<span className="text-muted-foreground">
										No active semester found
									</span>
								)}
							</div>
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
									facultyProjects.length === 0 ||
									isGradingPeriodActive === false
								}
							>
								<SelectTrigger className="w-full">
									<SelectValue
										placeholder={
											isProjectsLoading
												? 'Loading projects...'
												: 'Select project'
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
				{semesterErrorContent}

				{selectedProjectId && projectDetails && (
					<>
						<Card className="mb-8">
							<CardHeader>
								<CardTitle>Project Details</CardTitle>
								<CardDescription>
									Key information about this project
								</CardDescription>
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
											{projectDetails?.academic_year} -{' '}
											{projectDetails?.semester}
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
								<TabsTrigger
									value="supervisor"
									disabled={isGradingPeriodActive === false}
								>
									Supervisor Assessment
								</TabsTrigger>
								<TabsTrigger
									value="moderator"
									disabled={isGradingPeriodActive === false}
								>
									Moderator Assessment
								</TabsTrigger>
								<TabsTrigger
									value="peerReview"
									disabled={isGradingPeriodActive === false}
								>
									Peer Reviews
								</TabsTrigger>
								<TabsTrigger
									value="gradedComponents"
									disabled={isGradingPeriodActive === false}
								>
									Graded Components
								</TabsTrigger>
								<TabsTrigger value="summary">Assessment Summary</TabsTrigger>
							</TabsList>

							<TabsContent value="supervisor" className="space-y-4">
								{isSupervisor ? (
									<SupervisorGradingForm
										projectId={selectedProjectId}
										teamMembers={projectDetails?.team_members || []}
										disabled={isGradingPeriodActive === false}
									/>
								) : (
									<Alert className="max-w-2xl mx-auto my-8">
										<AlertCircle className="h-4 w-4" />
										<AlertTitle>Access Restricted</AlertTitle>
										<AlertDescription>
											You are not a supervisor for this project. If you
											believe this is an error, please contact the admin or
											course coordinator.
										</AlertDescription>
									</Alert>
								)}
							</TabsContent>

							<TabsContent value="moderator" className="space-y-4">
								{isModerator ? (
									<ModeratorGradingForm
										projectId={selectedProjectId}
										disabled={isGradingPeriodActive === false}
									/>
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
									<PeerReviewTab
										projectId={selectedProjectId}
										disabled={isGradingPeriodActive === false}
									/>
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
										disabled={isGradingPeriodActive === false}
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
							No projects were found for the active semester. Please contact your
							administrator if you believe this is an error.
						</AlertDescription>
					</Alert>
				)}
			</>
		);
	};

	return <div className="mx-auto py-8 px-4">{renderPageContent()}</div>;
}

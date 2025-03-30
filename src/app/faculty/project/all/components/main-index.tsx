'use client';

import { useEffect, useMemo, useState } from 'react';

import { Programme, Project, Semester, User } from '@/utils/actions/admin/types';
import { Programme as LeaderProgramme } from '@/utils/actions/faculty/check-programme-leader';
import { useGetFacultyUsers } from '@/utils/hooks/admin/use-get-facullty-users';
import { useGetProjectProgrammes } from '@/utils/hooks/admin/use-get-project-programmes';
import { useGetProjectsBySemester } from '@/utils/hooks/admin/use-get-projects-by-semester';
import { useGetSemesters } from '@/utils/hooks/admin/use-get-semesters';
import { useCheckCourseCoordinator } from '@/utils/hooks/faculty/use-check-course-coordinator';
import { useCheckProgrammeLeader } from '@/utils/hooks/faculty/use-check-programme-leader';
import { useGetProgrammeLeaderProjects } from '@/utils/hooks/faculty/use-get-programme-leader-projects';
import { useToast } from '@/utils/hooks/use-toast';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

import { EnhancedProject, ProjectStatus } from '@/app/faculty/project/all/components/columns';
import ProjectList from '@/app/faculty/project/all/components/project-list';

// Define interface for Programme Leader API response
interface ProgrammeLeaderResponse {
	message: string;
	programmes?: Programme[];
	projects?: Project[];
}

// Helper function to transform Project to EnhancedProject
const enhanceProject = (
	project: Project,
	programmes: Programme[],
	_faculty: User[] = []
): EnhancedProject => {
	// Find the programme for this project
	// Handle both camelCase and snake_case field names
	const programmeId = project.programmeId || project.programme_id || 0;

	console.log(`Enhancing project: ${project.id} - ${project.title}`);
	console.log(`Project programmeId: ${programmeId}`);
	console.log(
		`Available programmes:`,
		programmes.map((p) => ({ id: p.id, ProgrammeID: p.ProgrammeID, name: p.name }))
	);

	const programme = programmes.find((p) => {
		// Handle both PascalCase and camelCase field names in programmes
		const id = p.ProgrammeID || p.id || 0;
		return id === programmeId;
	}) || {
		id: programmeId,
		ProgrammeID: programmeId,
		name: project.programmeName || project.programme_name || 'Unknown',
		Name: project.programmeName || project.programme_name || 'Unknown',
	};

	console.log(`Selected programme:`, programme);

	// Create an enhanced project with required fields
	const enhancedProject = {
		...project,
		professor: {
			id: project.professorId || project.professor_id || 0,
			name: project.professorName || project.professor_name || 'Unknown Faculty',
		},
		moderator: {
			id: project.moderatorId || project.moderator_id || 0,
			name: project.moderatorName || project.moderator_name || 'N/A',
		},
		programme: {
			id: programme.ProgrammeID || programme.id || 0,
			name:
				programme.Name ||
				programme.name ||
				project.programmeName ||
				project.programme_name ||
				'Unknown',
		},
		status: (project.status || 'open') as ProjectStatus,
	};

	console.log(`Enhanced project:`, enhancedProject);
	return enhancedProject;
};

export default function FacultyProjectsPage() {
	const { toast } = useToast();

	// State
	const [semesterId, setSemesterId] = useState<number | null>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedProgrammeId, setSelectedProgrammeId] = useState<string>('all');
	const [isCourseCoordinator, setIsCourseCoordinator] = useState(false);
	const [isProgrammeLeader, setIsProgrammeLeader] = useState(false);
	const [programmeLeaderProgrammes, setProgrammeLeaderProgrammes] = useState<LeaderProgramme[]>(
		[]
	);
	const [isCheckingRoles, setIsCheckingRoles] = useState(false);

	// Get semesters data first
	const { data: semesters = [], isLoading: semestersLoading } = useGetSemesters({
		onError: (error: unknown) => {
			console.error('Error fetching semesters:', error);
			toast({
				title: 'Error',
				description: 'Failed to load semesters data',
				variant: 'destructive',
			});
		},
	});

	// Get user email from cookies
	const facultyEmail = useMemo(() => {
		if (typeof document !== 'undefined') {
			const cookies = document.cookie.split(';');
			for (const cookie of cookies) {
				const [key, value] = cookie.trim().split('=');
				if (key === 'user-email' || key === 'email') {
					return decodeURIComponent(value);
				}
			}
		}
		return '';
	}, []);

	// Check roles only after a semester is selected
	const {
		data: coordData,
		isLoading: _coordLoading,
		isFetched: _coordFetched,
		refetch: refetchCoordData,
	} = useCheckCourseCoordinator({
		enabled: false, // Don't auto-fetch, we'll trigger manually
	});

	const {
		data: leaderData,
		isLoading: _leaderLoading,
		isFetched: _leaderFetched,
		refetch: refetchLeaderData,
	} = useCheckProgrammeLeader(facultyEmail, {
		enabled: false, // Don't auto-fetch, we'll trigger manually
	});

	// Fetch role data when semester changes
	useEffect(() => {
		async function checkRoles() {
			if (!semesterId) return;

			setIsCheckingRoles(true);

			try {
				// Refetch both role checks
				await Promise.all([refetchCoordData(), refetchLeaderData()]);

				// Process results
				setIsCourseCoordinator(coordData?.isCourseCoordinator || false);

				const isLeader =
					leaderData?.isProgrammeLeader || leaderData?.is_programme_leader || false;
				setIsProgrammeLeader(isLeader);

				if (isLeader && leaderData && leaderData.programmes) {
					setProgrammeLeaderProgrammes(leaderData.programmes || []);
				}

				console.log('Role check completed:', {
					isCourseCoordinator: coordData?.isCourseCoordinator,
					isProgrammeLeader: isLeader,
					programmes: leaderData?.programmes,
				});
			} catch (error) {
				console.error('Error checking roles:', error);
				toast({
					title: 'Error',
					description: 'Failed to check user roles',
					variant: 'destructive',
				});
			} finally {
				setIsCheckingRoles(false);
			}
		}

		if (semesterId) {
			checkRoles();
		}
	}, [semesterId, refetchCoordData, refetchLeaderData, coordData, leaderData, toast]);

	// Admin & Course Coordinator Data Fetching
	const {
		data: projectsData = [],
		isLoading: projectsLoading,
		refetch: refetchProjects,
	} = useGetProjectsBySemester(semesterId || 0, {
		enabled: semesterId !== null && isCourseCoordinator && !isProgrammeLeader,
	});

	// Programme Leader Data Fetching
	const {
		data: programmeLeaderProjectsData = {} as ProgrammeLeaderResponse,
		isLoading: programmeLeaderProjectsLoading,
		refetch: _refetchProgrammeLeaderProjects,
	} = useGetProgrammeLeaderProjects(semesterId || 0, facultyEmail, {
		enabled: semesterId !== null && isProgrammeLeader,
	});

	// Get programmes and faculty data after semester is selected
	const { data: programmesData = [], isLoading: _programmesLoading } = useGetProjectProgrammes(
		semesterId || 0,
		{
			enabled: semesterId !== null,
		}
	);

	const { data: facultyData, isLoading: _facultyLoading } = useGetFacultyUsers({
		enabled: semesterId !== null,
	});

	// Combined data logging effects
	useEffect(() => {
		// Log projects data
		if (projectsData.length > 0) {
			console.log('Projects data from API (Course Coordinator view):', projectsData);
		}

		// Log programme leader projects
		if (programmeLeaderProjectsData) {
			console.log('Programme Leader Projects data from API:', programmeLeaderProjectsData);
		}

		// Log programmes data
		if (programmesData.length > 0) {
			console.log('Programmes data from API:', programmesData);
		}

		// Log faculty data
		if (facultyData) {
			console.log('Faculty data from API:', facultyData);
		}
	}, [projectsData, programmeLeaderProjectsData, programmesData, facultyData]);

	// Handle semester selection
	const handleSemesterChange = (id: string) => {
		const numId = parseInt(id);
		setSemesterId(numId);
		setSelectedProgrammeId('all');
		setIsCourseCoordinator(false);
		setIsProgrammeLeader(false);
		setProgrammeLeaderProgrammes([]);
	};

	// Combined projects from both sources
	const allProjects = useMemo(() => {
		if (isProgrammeLeader && programmeLeaderProjectsData) {
			// Check if it's an object with a projects property
			if (
				programmeLeaderProjectsData &&
				typeof programmeLeaderProjectsData === 'object' &&
				'projects' in programmeLeaderProjectsData
			) {
				return programmeLeaderProjectsData.projects || [];
			}
			// Otherwise, it must be an array already
			return programmeLeaderProjectsData;
		}
		return projectsData;
	}, [isProgrammeLeader, programmeLeaderProjectsData, projectsData]);

	// Transform projects
	const enhancedProjects = useMemo(() => {
		// Ensure allProjects is an array before mapping
		if (!allProjects || !Array.isArray(allProjects)) {
			console.warn('allProjects is not an array:', allProjects);
			return [];
		}

		const typedProjects = allProjects as Project[];
		const typedProgrammes = programmesData as Programme[];
		const typedFaculty = facultyData as User[];

		// Additional check to ensure typedProjects is definitely an array
		return Array.isArray(typedProjects)
			? typedProjects.map((project) => enhanceProject(project, typedProgrammes, typedFaculty))
			: [];
	}, [allProjects, programmesData, facultyData]);

	// Filter projects based on search term and selected programme
	const filteredProjects = useMemo(() => {
		let filtered = enhancedProjects;

		if (searchTerm.trim()) {
			const lowerSearchTerm = searchTerm.toLowerCase();
			filtered = filtered.filter(
				(project) =>
					project.title?.toLowerCase().includes(lowerSearchTerm) ||
					project.programme.name.toLowerCase().includes(lowerSearchTerm) ||
					project.professor.name.toLowerCase().includes(lowerSearchTerm) ||
					project.moderator.name.toLowerCase().includes(lowerSearchTerm)
			);
		}

		// Apply programme filter for programme leaders
		if (isProgrammeLeader && selectedProgrammeId && selectedProgrammeId !== 'all') {
			const programmeIdNum = parseInt(selectedProgrammeId);
			filtered = filtered.filter((project) => project.programme.id === programmeIdNum);
		}

		return filtered;
	}, [enhancedProjects, searchTerm, isProgrammeLeader, selectedProgrammeId]);

	// Determine if we're loading projects
	const isLoadingProjects =
		(isCourseCoordinator && projectsLoading) ||
		(isProgrammeLeader && programmeLeaderProjectsLoading);

	// Determine user role for display
	const userRoleDisplay = useMemo(() => {
		if (isCourseCoordinator) return 'Course Coordinator';
		if (isProgrammeLeader) return 'Programme Leader';
		return 'Faculty';
	}, [isCourseCoordinator, isProgrammeLeader]);

	// Render content based on state
	const renderContent = () => {
		if (!semesterId) {
			return (
				<div className="flex flex-col items-center justify-center p-8 text-center">
					<div className="text-xl font-semibold mb-4">Please select a semester</div>
					<p className="text-muted-foreground">
						Select a semester from the dropdown above to view projects.
					</p>
				</div>
			);
		}

		if (isCheckingRoles) {
			return (
				<div className="flex flex-col items-center justify-center p-8">
					<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-4"></div>
					<p className="text-muted-foreground">Checking permissions...</p>
				</div>
			);
		}

		if (isLoadingProjects) {
			return (
				<div className="flex flex-col items-center justify-center p-8">
					<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-4"></div>
					<p className="text-muted-foreground">Loading projects...</p>
				</div>
			);
		}

		if (!isCourseCoordinator && !isProgrammeLeader) {
			return (
				<div className="flex flex-col items-center justify-center p-8 text-center">
					<div className="text-xl font-semibold mb-4">No access to this semester</div>
					<p className="text-muted-foreground">
						You are not registered as a Course Coordinator or Programme Leader for this
						semester.
					</p>
				</div>
			);
		}

		if (filteredProjects.length === 0) {
			return (
				<div className="flex flex-col items-center justify-center p-8 text-center">
					<div className="text-xl font-semibold mb-4">No projects found</div>
					<p className="text-muted-foreground">
						{searchTerm || selectedProgrammeId
							? 'No projects match your search criteria.'
							: 'There are no projects available for the selected semester.'}
					</p>
					{(searchTerm || selectedProgrammeId) && (
						<Button
							variant="outline"
							onClick={() => {
								setSearchTerm('');
								setSelectedProgrammeId('');
							}}
							className="mt-4"
						>
							Clear Filters
						</Button>
					)}
				</div>
			);
		}

		return (
			<ProjectList
				projects={filteredProjects}
				programmes={programmesData}
				onProjectUpdate={() => refetchProjects()}
				onRefresh={() => refetchProjects()}
				isLoading={isLoadingProjects}
				isCourseCoordinator={isCourseCoordinator}
			/>
		);
	};

	// Main loading state
	if (semestersLoading) {
		return (
			<div className="mx-auto py-6">
				<Card>
					<CardContent className="flex items-center justify-center py-10">
						<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="mx-auto py-6">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<div>
						<CardTitle className="text-2xl font-bold">Projects</CardTitle>
						{isProgrammeLeader && (
							<div className="flex items-center space-x-2 mt-1">
								<Badge variant="outline">{userRoleDisplay}</Badge>
								{isProgrammeLeader && programmeLeaderProgrammes.length > 0 && (
									<Badge variant="secondary">
										{programmeLeaderProgrammes.length > 1
											? `${programmeLeaderProgrammes.length} Programmes`
											: programmeLeaderProgrammes[0].code}
									</Badge>
								)}
							</div>
						)}
					</div>
				</CardHeader>

				<CardContent>
					{/* Controls */}
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
						{/* Semester Selection - Always visible */}
						<div className="space-y-2">
							<Label htmlFor="semester">Semester</Label>
							<Select
								value={semesterId?.toString() || ''}
								onValueChange={handleSemesterChange}
							>
								<SelectTrigger id="semester">
									<SelectValue placeholder="Select Semester" />
								</SelectTrigger>
								<SelectContent>
									{(semesters || []).map((semester: Semester) => (
										<SelectItem
											key={semester.id}
											value={semester.id.toString()}
										>
											{semester.academicYear} - {semester.name}{' '}
											{semester.isActive && '(Current)'}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Only show filters if role check is complete and user has access */}
						{isProgrammeLeader && !isLoadingProjects && (
							<>
								{/* Programme Filter for Programme Leaders with multiple programmes */}
								{isProgrammeLeader && programmeLeaderProgrammes.length > 1 && (
									<div className="space-y-2">
										<Label htmlFor="programme">Programme</Label>
										<Select
											value={selectedProgrammeId}
											onValueChange={setSelectedProgrammeId}
										>
											<SelectTrigger id="programme">
												<SelectValue placeholder="All Programmes" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="all">All Programmes</SelectItem>
												{programmeLeaderProgrammes.map((programme) => (
													<SelectItem
														key={programme.programme_id}
														value={programme.programme_id.toString()}
													>
														{programme.code || programme.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								)}

								{/* Search Input */}
								<div className="space-y-2 md:col-span-2">
									<Label htmlFor="search">Search</Label>
									<Input
										id="search"
										placeholder="Search by title, programme, professor, or moderator..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
									/>
								</div>
							</>
						)}
					</div>

					{/* Content Area */}
					{renderContent()}
				</CardContent>
			</Card>
		</div>
	);
}

'use client';

import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

import { EnhancedProject, ProjectStatus } from '@/app/faculty/project/all/components/columns';
import { ProjectDetailsModal } from '@/app/faculty/project/view/components/project-detail-modals';

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

	// Project details modal state
	const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
	const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

	// Handle view project details
	const handleViewDetails = (projectId: number) => {
		setSelectedProjectId(projectId);
		setIsDetailsModalOpen(true);
	};

	// Pagination state
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	// Sorting state
	const [sortColumn, setSortColumn] = useState<string | null>(null);
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

	// Handle page size change
	const handlePageSizeChange = (value: string) => {
		const newSize = parseInt(value, 10);
		setPageSize(newSize);
		// Adjust current page to maintain approximate scroll position
		const firstItemIndex = (currentPage - 1) * pageSize;
		const newPage = Math.floor(firstItemIndex / newSize) + 1;
		setCurrentPage(newPage);
	};

	// Handle sorting toggle
	const toggleSort = (column: string) => {
		if (sortColumn === column) {
			// Cycle through: asc -> desc -> null
			if (sortDirection === 'asc') {
				setSortDirection('desc');
			} else if (sortDirection === 'desc') {
				setSortColumn(null);
				setSortDirection(null);
			} else {
				setSortDirection('asc');
			}
		} else {
			setSortColumn(column);
			setSortDirection('asc');
		}
	};

	// Handle page change
	const handlePageChange = (newPage: number) => {
		setCurrentPage(newPage);
	};

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

				// Process results - Check Course Coordinator first, then Programme Leader
				const isCoordinator = coordData?.isCourseCoordinator || false;
				setIsCourseCoordinator(isCoordinator);

				const isLeader =
					leaderData?.isProgrammeLeader || leaderData?.is_programme_leader || false;
				setIsProgrammeLeader(isLeader);

				if (isLeader && leaderData && leaderData.programmes) {
					setProgrammeLeaderProgrammes(leaderData.programmes || []);
				}

				console.log('Role check completed:', {
					isCourseCoordinator: isCoordinator,
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
	const { data: projectsData = [], isLoading: projectsLoading } = useGetProjectsBySemester(
		semesterId || 0,
		{
			enabled: semesterId !== null && isCourseCoordinator,
		}
	);

	// Programme Leader Data Fetching
	const {
		data: programmeLeaderProjectsData = {} as ProgrammeLeaderResponse,
		isLoading: programmeLeaderProjectsLoading,
		refetch: _refetchProgrammeLeaderProjects,
	} = useGetProgrammeLeaderProjects(semesterId || 0, facultyEmail, {
		enabled: semesterId !== null && isProgrammeLeader && !isCourseCoordinator,
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
		if (isCourseCoordinator) {
			// Course coordinator can see all projects
			return projectsData;
		} else if (isProgrammeLeader && programmeLeaderProjectsData) {
			// Handle response format from Programme Leader API
			if (
				programmeLeaderProjectsData &&
				typeof programmeLeaderProjectsData === 'object' &&
				'projects' in programmeLeaderProjectsData
			) {
				return programmeLeaderProjectsData.projects || [];
			}
			return programmeLeaderProjectsData;
		}
		return [];
	}, [isCourseCoordinator, isProgrammeLeader, programmeLeaderProjectsData, projectsData]);

	// Transform projects
	const _enhancedProjects = useMemo(() => {
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

	// Filter projects based on selected programme and search term
	const filteredProjects = useMemo(() => {
		// Safely extract projects array from the response
		let projects: Project[] = [];

		if (programmeLeaderProjectsData && typeof programmeLeaderProjectsData === 'object') {
			// Check if it's a ProgrammeLeaderResponse with projects property
			if (
				'projects' in programmeLeaderProjectsData &&
				Array.isArray(programmeLeaderProjectsData.projects)
			) {
				projects = programmeLeaderProjectsData.projects;
			} else if (Array.isArray(programmeLeaderProjectsData)) {
				// Handle case where it's directly an array
				projects = programmeLeaderProjectsData;
			}
		}

		// Filter the projects array
		return projects.filter((project) => {
			// Filter by programme if selected
			if (selectedProgrammeId && selectedProgrammeId !== 'all') {
				const projectProgrammeId = project.programmeId || project.programme_id;
				if (projectProgrammeId?.toString() !== selectedProgrammeId) {
					return false;
				}
			}

			// Filter by search term
			if (searchTerm) {
				const searchLower = searchTerm.toLowerCase();
				return (
					project.title?.toLowerCase().includes(searchLower) ||
					project.description?.toLowerCase().includes(searchLower) ||
					project.professorName?.toLowerCase().includes(searchLower) ||
					project.professor_name?.toLowerCase().includes(searchLower) ||
					project.moderatorName?.toLowerCase().includes(searchLower) ||
					project.moderator_name?.toLowerCase().includes(searchLower) ||
					project.programmeName?.toLowerCase().includes(searchLower) ||
					project.programme_name?.toLowerCase().includes(searchLower)
				);
			}

			return true;
		});
	}, [programmeLeaderProjectsData, selectedProgrammeId, searchTerm]);

	// Apply sorting to filtered projects
	const sortedProjects = useMemo(() => {
		if (!filteredProjects || !sortColumn || !sortDirection) return filteredProjects;

		return [...filteredProjects].sort((a, b) => {
			let aValue: string | number = '';
			let bValue: string | number = '';

			switch (sortColumn) {
				case 'title':
					aValue = a.title || '';
					bValue = b.title || '';
					break;
				case 'programme':
					aValue = a.programmeName || a.programme_name || '';
					bValue = b.programmeName || b.programme_name || '';
					break;
				case 'professor':
					aValue = a.professorName || a.professor_name || '';
					bValue = b.professorName || b.professor_name || '';
					break;
				case 'moderator':
					aValue = a.moderatorName || a.moderator_name || '';
					bValue = b.moderatorName || b.moderator_name || '';
					break;
				default:
					return 0;
			}

			// Handle string comparisons
			if (typeof aValue === 'string' && typeof bValue === 'string') {
				const comparison = aValue.localeCompare(bValue);
				return sortDirection === 'asc' ? comparison : -comparison;
			}

			// Handle number comparisons
			const numA = typeof aValue === 'number' ? aValue : 0;
			const numB = typeof bValue === 'number' ? bValue : 0;

			return sortDirection === 'asc' ? numA - numB : numB - numA;
		});
	}, [filteredProjects, sortColumn, sortDirection]);

	// Pagination calculations
	const totalItems = sortedProjects.length;
	const totalPages = Math.ceil(totalItems / pageSize);
	const startIndex = (currentPage - 1) * pageSize;
	const endIndex = Math.min(startIndex + pageSize, totalItems);

	// Get current page of projects
	const currentProjects = useMemo(() => {
		return sortedProjects.slice(startIndex, endIndex);
	}, [sortedProjects, startIndex, endIndex]);

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
				<div className="py-4 text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
					<p>Checking access rights...</p>
				</div>
			);
		}

		// If no semester selected yet
		if (semesterId === null) {
			return (
				<div className="py-6 text-center text-muted-foreground">
					<p className="mb-2">Please select a semester to view projects.</p>
				</div>
			);
		}

		// If user doesn't have required role
		if (!isCourseCoordinator && !isProgrammeLeader) {
			return (
				<div className="py-6 text-center text-muted-foreground">
					<p className="mb-2">
						You don&apos;t have access to view projects. Please contact your
						administrator.
					</p>
				</div>
			);
		}

		// If loading projects
		if (isLoadingProjects) {
			return (
				<div className="py-4 text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
					<p>Loading projects...</p>
				</div>
			);
		}

		// If no projects found
		if (filteredProjects.length === 0) {
			return (
				<div className="py-6 text-center text-muted-foreground">
					<p className="mb-2">
						No projects found.
						{searchTerm && ` Try adjusting your search criteria.`}
					</p>
					{(searchTerm || selectedProgrammeId !== 'all') && (
						<Button
							variant="outline"
							onClick={() => {
								setSearchTerm('');
								setSelectedProgrammeId('all');
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
			<div className="space-y-4">
				{/* Sortable Table */}
				<div className="border rounded-md overflow-hidden">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead
									className="w-[40%] cursor-pointer hover:bg-muted/50"
									onClick={() => toggleSort('title')}
								>
									<div className="flex items-center">
										Project Title
										<ArrowUpDown className="ml-2 h-4 w-4" />
										{sortColumn === 'title' && (
											<span className="ml-2 text-xs">
												{sortDirection === 'asc' ? '↑' : '↓'}
											</span>
										)}
									</div>
								</TableHead>
								<TableHead
									className="cursor-pointer hover:bg-muted/50"
									onClick={() => toggleSort('programme')}
								>
									<div className="flex items-center">
										Programme
										<ArrowUpDown className="ml-2 h-4 w-4" />
										{sortColumn === 'programme' && (
											<span className="ml-2 text-xs">
												{sortDirection === 'asc' ? '↑' : '↓'}
											</span>
										)}
									</div>
								</TableHead>
								<TableHead
									className="cursor-pointer hover:bg-muted/50"
									onClick={() => toggleSort('professor')}
								>
									<div className="flex items-center">
										Supervisor
										<ArrowUpDown className="ml-2 h-4 w-4" />
										{sortColumn === 'professor' && (
											<span className="ml-2 text-xs">
												{sortDirection === 'asc' ? '↑' : '↓'}
											</span>
										)}
									</div>
								</TableHead>
								<TableHead
									className="cursor-pointer hover:bg-muted/50"
									onClick={() => toggleSort('moderator')}
								>
									<div className="flex items-center">
										Moderator
										<ArrowUpDown className="ml-2 h-4 w-4" />
										{sortColumn === 'moderator' && (
											<span className="ml-2 text-xs">
												{sortDirection === 'asc' ? '↑' : '↓'}
											</span>
										)}
									</div>
								</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{currentProjects.map((project) => (
								<TableRow key={project.id}>
									<TableCell className="font-medium">{project.title}</TableCell>
									<TableCell>
										{project.programmeName || project.programme_name}
									</TableCell>
									<TableCell>
										{project.professorName || project.professor_name}
									</TableCell>
									<TableCell>
										{project.moderatorName || project.moderator_name || 'N/A'}
									</TableCell>
									<TableCell className="text-right">
										<Button
											variant="ghost"
											onClick={() => handleViewDetails(project.id)}
										>
											View Details
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>

				{/* Pagination Controls */}
				<div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
					<div className="text-sm text-muted-foreground">
						Showing {startIndex + 1} to {endIndex} of {totalItems} items
					</div>

					<div className="flex items-center space-x-6">
						<div className="flex items-center space-x-2">
							<p className="text-sm whitespace-nowrap">Rows per page</p>
							<Select
								value={pageSize.toString()}
								onValueChange={handlePageSizeChange}
							>
								<SelectTrigger className="h-8 w-[70px]">
									<SelectValue placeholder={pageSize.toString()} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="5">5</SelectItem>
									<SelectItem value="10">10</SelectItem>
									<SelectItem value="20">20</SelectItem>
									<SelectItem value="50">50</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="flex items-center space-x-2">
							<Button
								variant="outline"
								size="icon"
								disabled={currentPage === 1}
								onClick={() => handlePageChange(currentPage - 1)}
							>
								<ChevronLeft className="h-4 w-4" />
							</Button>
							<span className="text-sm">
								Page {currentPage} of {totalPages || 1}
							</span>
							<Button
								variant="outline"
								size="icon"
								disabled={currentPage === totalPages || totalPages === 0}
								onClick={() => handlePageChange(currentPage + 1)}
							>
								<ChevronRight className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</div>

				{/* Project Details Modal */}
				<ProjectDetailsModal
					projectId={selectedProjectId}
					isOpen={isDetailsModalOpen}
					onClose={() => setIsDetailsModalOpen(false)}
				/>
			</div>
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
						<div className="flex items-center space-x-2 mt-1">
							{isCourseCoordinator && (
								<Badge variant="outline">Course Coordinator</Badge>
							)}
							{!isCourseCoordinator && isProgrammeLeader && (
								<>
									<Badge variant="outline">{userRoleDisplay}</Badge>
									{programmeLeaderProgrammes.length > 0 && (
										<Badge variant="secondary">
											{programmeLeaderProgrammes.length > 1
												? `${programmeLeaderProgrammes.length} Programmes`
												: programmeLeaderProgrammes[0].code}
										</Badge>
									)}
								</>
							)}
						</div>
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
						{(isCourseCoordinator || isProgrammeLeader) && !isLoadingProjects && (
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

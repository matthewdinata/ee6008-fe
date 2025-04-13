'use client';

import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { getProjectProgrammes } from '@/utils/actions/admin/project';
import { Programme, Project } from '@/utils/actions/admin/types';
import { useGetSemesters } from '@/utils/hooks/admin/use-get-semesters';
import { useGetFacultyProjects } from '@/utils/hooks/faculty/use-faculty-get-projects';
import { useToast } from '@/utils/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

import { EnhancedProject, ProjectStatus } from '@/app/admin/project/all/components/columns';

import { ProjectDetailsModal } from './components/project-detail-modals';

// Helper function to transform Project to EnhancedProject
const enhanceProject = (project: Project, _programmes: Programme[]): EnhancedProject => {
	return {
		...project,
		professor: {
			id: project.professorId ?? project.professor_id ?? 0,
			name: project.professorName ?? project.professor_name ?? 'Not assigned',
		},
		programme: {
			id: project.programmeId ?? project.programme_id ?? 0,
			name: project.programmeName ?? project.programme_name ?? 'Unknown',
		},
		status: ProjectStatus.APPROVED, // Default status for faculty projects
	};
};

export default function FacultyProjectsPage() {
	const { toast } = useToast();
	const {
		data: semesters,
		isLoading: isSemestersLoading,
		error: semestersError,
	} = useGetSemesters();

	const [projects, setProjects] = useState<Project[]>([]);
	const [filteredProjects, setFilteredProjects] = useState<EnhancedProject[]>([]);
	const [loading, setLoading] = useState(true);
	const [programmes, setProgrammes] = useState<Programme[]>([]);
	const [_isCourseCoordinator, setIsCourseCoordinator] = useState<boolean>(false);
	const [semesterId, setSemesterId] = useState<number | null>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
	const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

	// Pagination state
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	// Handle page size change
	const handlePageSizeChange = (value: string) => {
		const newSize = parseInt(value, 10);
		setPageSize(newSize);
		// Adjust current page to maintain approximate scroll position
		const firstItemIndex = (currentPage - 1) * pageSize;
		const newPage = Math.floor(firstItemIndex / newSize) + 1;
		setCurrentPage(newPage);
	};

	// Get user email from cookies
	const facultyEmail = useMemo(() => {
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
			2222;

			return email;
		}
		return '';
	}, []);

	// Only log in development, with reduced frequency
	useMemo(() => {
		if (process.env.NODE_ENV === 'development') {
			console.log('Page rendering with semesterId:', semesterId, 'and email:', facultyEmail);
		}
	}, [semesterId, facultyEmail]);

	// Handle semester selection
	const handleSemesterChange = (value: string) => {
		console.log('Selected semester ID:', value);
		setSemesterId(value ? parseInt(value, 10) : null);
	};

	const {
		data: projectsData,
		isLoading: isProjectsLoading,
		error: projectsError,
	} = useGetFacultyProjects(semesterId, facultyEmail, {
		onError: (error) => {
			console.error('Error in useGetFacultyProjects:', error);
			toast({
				title: 'Error',
				description: 'Failed to load projects',
				variant: 'destructive',
			});
		},
	});

	useMemo(() => {
		if (process.env.NODE_ENV === 'development') {
			console.log('Projects query state:', {
				data: projectsData,
				isLoading: isProjectsLoading,
				error: projectsError,
				semesterId,
				facultyEmail,
			});
		}
	}, [projectsData, isProjectsLoading, projectsError, semesterId, facultyEmail]);

	// Update projects when projectsData changes
	useEffect(() => {
		if (!isProjectsLoading && projectsData) {
			console.log('Setting projects from projectsData:', projectsData);
			// Directly convert and enhance projects
			const enhancedProjects = projectsData.map((p) => enhanceProject(p, programmes));
			setProjects(projectsData);
			setFilteredProjects(enhancedProjects);
			setLoading(false);

			if (projectsData.length === 0) {
				console.log('Projects data array is empty. Check if:');
				console.log('1. The facultyEmail is correct:', facultyEmail);
				console.log('2. The semesterId is correct:', semesterId);
				console.log('3. There are any projects assigned to this faculty for this semester');
			}
		} else if (!isProjectsLoading && !projectsData) {
			console.log('Projects data is empty or undefined');
			setLoading(false);
		}
	}, [projectsData, isProjectsLoading, programmes, semesterId, facultyEmail]);

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

	// Fetch programmes for the selected semester
	useEffect(() => {
		let isMounted = true;

		if (!semesterId) return;

		const fetchProgrammes = async () => {
			try {
				if (process.env.NODE_ENV === 'development') {
					console.log('Fetching programmes for semester:', semesterId);
				}

				const data = await getProjectProgrammes(semesterId);

				if (!isMounted) return;

				if (data) {
					if (process.env.NODE_ENV === 'development') {
						console.log('Programmes data:', data);
					}
					setProgrammes(data);
				}
			} catch (error) {
				console.error('Failed to fetch programmes:', error);
				if (isMounted) {
					toast({
						title: 'Error',
						description: 'Failed to load programmes.',
						variant: 'destructive',
					});
				}
			}
		};

		fetchProgrammes();

		return () => {
			isMounted = false;
		};
	}, [semesterId, toast]);

	// Check if user is a course coordinator
	useEffect(() => {
		let isMounted = true;

		const checkCourseCoordinator = async () => {
			try {
				// This is a placeholder - replace with actual API call
				// For now, we're using static value for testing
				const isCoordinator = false;

				if (process.env.NODE_ENV === 'development') {
					console.log(
						'Course coordinator check for',
						facultyEmail,
						'- Status:',
						isCoordinator
					);
				}

				if (isMounted) {
					setIsCourseCoordinator(isCoordinator);
				}
			} catch (error) {
				console.error('Error checking course coordinator status:', error);
			}
		};

		if (facultyEmail) {
			checkCourseCoordinator();
		}

		return () => {
			isMounted = false;
		};
	}, [facultyEmail]);

	// Apply filters when search term or projects change
	useEffect(() => {
		if (projects.length > 0) {
			console.log('Filtering projects, total count:', projects.length);
			const searchTermLower = searchTerm.toLowerCase();

			// Transform regular projects to enhanced projects
			const enhancedProjects = projects.map((p) => enhanceProject(p, programmes));

			// Apply search filtering
			const filtered = searchTermLower
				? enhancedProjects.filter(
						(p) =>
							p.title.toLowerCase().includes(searchTermLower) ||
							p.description.toLowerCase().includes(searchTermLower)
					)
				: enhancedProjects;

			// Debug which projects are being filtered
			if (searchTermLower) {
				filtered.forEach((project) => {
					console.log('Project passed filter:', project.title);
				});
			}

			console.log('Filtered projects count:', filtered.length);
			setFilteredProjects(filtered);
		}
	}, [projects, searchTerm, programmes]);

	// Memoized render state to prevent unnecessary re-renders
	const renderState = useMemo(
		() => ({
			loading,
			semesterId,
			projectsCount: projects.length,
			filteredCount: filteredProjects.length,
			programmesCount: programmes.length,
			isProjectsLoading,
		}),
		[
			loading,
			semesterId,
			projects.length,
			filteredProjects.length,
			programmes.length,
			isProjectsLoading,
		]
	);

	if (process.env.NODE_ENV === 'development') {
		console.log('Render state:', renderState);
	}

	// Handler for search input change
	const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
	}, []);

	// Force setting the email cookie for testing
	useEffect(() => {
		if (process.env.NODE_ENV === 'development') {
			document.cookie = `email=${encodeURIComponent(facultyEmail)}; path=/;`;
			console.log('Set email cookie to:', facultyEmail);
		}
	}, [facultyEmail]);

	// Add sorting state
	const [sortColumn, setSortColumn] = useState<string | null>(null);
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

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
					aValue =
						a.programmeName ||
						a.programme_name ||
						(a.programme && a.programme.name) ||
						'';
					bValue =
						b.programmeName ||
						b.programme_name ||
						(b.programme && b.programme.name) ||
						'';
					break;
				case 'professor':
					aValue =
						a.professorName ||
						a.professor_name ||
						(a.professor && a.professor.name) ||
						'';
					bValue =
						b.professorName ||
						b.professor_name ||
						(b.professor && b.professor.name) ||
						'';
					break;
				case 'moderator':
					aValue =
						a.moderatorName ||
						a.moderator_name ||
						(a.moderator && a.moderator.name) ||
						'';
					bValue =
						b.moderatorName ||
						b.moderator_name ||
						(b.moderator && b.moderator.name) ||
						'';
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

	// Handle page change
	const handlePageChange = (newPage: number) => {
		setCurrentPage(newPage);
	};

	return (
		<div className="space-y-6 p-4 sm:p-8">
			<div className="flex flex-col space-y-4">
				<div className="flex justify-between items-center"></div>
				<div className="flex flex-wrap gap-4 items-center justify-between">
					<div className="flex flex-1 flex-wrap gap-4 items-center">
						<Input
							id="search"
							placeholder="Search projects..."
							value={searchTerm}
							onChange={handleSearchChange}
							className="max-w-xs w-full"
						/>
						<div className="w-full sm:w-[180px]">
							<Select
								value={semesterId?.toString() || ''}
								onValueChange={handleSemesterChange}
							>
								<SelectTrigger id="semester">
									<SelectValue placeholder="Select semester" />
								</SelectTrigger>
								<SelectContent>
									{isSemestersLoading ? (
										<SelectItem value="loading" disabled>
											Loading...
										</SelectItem>
									) : semestersError ? (
										<SelectItem value="error" disabled>
											Error loading semesters
										</SelectItem>
									) : semesters && semesters.length > 0 ? (
										semesters.map((semester) => (
											<SelectItem
												key={semester.id}
												value={semester.id.toString()}
											>
												{semester.academicYear || semester.academic_year}{' '}
												{semester.name}
											</SelectItem>
										))
									) : (
										<SelectItem value="none" disabled>
											No semesters available
										</SelectItem>
									)}
								</SelectContent>
							</Select>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<span className="text-sm text-muted-foreground whitespace-nowrap">
							Rows per page
						</span>
						<Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
							<SelectTrigger className="h-9 w-16">
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
				</div>
			</div>

			{loading || isProjectsLoading ? (
				<div className="p-8 text-center">Loading projects...</div>
			) : projectsError ? (
				<div className="p-8 text-center text-red-500">
					Error loading projects. Please try again.
				</div>
			) : filteredProjects.length === 0 ? (
				<div className="p-8 text-center">
					No projects found for this semester.{' '}
					{projects.length > 0
						? 'Try modifying your search.'
						: 'You may not have any projects assigned for this semester.'}
				</div>
			) : (
				<div className="border rounded-md">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-[300px]">
									<Button
										variant="ghost"
										onClick={() => toggleSort('title')}
										className="p-0 h-auto hover:bg-transparent"
									>
										Project Title
										<ArrowUpDown className="ml-2 h-4 w-4" />
									</Button>
								</TableHead>
								<TableHead>
									<Button
										variant="ghost"
										onClick={() => toggleSort('programme')}
										className="p-0 h-auto hover:bg-transparent"
									>
										Programme
										<ArrowUpDown className="ml-2 h-4 w-4" />
									</Button>
								</TableHead>
								<TableHead>
									<Button
										variant="ghost"
										onClick={() => toggleSort('professor')}
										className="p-0 h-auto hover:bg-transparent"
									>
										Supervisor
										<ArrowUpDown className="ml-2 h-4 w-4" />
									</Button>
								</TableHead>
								<TableHead>
									<Button
										variant="ghost"
										onClick={() => toggleSort('moderator')}
										className="p-0 h-auto hover:bg-transparent"
									>
										Moderator
										<ArrowUpDown className="ml-2 h-4 w-4" />
									</Button>
								</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{currentProjects.map((project) => (
								<TableRow key={project.id}>
									<TableCell className="font-medium">{project.title}</TableCell>
									<TableCell>
										{project.programmeName ||
											project.programme_name ||
											(project.programme && project.programme.name) ||
											'Not assigned'}
									</TableCell>
									<TableCell>
										{project.professorName ||
											project.professor_name ||
											(project.professor && project.professor.name) ||
											'Not assigned'}
									</TableCell>
									<TableCell>
										{project.moderatorName ||
											project.moderator_name ||
											(project.moderator && project.moderator.name) ||
											'Not assigned'}
									</TableCell>
									<TableCell className="text-right">
										<Button
											variant="outline"
											size="sm"
											onClick={() => {
												// Open project details in a dialog
												setSelectedProjectId(project.id);
												setIsDetailsModalOpen(true);
											}}
										>
											View Details
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>

					{/* Pagination controls */}
					{totalPages > 1 && (
						<div className="flex items-center justify-between mt-4 px-2">
							<div className="text-sm text-muted-foreground">
								Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of{' '}
								{totalItems} projects
							</div>
							<div className="flex items-center space-x-2">
								<Button
									variant="outline"
									size="icon"
									onClick={() => handlePageChange(currentPage - 1)}
									disabled={currentPage === 1}
								>
									<ChevronLeft className="h-4 w-4" />
								</Button>
								<Button
									variant="outline"
									size="icon"
									onClick={() => handlePageChange(currentPage + 1)}
									disabled={currentPage === totalPages}
								>
									<ChevronRight className="h-4 w-4" />
								</Button>
							</div>
						</div>
					)}
				</div>
			)}

			{/* Project Details Modal */}
			<ProjectDetailsModal
				projectId={selectedProjectId}
				isOpen={isDetailsModalOpen}
				onClose={() => setIsDetailsModalOpen(false)}
			/>
		</div>
	);
}

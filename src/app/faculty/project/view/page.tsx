'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { getProjectProgrammes } from '@/utils/actions/admin/project';
import { Programme, Project } from '@/utils/actions/admin/types';
import { useGetSemesters } from '@/utils/hooks/admin/use-get-semesters';
import { useGetFacultyProjects } from '@/utils/hooks/faculty/use-faculty-get-projects';
import { useToast } from '@/utils/hooks/use-toast';

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

import { EnhancedProject, ProjectStatus } from '@/app/admin/project/all/components/columns';

import ProjectList from './components/project-list';

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
	const [semesterId, setSemesterId] = useState<number | null>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [isCourseCoordinator, setIsCourseCoordinator] = useState(false);

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
		refetch: refetchProjects,
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

	// Handler for project update
	const handleProjectUpdate = useCallback(
		(_updatedProject: Project) => {
			refetchProjects();
		},
		[refetchProjects]
	);

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

	return (
		<div className="space-y-4 p-4 sm:p-8">
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Projects</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{projects.length}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Course Coordinator Status
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{isCourseCoordinator ? 'Yes' : 'No'}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Available Programmes</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{programmes.length}</div>
					</CardContent>
				</Card>
			</div>

			<div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center">
				<div className="flex-1">
					<Label htmlFor="search" className="sr-only">
						Search
					</Label>
					<Input
						id="search"
						placeholder="Search projects..."
						value={searchTerm}
						onChange={handleSearchChange}
						className="max-w-sm"
					/>
				</div>
				<div className="w-full sm:w-[180px]">
					<Label htmlFor="semester" className="mb-2 block">
						Semester
					</Label>
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
									<SelectItem key={semester.id} value={semester.id.toString()}>
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
				<Button onClick={() => refetchProjects()}>Refresh</Button>
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
				<ProjectList
					projects={filteredProjects}
					semesterId={semesterId || 0}
					programmes={programmes}
					onProjectUpdate={handleProjectUpdate}
					isCourseCoordinator={isCourseCoordinator}
				/>
			)}
		</div>
	);
}

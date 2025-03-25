'use client';

import { useMemo, useState } from 'react';

import { getFacultyUsers } from '@/utils/actions/admin/project';
import { fetchSemesters } from '@/utils/actions/admin/semester';
import { Programme, Project, User } from '@/utils/actions/admin/types';
import { useGetFacultyUsers } from '@/utils/hooks/admin/use-get-facullty-users';
import { useGetProjectProgrammes } from '@/utils/hooks/admin/use-get-project-programmes';
import { useGetProjectsBySemester } from '@/utils/hooks/admin/use-get-projects-by-semester';
import { useGetSemesters } from '@/utils/hooks/admin/use-get-semesters';
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

import { EnhancedProject, ProjectStatus } from './columns';
import ProjectList from './project-list';

// Helper function to transform Project to EnhancedProject
const enhanceProject = (
	project: Project,
	programmes: Programme[],
	faculty: User[] = []
): EnhancedProject => {
	// Find the programme for this project
	const programme = programmes.find((p) => p.id === project.programme_id) || {
		id: project.programme_id || 0, // Provide default value of 0 if undefined
		name: 'Unknown',
	};

	// Find the professor in the faculty list (unused, prefixed with _)
	const _professor = faculty.find((f) => f.id === project.professor_id);

	// Create an enhanced project with required fields
	return {
		...project,
		professor: {
			id: project.professor_id || 0, // Provide default value of 0 if undefined
			// Use actual professor name if found, otherwise use "Unknown Faculty"
			name: project.professor_name || 'Unknown Faculty',
		},
		programme: {
			id: programme.id || 0, // Provide default value of 0 if undefined
			name: programme.name,
		},
		status: ProjectStatus.APPROVED, // Default status, modify as needed
	};
};

export default function ProjectsPage() {
	// Removed the redundant semesters state
	console.log('ProjectsPage rendering');
	const [semesterId, setSemesterId] = useState<number | null>(null); // Default to null
	const [searchTerm, setSearchTerm] = useState('');
	const [_activeTab, _setActiveTab] = useState<'list'>('list');
	const { toast } = useToast();

	// Get data from React Query hooks
	const {
		data: projectsData = [],
		isLoading: projectsLoading,
		refetch: refetchProjects,
	} = useGetProjectsBySemester(semesterId || 0);

	const {
		data: programmesData = [],
		isLoading: programmesLoading,
		refetch: refetchProgrammes,
	} = useGetProjectProgrammes(semesterId || 0);

	// Get semesters data using the hook
	const {
		data: semesters = [], // Default to empty array when data is undefined
		isLoading: semestersLoading,
	} = useGetSemesters({
		onSuccess: (data) => {
			// Set default semester to the first active one or the first one
			console.log('Semesters received in component:', data);
			console.log('Setting active semester...');
			const activeSemester = data.find((sem) => sem.isActive || sem.active);
			if (activeSemester) {
				setSemesterId(activeSemester.id);
			} else if (data.length > 0) {
				setSemesterId(data[0].id);
			}
		},
		onError: (error) => {
			console.error('Error fetching semesters data:', error);
			toast({
				title: 'Error',
				description: 'Failed to load semesters data',
				variant: 'destructive',
			});
		},
	});

	// Fetch faculty data
	const { data: facultyData, isLoading: facultyLoading } = useGetFacultyUsers();

	// Transform and filter projects with useMemo
	const enhancedProjects = useMemo(() => {
		// Add type assertions to ensure correct types
		const typedProjects = projectsData as Project[];
		const typedProgrammes = programmesData as Programme[];
		// Use the fetched faculty data
		const typedFaculty = (facultyData || []) as User[];

		return typedProjects.map((project) =>
			enhanceProject(project, typedProgrammes, typedFaculty)
		);
	}, [projectsData, programmesData, facultyData]);

	const filteredProjects = useMemo(() => {
		if (!searchTerm.trim()) return enhancedProjects;

		const lowerSearchTerm = searchTerm.toLowerCase();
		return enhancedProjects.filter(
			(project) =>
				project.title.toLowerCase().includes(lowerSearchTerm) ||
				project.description.toLowerCase().includes(lowerSearchTerm)
		);
	}, [enhancedProjects, searchTerm]);

	// Loading state combines all loading states
	const loading = projectsLoading || programmesLoading || semestersLoading || facultyLoading;

	// Handle semester selection change
	const handleSemesterChange = (value: string) => {
		console.log('Semester selection changed to:', value);
		const selectedId = parseInt(value, 10);
		if (!isNaN(selectedId) && selectedId > 0) {
			console.log('Setting semester ID to:', selectedId);
			setSemesterId(selectedId);
		} else {
			console.error('Invalid semester ID:', value);
			toast({
				title: 'Error',
				description: 'Invalid semester selected',
				variant: 'destructive',
			});
		}
	};

	// Function to update a project with a new moderator
	const updateProjectWithModerator = (_updatedProject: Project) => {
		// Refetch projects after update
		refetchProjects();
		// Show success toast
		toast({
			title: 'Success',
			description: 'Moderator assigned successfully',
			variant: 'default',
		});
	};

	// Function to manually refresh data
	const refreshData = () => {
		if (semesterId === null) {
			console.error('Cannot refresh: semesterId is null');
			toast({
				title: 'Error',
				description: 'Please select a semester first',
				variant: 'destructive',
			});
			return;
		}

		console.log('Manually refreshing data for semester:', semesterId);
		toast({
			title: 'Refreshing...',
			description: 'Getting latest data',
			variant: 'default',
		});

		Promise.all([refetchProjects(), refetchProgrammes()])
			.then(() => {
				console.log('Data refresh complete');
				toast({
					title: 'Success',
					description: 'Data refreshed successfully',
					variant: 'default',
				});
			})
			.catch((error) => {
				console.error('Error refreshing data:', error);
				toast({
					title: 'Error',
					description: 'Failed to refresh data',
					variant: 'destructive',
				});
			});
	};

	return (
		<div className="container mx-auto py-6">
			<Button
				onClick={() => {
					console.log('Debug button clicked'); // This should show up immediately when clicked
					alert('Debug button clicked'); // This will show a popup to confirm the click is working
					console.log('Current semesters:', semesters);
				}}
			>
				Debug
			</Button>

			<Button
				onClick={async () => {
					try {
						console.log('Directly calling fetchSemesters...');
						const response = await fetchSemesters();
						console.log('Direct fetchSemesters response:', response);
					} catch (error) {
						console.error('Error directly calling fetchSemesters:', error);
					}
				}}
			>
				Test Fetch Semesters
			</Button>

			<Button
				onClick={async () => {
					try {
						console.log('Directly calling getFacultyUsers...');
						const faculty = await getFacultyUsers();
						console.log('Direct getFacultyUsers response:', faculty);
						console.log(`Retrieved ${faculty.length} faculty members`);
					} catch (error) {
						console.error('Error directly calling getFacultyUsers:', error);
					}
				}}
			>
				Test Fetch Faculty
			</Button>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-2xl font-bold">Projects</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="mb-6 flex items-center gap-4">
						<div className="flex items-center space-x-2">
							<Label htmlFor="semester-id">Semester:</Label>
							<Select
								value={semesterId?.toString() || ''}
								onValueChange={handleSemesterChange}
							>
								<SelectTrigger id="semester-id" className="w-[250px]">
									<SelectValue placeholder="Select a semester" />
								</SelectTrigger>
								<SelectContent>
									{semesters.map((semester) => (
										<SelectItem
											key={semester.id}
											value={semester.id.toString()}
										>
											{semester.academicYear || semester.academic_year}{' '}
											{semester.name}{' '}
											{semester.isActive || semester.active ? '(Active)' : ''}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Button
								variant="secondary"
								disabled={loading || semesterId === null}
								onClick={refreshData}
							>
								{loading ? 'Loading...' : 'Refresh'}
							</Button>
						</div>
						<div className="flex-1">
							<Input
								placeholder="Search projects by title or description..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
					</div>

					{loading ? (
						<div className="flex justify-center items-center h-40">
							<p>Loading projects...</p>
						</div>
					) : semesterId === null ? (
						<div className="flex justify-center items-center h-40">
							<p>Please select a semester</p>
						</div>
					) : (
						<ProjectList
							projects={filteredProjects}
							programmes={programmesData}
							onProjectUpdate={updateProjectWithModerator}
						/>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

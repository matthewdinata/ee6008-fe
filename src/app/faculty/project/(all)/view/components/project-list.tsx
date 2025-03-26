'use client';

import { FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { removeProjectModerator } from '@/utils/actions/admin/project';
import { Programme, Project, User } from '@/utils/actions/admin/types';
import { useGetFacultyUsers } from '@/utils/hooks/admin/use-get-facullty-users';
import { useToast } from '@/utils/hooks/use-toast';

// Import the modal component
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import AssignModeratorDialog from '@/app/admin/project/all/components/assign-moderator-dialog';
import { EnhancedProject, ProjectStatus } from '@/app/admin/project/all/components/columns';

import { ProjectDetailsModal } from './project-detail-modals';

interface ProjectListProps {
	projects: EnhancedProject[];
	semesterId: number;
	programmes: Programme[];
	onProjectUpdate: (updatedProject: Project) => void;
	setProjects?: React.Dispatch<React.SetStateAction<EnhancedProject[]>>;
	isCourseCoordinator?: boolean;
}

function ProjectList(props: ProjectListProps) {
	const {
		projects: initialProjects,
		semesterId,
		programmes,
		onProjectUpdate,
		setProjects,
		isCourseCoordinator = false,
	} = props;

	const _semesterId = semesterId;
	const _programmes = programmes;
	const _setProjects = setProjects;

	const _router = useRouter();

	// State variables - use lazy state initializers to prevent unnecessary calculations on re-render
	const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
	const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
	const [loading, setLoading] = useState<number | null>(null);
	const [selectedProject, setSelectedProject] = useState<EnhancedProject | null>(null);
	const [projects, setProjectsState] = useState<EnhancedProject[]>(() => initialProjects);
	const [viewDescriptionProject, setViewDescriptionProject] = useState<EnhancedProject | null>(
		null
	);
	const [_isPeerReviewModalOpen, setIsPeerReviewModalOpen] = useState(false);
	const [_selectedPeerReviewProjectId, setSelectedPeerReviewProjectId] = useState<number | null>(
		null
	);

	const { toast } = useToast();

	// Use React Query hook for faculty users with stable dependency array
	const { data: faculty = [], isLoading: _isFacultyLoading } = useGetFacultyUsers({
		onError: useCallback(
			(error: unknown) => {
				console.error('Error fetching faculty data:', error);
				toast({
					title: 'Error',
					description: 'Failed to load faculty data. Please try again.',
					variant: 'destructive',
				});
			},
			[toast]
		),
	});

	// Memoize mapping functions to prevent unnecessary recalculations
	const _facultyById = useMemo(() => {
		const mapping: Record<number, User> = {};
		if (faculty && Array.isArray(faculty) && faculty.length > 0) {
			faculty.forEach((user) => {
				if (user && user.userId) mapping[user.userId] = user;
				if (user && user.professor_id) mapping[user.professor_id] = user;
				if (user && user.id) mapping[user.id] = user;
			});
		}
		return mapping;
	}, [faculty]);

	// Memoize enhanced projects to prevent unnecessary processing
	// This is the most important optimization point
	const enhancedProjects = useMemo(() => {
		// Debug the first project to see what data is available
		if (projects.length > 0 && process.env.NODE_ENV === 'development') {
			console.log('Project data sample:', projects[0]);
		}

		return projects.map((project) => ({
			...project,
			// These mapped fields ensure compatibility with existing component structure
			professor: {
				id: project.professorId || project.professor_id || 0,
				name: project.professorName || project.professor_name || 'Not assigned',
			},
			programme: {
				id: project.programmeId || project.programme_id || 0,
				name:
					project.programmeName ||
					project.programme_name ||
					(project.programme && project.programme.name) ||
					`Programme ${project.programmeId || project.programme_id}`,
			},
			moderator:
				project.moderatorId || project.moderator_id
					? {
							id: project.moderatorId || project.moderator_id || 0,
							name:
								project.moderatorName ||
								project.moderator_name ||
								(project.moderator && project.moderator.name) ||
								'Unknown moderator',
						}
					: null,
			status: ProjectStatus.APPROVED, // Default status for faculty projects
		}));
	}, [projects]);

	// Use useCallback for event handlers to prevent unnecessary function recreations
	const handleRemoveModerator = useCallback(
		async (projectId: number) => {
			if (loading) return; // Prevent multiple simultaneous API calls

			setLoading(projectId);
			try {
				await removeProjectModerator(projectId);
				toast({
					title: 'Success',
					description: 'Moderator removed successfully',
				});
				onProjectUpdate({} as Project);
			} catch (error) {
				toast({
					title: 'Error',
					description: 'Failed to remove moderator',
					variant: 'destructive',
				});
			} finally {
				setLoading(null);
			}
		},
		[toast, onProjectUpdate, loading]
	);

	// Function to handle view details button click
	const handleViewDetails = useCallback((projectId: number) => {
		setSelectedProjectId(projectId);
		setIsDetailsModalOpen(true);
	}, []);

	// Function to handle view peer reviews button click
	const _handleViewPeerReviews = useCallback((projectId: number) => {
		setSelectedPeerReviewProjectId(projectId);
		setIsPeerReviewModalOpen(true);
	}, []);

	// Update local projects state when props change - with proper deps array
	useEffect(() => {
		// Only update if initialProjects has actually changed by comparing length and first item
		if (initialProjects !== projects) {
			setProjectsState(initialProjects);
		}
	}, [initialProjects, projects]);

	// Function to refresh projects data - wrapped in useCallback
	const refreshProjects = useCallback(() => {
		// This will trigger the parent component to fetch updated projects
		onProjectUpdate({} as Project);
	}, [onProjectUpdate]);

	// Format long text with line breaks after every few words
	const formatWithLineBreaks = useCallback(
		(text: string, wordsPerLine: number = 8): React.ReactNode => {
			if (!text) return '';

			const words = text.split(' ');
			const lines: string[] = [];

			for (let i = 0; i < words.length; i += wordsPerLine) {
				lines.push(words.slice(i, i + wordsPerLine).join(' '));
			}

			return (
				<>
					{lines.map((line, index) => (
						<React.Fragment key={index}>
							{line}
							{index < lines.length - 1 && <br />}
						</React.Fragment>
					))}
				</>
			);
		},
		[]
	);

	// Use stable references for dialog state changes
	const handleCloseDetailsModal = useCallback(() => setIsDetailsModalOpen(false), []);
	const _handleClosePeerReviewModal = useCallback(() => setIsPeerReviewModalOpen(false), []);
	const _handleCloseDescriptionDialog = useCallback(() => setViewDescriptionProject(null), []);

	const handleDialogOpenChange = useCallback((open: boolean) => {
		if (!open) setViewDescriptionProject(null);
	}, []);

	const handleModeratorDialogOpenChange = useCallback((open: boolean) => {
		if (!open) setSelectedProject(null);
	}, []);

	const handleViewDescription = useCallback((project: EnhancedProject) => {
		setViewDescriptionProject(project);
	}, []);

	const handleAssignModeratorClick = useCallback((project: EnhancedProject) => {
		setSelectedProject(project);
	}, []);

	const handleRemoveModeratorClick = useCallback(
		(project: EnhancedProject) => {
			handleRemoveModerator(project.id);
		},
		[handleRemoveModerator]
	);

	return (
		<div>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Title</TableHead>
						<TableHead>Description</TableHead>
						<TableHead>Programme</TableHead>
						<TableHead>Supervisor</TableHead>
						<TableHead>Moderator</TableHead>
						<TableHead>Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{enhancedProjects.length === 0 ? (
						<TableRow>
							<TableCell colSpan={6} className="text-center py-6">
								No projects found
							</TableCell>
						</TableRow>
					) : (
						enhancedProjects.map((project) => (
							<TableRow key={project.id}>
								<TableCell className="font-medium w-1/5">
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<div className="line-clamp-3">
													{formatWithLineBreaks(project.title, 6)}
												</div>
											</TooltipTrigger>
											<TooltipContent side="bottom" className="max-w-md">
												<p>{project.title}</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								</TableCell>
								<TableCell className="w-2/5">
									<div className="flex flex-col space-y-2">
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<div className="line-clamp-3">
														{formatWithLineBreaks(
															project.description,
															8
														)}
													</div>
												</TooltipTrigger>
												<TooltipContent side="bottom" className="max-w-md">
													<p>{project.description}</p>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleViewDescription(project)}
										>
											View Full Description
										</Button>
									</div>
								</TableCell>
								<TableCell>
									{project.programmeName ||
										project.programme_name ||
										(project.programme && project.programme.name) ||
										`Programme ${project.programmeId || project.programme_id}`}
								</TableCell>
								<TableCell>
									<div className="font-medium">
										{project.professorName ||
											project.professor_name ||
											(project.professor && project.professor.name) ||
											'Not assigned'}
									</div>
								</TableCell>
								<TableCell>
									<div className="font-medium">
										{project.moderatorName ||
											project.moderator_name ||
											(project.moderator && project.moderator.name) ||
											'Not assigned'}
									</div>
								</TableCell>
								<TableCell>
									<div className="flex flex-col sm:flex-row gap-2">
										{/* View Details button */}
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleViewDetails(project.id)}
											className="flex items-center"
										>
											<FileText className="w-4 h-4 mr-1" />
											View Details
										</Button>

										{/* Course coordinator actions */}
										{isCourseCoordinator && (
											<>
												<Button
													variant="outline"
													size="sm"
													onClick={() =>
														handleAssignModeratorClick(project)
													}
												>
													Assign Moderator
												</Button>
												{(project.moderatorId || project.moderator_id) && (
													<Button
														variant="destructive"
														size="sm"
														onClick={() =>
															handleRemoveModeratorClick(project)
														}
													>
														Remove Moderator
													</Button>
												)}
											</>
										)}
									</div>
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>

			{/* Project Details Modal */}
			<ProjectDetailsModal
				projectId={selectedProjectId}
				isOpen={isDetailsModalOpen}
				onClose={handleCloseDetailsModal}
			/>

			{/* Dialog for viewing full project description */}
			<Dialog open={!!viewDescriptionProject} onOpenChange={handleDialogOpenChange}>
				<DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>{viewDescriptionProject?.title}</DialogTitle>
					</DialogHeader>
					<div className="mt-4 whitespace-pre-wrap">
						{viewDescriptionProject?.description}
					</div>
				</DialogContent>
			</Dialog>

			{isCourseCoordinator && selectedProject && (
				<AssignModeratorDialog
					open={!!selectedProject}
					onOpenChange={handleModeratorDialogOpenChange}
					project={selectedProject}
					onAssigned={refreshProjects}
				/>
			)}
		</div>
	);
}

// Wrap component with memo to prevent unnecessary renders
export default React.memo(ProjectList);

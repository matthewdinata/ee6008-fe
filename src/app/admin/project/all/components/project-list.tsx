'use client';

import { ArrowUpDown, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import { removeProjectModerator } from '@/utils/actions/admin/project';
import { Programme, Project } from '@/utils/actions/admin/types';
import { useToast } from '@/utils/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { ProjectDetailsModal } from '@/app/faculty/project/view/components/project-detail-modals';

import AssignModeratorDialog from './assign-moderator-dialog';
import { EnhancedProject } from './columns';

interface ProjectListProps {
	projects: EnhancedProject[];
	programmes: Programme[];
	onProjectUpdate: (updatedProject: Project) => void;
	_setProjects?: React.Dispatch<React.SetStateAction<EnhancedProject[]>>;
	isCourseCoordinator?: boolean;
}

export default function ProjectList({
	projects: initialProjects,
	programmes: _programmes,
	onProjectUpdate,
	_setProjects,
	isCourseCoordinator: _isCourseCoordinator = false,
}: ProjectListProps) {
	// State variables
	const [loading, setLoading] = useState<number | null>(null);
	const [selectedProject, setSelectedProject] = useState<EnhancedProject | null>(null);
	const [viewDescriptionProject, setViewDescriptionProject] = useState<EnhancedProject | null>(
		null
	);
	const [searchQuery, _setSearchQuery] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState('10');
	const [sortColumn, setSortColumn] = useState<string | null>(null);
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);
	// For detailed project modal
	const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
	const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
	const { toast } = useToast();

	// Format long text with line breaks after every few words
	const formatWithLineBreaks = (
		text: string,
		wordsPerLine: number = 8,
		maxWords: number = 0
	): React.ReactNode => {
		if (!text) return '';

		const words = text.split(' ');
		// Apply max words limit if specified
		const limitedWords = maxWords > 0 ? words.slice(0, maxWords) : words;
		const lines: string[] = [];

		for (let i = 0; i < limitedWords.length; i += wordsPerLine) {
			lines.push(limitedWords.slice(i, i + wordsPerLine).join(' '));
		}

		// Add ellipsis if text was truncated
		const wasLimited = maxWords > 0 && words.length > maxWords;

		return (
			<>
				{lines.map((line, index) => (
					<React.Fragment key={index}>
						{line}
						{index < lines.length - 1 && <br />}
					</React.Fragment>
				))}
				{wasLimited && '...'}
			</>
		);
	};

	// Filter projects based on search query
	const filteredProjects = useMemo(() => {
		return initialProjects.filter((project) => {
			if (!searchQuery.trim()) return true;

			const searchLower = searchQuery.toLowerCase().trim();
			return (
				project.title.toLowerCase().includes(searchLower) ||
				(project.description?.toLowerCase().includes(searchLower) ?? false) ||
				(project.programme_name?.toLowerCase().includes(searchLower) ?? false) ||
				(project.professor_name?.toLowerCase().includes(searchLower) ?? false) ||
				(project.moderator_name?.toLowerCase().includes(searchLower) ?? false)
			);
		});
	}, [initialProjects, searchQuery]);

	// Sort filtered projects
	const sortedProjects = useMemo(() => {
		if (!sortColumn || !sortDirection) return filteredProjects;

		return [...filteredProjects].sort((a, b) => {
			let aValue = a[sortColumn as keyof EnhancedProject];
			let bValue = b[sortColumn as keyof EnhancedProject];

			// Handle special cases for name fields
			if (sortColumn === 'professor_id' && a.professor_name && b.professor_name) {
				aValue = a.professor_name;
				bValue = b.professor_name;
			} else if (sortColumn === 'moderator_id' && a.moderator_name && b.moderator_name) {
				aValue = a.moderator_name;
				bValue = b.moderator_name;
			} else if (sortColumn === 'venue_id' && a.venue_name && b.venue_name) {
				aValue = a.venue_name;
				bValue = b.venue_name;
			} else if (sortColumn === 'programme_id' && a.programme_name && b.programme_name) {
				aValue = a.programme_name;
				bValue = b.programme_name;
			}

			// Null handling
			if (aValue === null || aValue === undefined) return sortDirection === 'asc' ? -1 : 1;
			if (bValue === null || bValue === undefined) return sortDirection === 'asc' ? 1 : -1;

			// String comparison
			if (typeof aValue === 'string' && typeof bValue === 'string') {
				return sortDirection === 'asc'
					? aValue.localeCompare(bValue)
					: bValue.localeCompare(aValue);
			}

			// Number comparison
			if (typeof aValue === 'number' && typeof bValue === 'number') {
				return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
			}

			return 0;
		});
	}, [filteredProjects, sortColumn, sortDirection]);

	// Calculate pagination
	const totalItems = sortedProjects.length;
	const totalPages = Math.ceil(totalItems / parseInt(pageSize));
	const startIndex = (currentPage - 1) * parseInt(pageSize);
	const endIndex = startIndex + parseInt(pageSize);
	const currentProjects = sortedProjects.slice(startIndex, endIndex);

	const handlePageChange = (newPage: number) => {
		if (newPage >= 1 && newPage <= totalPages) {
			setCurrentPage(newPage);
		}
	};

	const handleRemoveModerator = async (project: EnhancedProject) => {
		setLoading(project.id);
		try {
			// Call the server action to remove the moderator
			const result = await removeProjectModerator(project.id);
			console.log('Moderator removal result:', result);

			// Create an updated project object with moderator fields set to null
			const updatedProject = {
				...project,
				moderatorId: null,
				moderatorName: null,
				moderator_id: null,
				moderator_name: null,
			};

			// Call the parent component's update function to refresh the data
			onProjectUpdate(updatedProject as unknown as Project);

			// Also trigger a local refresh for immediate visual feedback
			refreshProjects();

			// Success message is now handled by the parent component to avoid duplicates
		} catch (error) {
			console.error('Error removing moderator:', error);
			toast({
				title: 'Error',
				description: 'Failed to remove moderator',
				variant: 'destructive',
			});
		} finally {
			setLoading(null);
		}
	};

	// Function to refresh projects data
	const refreshProjects = () => {
		// This will trigger the parent component to fetch updated projects
		onProjectUpdate({} as Project);
	};

	// Handle viewing project details in modal
	const handleViewDetails = (projectId: number) => {
		setSelectedProjectId(projectId);
		setIsDetailsModalOpen(true);
	};

	return (
		<div className="space-y-4">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 my-4">
				<div className="flex-1"></div>
				<div className="flex items-center">
					<span className="text-sm text-muted-foreground whitespace-nowrap">
						Show
						<Select
							value={pageSize}
							onValueChange={(val) => {
								setPageSize(val);
								setCurrentPage(1); // Reset to first page when page size changes
							}}
						>
							<SelectTrigger className="w-16 h-8 mx-2 inline-flex">
								<SelectValue placeholder="10" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="10">10</SelectItem>
								<SelectItem value="20">20</SelectItem>
								<SelectItem value="50">50</SelectItem>
								<SelectItem value="100">100</SelectItem>
							</SelectContent>
						</Select>
						per page
					</span>
				</div>
			</div>

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>
								<div
									className="flex items-center cursor-pointer"
									onClick={() => {
										if (sortColumn === 'title') {
											setSortDirection(
												sortDirection === 'asc' ? 'desc' : 'asc'
											);
										} else {
											setSortColumn('title');
											setSortDirection('asc');
										}
									}}
								>
									Title
									<ArrowUpDown className="ml-2 h-4 w-4" />
								</div>
							</TableHead>
							<TableHead>Description</TableHead>
							<TableHead>
								<div
									className="flex items-center cursor-pointer"
									onClick={() => {
										if (sortColumn === 'programme_id') {
											setSortDirection(
												sortDirection === 'asc' ? 'desc' : 'asc'
											);
										} else {
											setSortColumn('programme_id');
											setSortDirection('asc');
										}
									}}
								>
									Programme
									<ArrowUpDown className="ml-2 h-4 w-4" />
								</div>
							</TableHead>
							<TableHead>
								<div
									className="flex items-center cursor-pointer"
									onClick={() => {
										if (sortColumn === 'venue_id') {
											setSortDirection(
												sortDirection === 'asc' ? 'desc' : 'asc'
											);
										} else {
											setSortColumn('venue_id');
											setSortDirection('asc');
										}
									}}
								>
									Venue
									<ArrowUpDown className="ml-2 h-4 w-4" />
								</div>
							</TableHead>
							<TableHead>
								<div
									className="flex items-center cursor-pointer"
									onClick={() => {
										if (sortColumn === 'professor_id') {
											setSortDirection(
												sortDirection === 'asc' ? 'desc' : 'asc'
											);
										} else {
											setSortColumn('professor_id');
											setSortDirection('asc');
										}
									}}
								>
									Supervisor
									<ArrowUpDown className="ml-2 h-4 w-4" />
								</div>
							</TableHead>
							<TableHead>
								<div
									className="flex items-center cursor-pointer"
									onClick={() => {
										if (sortColumn === 'moderator_id') {
											setSortDirection(
												sortDirection === 'asc' ? 'desc' : 'asc'
											);
										} else {
											setSortColumn('moderator_id');
											setSortDirection('asc');
										}
									}}
								>
									Moderator
									<ArrowUpDown className="ml-2 h-4 w-4" />
								</div>
							</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{currentProjects.length === 0 ? (
							<TableRow>
								<TableCell colSpan={7} className="text-center py-6">
									No projects found
								</TableCell>
							</TableRow>
						) : (
							currentProjects.map((project) => (
								<TableRow key={project.id}>
									<TableCell className="font-medium w-1/5">
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<div className="line-clamp-3">
														{formatWithLineBreaks(project.title, 6, 15)}
													</div>
												</TooltipTrigger>
												<TooltipContent side="bottom" className="max-w-md">
													<p>{project.title}</p>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</TableCell>
									<TableCell className="w-[250px]">
										<div className="flex flex-col space-y-2">
											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger asChild>
														<div className="line-clamp-3">
															{formatWithLineBreaks(
																project.description,
																8,
																30
															)}
														</div>
													</TooltipTrigger>
													<TooltipContent
														side="bottom"
														className="max-w-md"
													>
														<p>{project.description}</p>
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
											<Button
												variant="outline"
												size="sm"
												onClick={() => setViewDescriptionProject(project)}
											>
												View Full Description
											</Button>
										</div>
									</TableCell>
									<TableCell>
										<div className="line-clamp-2">
											{project.programme_name || 'Not assigned'}
										</div>
									</TableCell>
									<TableCell>
										<div className="line-clamp-2">
											{project.venue_name || 'Not assigned'}
										</div>
									</TableCell>
									<TableCell>
										<div className="font-medium">
											{project.professor_name || 'Not assigned'}
										</div>
									</TableCell>
									<TableCell>
										<div className="font-medium">
											{project.moderator_name || 'Not assigned'}
										</div>
									</TableCell>
									<TableCell>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8 p-0"
												>
													<span className="sr-only">Open menu</span>
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuLabel>Actions</DropdownMenuLabel>
												<DropdownMenuSeparator />
												<DropdownMenuItem
													onClick={() => handleViewDetails(project.id)}
												>
													View Details
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() =>
														setViewDescriptionProject(project)
													}
												>
													View Description
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() => setSelectedProject(project)}
												>
													Assign Moderator
												</DropdownMenuItem>
												{project.moderator_id && (
													<DropdownMenuItem
														onClick={() =>
															handleRemoveModerator(project)
														}
														disabled={loading === project.id}
														className="text-destructive focus:text-destructive"
													>
														{loading === project.id
															? 'Removing...'
															: 'Remove Moderator'}
													</DropdownMenuItem>
												)}
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{totalPages > 1 && (
				<div className="flex items-center justify-between mt-4">
					<div className="text-sm text-muted-foreground">
						Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems}{' '}
						projects
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

			{/* Dialog for viewing full project description */}
			<Dialog
				open={!!viewDescriptionProject}
				onOpenChange={(open) => !open && setViewDescriptionProject(null)}
			>
				<DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>{viewDescriptionProject?.title}</DialogTitle>
					</DialogHeader>
					<div className="mt-4 whitespace-pre-wrap">
						{viewDescriptionProject?.description}
					</div>
				</DialogContent>
			</Dialog>

			{selectedProject && (
				<AssignModeratorDialog
					open={!!selectedProject}
					onOpenChange={(open) => {
						if (!open) setSelectedProject(null);
					}}
					project={selectedProject}
					onAssigned={() => {
						// Refresh projects after assignment
						refreshProjects();
					}}
				/>
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

'use client';

import { Loader2 } from 'lucide-react';
import React, { useState } from 'react';

import { removeProjectModerator } from '@/utils/actions/admin/project';
import { Programme, Project } from '@/utils/actions/admin/types';
import { useToast } from '@/utils/hooks/use-toast';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import AssignModeratorDialog from './assign-moderator-dialog';
import { EnhancedProject } from './columns';

interface ProjectListProps {
	projects: EnhancedProject[];
	programmes: Programme[];
	onProjectUpdate: (updatedProject: Project) => void;
	isLoading?: boolean;
	onRefresh?: () => void;
	isCourseCoordinator?: boolean;
}

export default function ProjectList({
	projects,
	onRefresh,
	isCourseCoordinator = false,
}: ProjectListProps) {
	// State variables
	const [viewDescriptionProject, setViewDescriptionProject] = useState<EnhancedProject | null>(
		null
	);
	const [assignModeratorProject, setAssignModeratorProject] = useState<EnhancedProject | null>(
		null
	);
	const [isRemovingModerator, setIsRemovingModerator] = useState<number | null>(null);
	const [confirmRemoveProject, setConfirmRemoveProject] = useState<EnhancedProject | null>(null);
	const { toast } = useToast();

	// Import the removeProjectModerator function

	// Format long text with line breaks after every few words
	const formatWithLineBreaks = (text: string, wordsPerLine: number = 8): React.ReactNode => {
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
	};

	// Get status badge based on project status
	const getStatusBadge = (status: string): JSX.Element => {
		// Add null check before calling toLowerCase
		if (!status) {
			return <Badge variant="outline">Unknown</Badge>;
		}

		const statusLower = status.toLowerCase();
		switch (statusLower) {
			case 'open':
				return (
					<Badge
						variant="outline"
						className="bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 border-green-300 dark:border-green-800"
					>
						Open
					</Badge>
				);
			case 'pending':
				return (
					<Badge
						variant="outline"
						className="bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800"
					>
						Pending
					</Badge>
				);
			case 'assigned':
				return (
					<Badge
						variant="outline"
						className="bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-800"
					>
						Assigned
					</Badge>
				);
			case 'completed':
				return (
					<Badge
						variant="outline"
						className="bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border-purple-300 dark:border-purple-800"
					>
						Completed
					</Badge>
				);
			case 'archived':
				return (
					<Badge
						variant="outline"
						className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-700"
					>
						Archived
					</Badge>
				);
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	// Handler for removing a moderator
	const handleRemoveModerator = async (project: EnhancedProject) => {
		if (!project.moderator || !project.moderator.name) return;

		// Open confirmation dialog
		setConfirmRemoveProject(project);
	};

	// Confirm and execute moderator removal
	const confirmAndRemoveModerator = async () => {
		if (!confirmRemoveProject) return;

		setIsRemovingModerator(confirmRemoveProject.id);

		try {
			await removeProjectModerator(confirmRemoveProject.id);
			toast({
				title: 'Success',
				description: 'Moderator removed successfully',
			});
			if (onRefresh) onRefresh();
		} catch (error) {
			console.error('Error removing moderator:', error);
			toast({
				title: 'Error',
				description: 'Failed to remove moderator',
				variant: 'destructive',
			});
		} finally {
			setIsRemovingModerator(null);
			setConfirmRemoveProject(null);
		}
	};

	return (
		<>
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[50px]">ID</TableHead>
							<TableHead className="min-w-[200px]">Title</TableHead>
							<TableHead className="min-w-[150px]">Programme</TableHead>
							<TableHead className="min-w-[150px]">Professor</TableHead>
							<TableHead className="min-w-[150px]">Moderator</TableHead>
							<TableHead className="min-w-[100px]">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{projects.map((project) => (
							<TableRow key={project.id}>
								<TableCell className="font-medium">{project.id}</TableCell>
								<TableCell>
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<div className="max-w-[300px] truncate cursor-help">
													{project.title}
												</div>
											</TooltipTrigger>
											<TooltipContent
												side="top"
												align="start"
												className="max-w-[350px]"
											>
												<div className="font-semibold">{project.title}</div>
												<div className="text-sm mt-1 text-muted-foreground">
													{formatWithLineBreaks(
														project.description || '',
														10
													)}
												</div>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								</TableCell>
								<TableCell>{project.programme?.name || 'N/A'}</TableCell>
								<TableCell>{project.professor?.name || 'N/A'}</TableCell>
								<TableCell>{project.moderator?.name || 'N/A'}</TableCell>
								<TableCell>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setViewDescriptionProject(project)}
									>
										View
									</Button>
									{isCourseCoordinator && (
										<>
											{project.moderator && project.moderator_id ? (
												<Button
													variant="ghost"
													size="sm"
													className="text-destructive hover:text-destructive hover:bg-destructive/10"
													onClick={() => handleRemoveModerator(project)}
													disabled={isRemovingModerator === project.id}
												>
													{isRemovingModerator === project.id
														? 'Removing...'
														: 'Remove Moderator'}
												</Button>
											) : (
												<Button
													variant="ghost"
													size="sm"
													onClick={() =>
														setAssignModeratorProject(project)
													}
												>
													Assign Moderator
												</Button>
											)}
										</>
									)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{/* View Description Dialog */}
			<Dialog
				open={viewDescriptionProject !== null}
				onOpenChange={(open) => {
					if (!open) setViewDescriptionProject(null);
				}}
			>
				<DialogContent className="sm:max-w-[600px]">
					<DialogHeader>
						<DialogTitle className="text-xl">
							{viewDescriptionProject?.title}
						</DialogTitle>
					</DialogHeader>
					<div className="mt-4 space-y-4">
						<div>
							<h3 className="text-sm font-medium text-muted-foreground">Programme</h3>
							<p>{viewDescriptionProject?.programme.name}</p>
						</div>
						<div>
							<h3 className="text-sm font-medium text-muted-foreground">Professor</h3>
							<p>{viewDescriptionProject?.professor.name}</p>
						</div>
						<div>
							<h3 className="text-sm font-medium text-muted-foreground">Moderator</h3>
							<p>{viewDescriptionProject?.moderator.name}</p>
						</div>
						<div>
							<h3 className="text-sm font-medium text-muted-foreground">
								Description
							</h3>
							<p className="whitespace-pre-line">
								{viewDescriptionProject?.description}
							</p>
						</div>
						<div>
							<h3 className="text-sm font-medium text-muted-foreground">Status</h3>
							<div className="mt-1">
								{viewDescriptionProject &&
									getStatusBadge(viewDescriptionProject.status)}
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Assign Moderator Dialog */}
			{assignModeratorProject && (
				<AssignModeratorDialog
					open={!!assignModeratorProject}
					onOpenChange={(open) => !open && setAssignModeratorProject(null)}
					project={assignModeratorProject}
					onAssigned={() => onRefresh && onRefresh()}
				/>
			)}

			{/* Remove Moderator Confirmation Dialog */}
			<Dialog
				open={!!confirmRemoveProject}
				onOpenChange={(open) => !open && setConfirmRemoveProject(null)}
			>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Remove Moderator</DialogTitle>
						<DialogDescription>
							Are you sure you want to remove the moderator from this project?
						</DialogDescription>
					</DialogHeader>

					<div className="py-4">
						{confirmRemoveProject && (
							<div className="space-y-2">
								<p>
									<span className="font-medium">Project:</span>{' '}
									{confirmRemoveProject.title}
								</p>
								<p>
									<span className="font-medium">Current Moderator:</span>{' '}
									{confirmRemoveProject.moderator?.name}
								</p>
							</div>
						)}
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setConfirmRemoveProject(null)}
							disabled={isRemovingModerator !== null}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={confirmAndRemoveModerator}
							disabled={isRemovingModerator !== null}
						>
							{isRemovingModerator !== null ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Removing...
								</>
							) : (
								'Remove Moderator'
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}

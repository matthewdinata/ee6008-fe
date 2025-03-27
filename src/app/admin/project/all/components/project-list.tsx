'use client';

import React, { useState } from 'react';

import { removeProjectModerator } from '@/utils/actions/admin/project';
import { Programme, Project } from '@/utils/actions/admin/types';
import { useToast } from '@/utils/hooks/use-toast';

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
	const { toast } = useToast();

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

	const handleRemoveModerator = async (project: EnhancedProject) => {
		setLoading(project.id);
		try {
			await removeProjectModerator(project.id);
			toast({
				title: 'Success',
				description: 'Moderator removed successfully',
			});
		} catch (error) {
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
					{initialProjects.length === 0 ? (
						<TableRow>
							<TableCell colSpan={6} className="text-center py-6">
								No projects found
							</TableCell>
						</TableRow>
					) : (
						initialProjects.map((project) => (
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
									{
										<div className="flex gap-2">
											<Button
												variant="outline"
												size="sm"
												onClick={() => setSelectedProject(project)}
											>
												Assign Moderator
											</Button>
											{project.moderator_id && (
												<Button
													variant="destructive"
													size="sm"
													onClick={() => handleRemoveModerator(project)}
													disabled={loading === project.id}
												>
													{loading === project.id
														? 'Removing...'
														: 'Remove Moderator'}
												</Button>
											)}
										</div>
									}
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>

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
		</div>
	);
}

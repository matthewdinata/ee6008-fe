'use client';

import {
	DndContext,
	DragEndEvent,
	DragOverlay,
	DragStartEvent,
	KeyboardSensor,
	PointerSensor,
	closestCenter,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import {
	SortableContext,
	arrayMove,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useRegisterProjects } from '@/utils/hooks/student/use-register-projects';

import { Button } from '@/components/ui/button';

import ProjectCard from './project-card';
import { Project } from './types';

export const NO_OF_ACTIVE_PROJECTS = 5;
export const INACTIVE_OPACITY = 0.4;

type SortableItemProps = {
	project: Project;
	index: number;
	isDisabled?: boolean;
};

const SortableItem = ({ project, index, isDisabled }: SortableItemProps) => {
	const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
		id: project.id,
		disabled: isDisabled,
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div ref={setNodeRef} style={style}>
			<ProjectCard
				project={project}
				index={index}
				dragHandleProps={isDisabled ? {} : { ...attributes, ...listeners }}
				isDraggable={!isDisabled}
			/>
		</div>
	);
};

type ProjectSortablePriorityProps = {
	initialProjects: Project[];
	isDisabled?: boolean;
};

const ProjectSortablePriority = ({
	initialProjects,
	isDisabled = false,
}: ProjectSortablePriorityProps) => {
	const [projects, setProjects] = useState<Project[]>([]);
	const [activeId, setActiveId] = useState<string | null>(null);
	const { mutate: registerProjects, isPending } = useRegisterProjects();

	useEffect(() => {
		if (initialProjects && initialProjects.length > 0) {
			setProjects(initialProjects);
		}
	}, [initialProjects]);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const handleDragStart = (event: DragStartEvent) => {
		if (isDisabled) return;

		const { active } = event;
		setActiveId(active.id.toString());
	};

	const handleDragEnd = (event: DragEndEvent) => {
		if (isDisabled) return;

		const { active, over } = event;

		if (active.id !== over?.id && over) {
			setProjects((items) => {
				const oldIndex = items.findIndex((item) => item.id === active.id);
				const newIndex = items.findIndex((item) => item.id === over.id);
				return arrayMove(items, oldIndex, newIndex);
			});
		}
		setActiveId(null);
	};

	const handleSubmit = async () => {
		if (isDisabled) {
			toast.error('Registration is currently disabled', {
				description: 'Project registration is not available at this time.',
			});
			return;
		}

		const prioritizedProjects = projects.slice(0, NO_OF_ACTIVE_PROJECTS);

		try {
			await registerProjects(prioritizedProjects.map((project) => parseInt(project.id)));
			toast.success('Projects registered', {
				description: `You have successfully registered your top ${prioritizedProjects.length} project preferences.`,
			});
		} catch (error) {
			toast.error('Registration failed', {
				description:
					'An error occurred while registering your project preferences. Please try again.',
			});
		}
	};

	const activeProject = activeId ? projects.find((p) => p.id === activeId) : null;
	const activeIndex = activeId ? projects.findIndex((p) => p.id === activeId) : -1;

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
		>
			<SortableContext
				items={projects.map((p) => p.id)}
				strategy={verticalListSortingStrategy}
			>
				{projects.map((project, index) => (
					<div key={project.id} className="flex items-center w-full !mt-1">
						<div
							className="w-8 pl-2 text-sm sm:text-base"
							style={{
								opacity: index < NO_OF_ACTIVE_PROJECTS ? 1 : INACTIVE_OPACITY,
							}}
						>
							{index + 1}
						</div>
						<div className="flex-1">
							<SortableItem project={project} index={index} isDisabled={isDisabled} />
						</div>
					</div>
				))}
			</SortableContext>

			<DragOverlay>
				{activeProject && activeIndex >= 0 && !isDisabled ? (
					<ProjectCard
						project={activeProject}
						index={activeIndex}
						isDragOverlay={true}
						isDraggable={!isDisabled}
					/>
				) : null}
			</DragOverlay>

			<div className="flex justify-end mt-4">
				<Button
					type="button"
					onClick={handleSubmit}
					disabled={projects.length === 0 || isPending || isDisabled}
				>
					{isDisabled ? 'Registration Closed' : 'Register'}
				</Button>
			</div>
		</DndContext>
	);
};

export default ProjectSortablePriority;

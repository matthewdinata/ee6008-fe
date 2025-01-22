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
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';

import ProjectCard from './project-card';
import { Project } from './types';

export const NO_OF_ACTIVE_PROJECTS = 5;
export const INACTIVE_OPACITY = 0.4;

type SortableItemProps = {
	project: Project;
	index: number;
};

const SortableItem = ({ project, index }: SortableItemProps) => {
	const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
		id: project.id,
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
				dragHandleProps={{ ...attributes, ...listeners }}
			/>
		</div>
	);
};

type ProjectSortablePriorityProps = {
	initialProjects: Project[];
};

const ProjectSortablePriority = ({ initialProjects }: ProjectSortablePriorityProps) => {
	const [projects, setProjects] = useState(initialProjects);
	const [activeId, setActiveId] = useState<string | null>(null);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const handleDragStart = (event: DragStartEvent) => {
		const { active } = event;
		setActiveId(active.id.toString());
	};

	const handleDragEnd = (event: DragEndEvent) => {
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
					<div key={project.id} className="flex items-center w-full">
						<div
							className="w-8 pl-2 text-sm sm:text-base"
							style={{
								opacity: index < NO_OF_ACTIVE_PROJECTS ? 1 : INACTIVE_OPACITY,
							}}
						>
							{index + 1}
						</div>
						<div className="flex-1">
							<SortableItem project={project} index={index} />
						</div>
					</div>
				))}
			</SortableContext>

			<DragOverlay>
				{activeProject && activeIndex >= 0 ? (
					<ProjectCard project={activeProject} index={activeIndex} isDragOverlay={true} />
				) : null}
			</DragOverlay>

			<div className="flex justify-end mt-4">
				<Button type="submit">Register</Button>
			</div>
		</DndContext>
	);
};

export default ProjectSortablePriority;

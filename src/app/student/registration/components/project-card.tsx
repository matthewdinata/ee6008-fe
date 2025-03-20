import { GripVertical, MonitorCog, UserSearch } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

import { INACTIVE_OPACITY, NO_OF_ACTIVE_PROJECTS } from './project-sortable-priority';
import { Project } from './types';

type DragHandleProps = {
	[key: string]: unknown;
};

type ProjectCardProps = {
	project: Project;
	index: number;
	dragHandleProps?: DragHandleProps;
	isDragOverlay?: boolean;
};

const ProjectCard = ({
	project,
	index,
	dragHandleProps = {},
	isDragOverlay = false,
}: ProjectCardProps) => {
	const isActive = index < NO_OF_ACTIVE_PROJECTS;

	return (
		// TODO: fix cursor grab issue
		<Card
			className={`mb-2 cursor-grab ${isDragOverlay ? 'border-ring border shadow-lg' : ''}`}
			style={{
				opacity: isActive || isDragOverlay ? 1 : INACTIVE_OPACITY,
			}}
			{...dragHandleProps}
		>
			<CardContent className="flex items-center justify-between p-3 text-sm space-x-2">
				<div className="space-y-1">
					<div className="font-bold">{project.title}</div>
					<div className="text-muted-foreground text-sm flex gap-1 items-center">
						<UserSearch size="16" />
						<span>{project.faculty}</span>
						<span className="mx-2">|</span>
						<MonitorCog size="16" />
						<span>{project.programme}</span>
					</div>
				</div>
				<GripVertical className="text-muted-foreground" size={16} />
			</CardContent>
		</Card>
	);
};

export default ProjectCard;

import { GripVertical } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

import { INACTIVE_OPACITY, NO_OF_ACTIVE_PROJECTS, Project } from './project-sortable-priority';

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
				<div>
					<div className="font-bold">{project.title}</div>
					<div className="text-muted-foreground text-sm">
						{project.faculty} &nbsp;|&nbsp; {project.programme}
					</div>
				</div>
				<GripVertical className="text-muted-foreground" size={16} />
			</CardContent>
		</Card>
	);
};

export default ProjectCard;

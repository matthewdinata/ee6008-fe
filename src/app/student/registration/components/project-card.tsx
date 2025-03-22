import { GripVertical, MonitorCog, UserSearch } from 'lucide-react';

import { useGetRegistrationIds } from '@/utils/hooks/student/use-get-registration-ids';

import { Badge } from '@/components/ui/badge';
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
	isDraggable?: boolean;
};

const ProjectCard = ({
	project,
	index,
	dragHandleProps = {},
	isDragOverlay = false,
	isDraggable = true,
}: ProjectCardProps) => {
	const isActive = index < NO_OF_ACTIVE_PROJECTS;
	const { data: registeredProjects } = useGetRegistrationIds();

	const projectPriority = registeredProjects?.[parseInt(project.id)];
	const isRegistered = projectPriority !== undefined;

	return (
		<Card
			className={`mb-2 ${isDraggable ? 'cursor-grab' : 'cursor-default'} ${isDragOverlay ? 'border-ring border shadow-lg' : ''}`}
			style={{
				opacity: isActive || isDragOverlay ? 1 : INACTIVE_OPACITY,
			}}
			{...dragHandleProps}
		>
			<CardContent className="flex items-center justify-between p-3 text-sm space-x-2">
				<div className="space-y-1">
					<div className="font-bold flex items-center gap-2">{project.title}</div>
					<div className="text-muted-foreground text-sm flex gap-1 items-center">
						<UserSearch size="16" />
						<span>{project.faculty}</span>
						<span className="mx-2">|</span>
						<MonitorCog size="16" />
						<span>{project.programme}</span>
					</div>
				</div>
				<div className="flex items-center gap-3">
					{isRegistered && (
						<Badge variant="secondary" className="border-muted-foreground bg-accent">
							Registered (#{projectPriority})
						</Badge>
					)}
					{isDraggable && <GripVertical className="text-muted-foreground" size={16} />}
				</div>
			</CardContent>
		</Card>
	);
};

export default ProjectCard;

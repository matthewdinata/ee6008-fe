'use client';

import { Terminal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

import { useGetPlannedProjects } from '@/utils/hooks/student/use-get-planned-projects';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import ProjectSortablePriority from './components/project-sortable-priority';

const ProjectRegistration = () => {
	const { data: plannedProjects, isLoading, error } = useGetPlannedProjects();

	const router = useRouter();
	// Transform planned projects to match the format expected by ProjectSortablePriority
	const transformedProjects = React.useMemo(() => {
		if (!plannedProjects) return [];

		return plannedProjects.map((project) => ({
			id: project.projectId.toString(),
			title: project.title,
			faculty: project.professorName || 'Unknown',
			programme: project.programmeName || 'Unknown',
			description: project.description,
		}));
	}, [plannedProjects]);

	const handleRedirectToPlanner = () => {
		router.push('/student/planner');
	};

	return (
		<div>
			<p className="text-muted-foreground mb-4 text-sm">
				Select up to 5 projects in order of preference.
				<br />
				Click and drag any project card to reorder priorities.
			</p>

			{isLoading ? (
				<Skeleton className="w-full h-32" />
			) : error ? (
				<div>
					<Alert variant="destructive">
						<Terminal className="h-4 w-4" />
						<AlertTitle>Error</AlertTitle>
						<AlertDescription>
							Failed to load projects. Please try again later.
						</AlertDescription>
						<div className="mt-4">
							<Button
								variant="outline"
								className="h-8"
								onClick={() => window.location.reload()}
							>
								Retry
							</Button>
						</div>
					</Alert>
				</div>
			) : !plannedProjects || plannedProjects.length === 0 ? (
				<div>
					<Alert>
						<Terminal className="h-4 w-4" />
						<AlertTitle>No Projects Found</AlertTitle>
						<AlertDescription>
							You haven&apos;t added any projects to your planner yet.
						</AlertDescription>
						<div className="mt-4">
							<Button
								variant="outline"
								className="h-8"
								onClick={handleRedirectToPlanner}
							>
								Go to Project Planner
							</Button>
						</div>
					</Alert>
				</div>
			) : (
				<ProjectSortablePriority initialProjects={transformedProjects} />
			)}
		</div>
	);
};

export default ProjectRegistration;

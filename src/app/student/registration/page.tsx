'use client';

import { Terminal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

import { useGetPlannedProjects } from '@/utils/hooks/student/use-get-planned-projects';
import { useGetRegistrationIds } from '@/utils/hooks/student/use-get-registration-ids';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import ProjectSortablePriority from './components/project-sortable-priority';

const ProjectRegistration = () => {
	const {
		data: plannedProjects,
		isPending: isGettingPlannedProjects,
		error,
	} = useGetPlannedProjects();
	const { data: registeredProjects, isPending: isGettingRegistrations } = useGetRegistrationIds();

	const router = useRouter();
	// Transform planned projects to match the format expected by ProjectSortablePriority
	const transformedProjects = React.useMemo(() => {
		if (!plannedProjects) return [];

		const projectsWithPriority = plannedProjects.map((project) => ({
			...project,
			priority: registeredProjects?.[project.projectId] ?? Infinity, // Use Infinity for unregistered projects
		}));

		const sortedProjects = projectsWithPriority.sort((a, b) => a.priority - b.priority);

		return sortedProjects.map((project) => ({
			id: project.projectId.toString(),
			title: project.title,
			faculty: project.professorName || 'Unknown',
			programme: project.programmeName || 'Unknown',
			description: project.description,
		}));
	}, [plannedProjects, registeredProjects]);

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

			{isGettingPlannedProjects || isGettingRegistrations ? (
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

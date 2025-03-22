'use client';

import { AlertCircle, Terminal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { useGetActiveSemesterTimeline } from '@/utils/hooks/student/use-get-active-semester-timeline';
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
	const { data: semesterTimeline, isPending: isLoadingSemesterTimeline } =
		useGetActiveSemesterTimeline();

	const [isWithinRegistrationPeriod, setIsWithinRegistrationPeriod] = useState(false);
	const [timeMessage, setTimeMessage] = useState('');

	const router = useRouter();

	// Check if current time is within the student registration period
	useEffect(() => {
		if (semesterTimeline) {
			const now = new Date();
			const startDate = new Date(semesterTimeline.studentRegistrationStart);
			const endDate = new Date(semesterTimeline.studentRegistrationEnd);

			if (now < startDate) {
				setIsWithinRegistrationPeriod(false);
				const formattedStartDate = new Intl.DateTimeFormat('en-US', {
					dateStyle: 'full',
					timeStyle: 'long',
				}).format(startDate);
				setTimeMessage(`Registration will open on ${formattedStartDate}`);
			} else if (now > endDate) {
				setIsWithinRegistrationPeriod(false);
				setTimeMessage('The registration period has ended.');
			} else {
				setIsWithinRegistrationPeriod(true);
				const formattedEndDate = new Intl.DateTimeFormat('en-US', {
					dateStyle: 'full',
					timeStyle: 'long',
				}).format(endDate);
				setTimeMessage(`Registration closes on ${formattedEndDate}`);
			}
		}
	}, [semesterTimeline]);

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

	if (isGettingPlannedProjects || isGettingRegistrations || isLoadingSemesterTimeline) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-24 w-full" />
				<Skeleton className="h-48 w-full" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Time restriction alert */}
			<Alert
				className={`${isWithinRegistrationPeriod ? 'bg-blue-200/20' : 'bg-amber-200/20'}`}
			>
				<AlertCircle
					className={`h-4 w-4 ${isWithinRegistrationPeriod ? 'text-blue-600' : 'text-amber-600'}`}
				/>
				<AlertTitle>
					{isWithinRegistrationPeriod
						? 'Registration Period Active'
						: 'Registration Period Inactive'}
				</AlertTitle>
				<AlertDescription>{timeMessage}</AlertDescription>
			</Alert>

			<p className="text-muted-foreground text-sm !mb-6">
				Select up to 5 projects in order of preference.
				<br />
				Click and drag any project card to reorder priorities.
			</p>

			{error ? (
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
				<ProjectSortablePriority
					initialProjects={transformedProjects}
					isDisabled={!isWithinRegistrationPeriod}
				/>
			)}
		</div>
	);
};

export default ProjectRegistration;

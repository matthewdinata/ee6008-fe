'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { useAddProjectsToPlanner } from '@/utils/hooks/student/use-add-projects-to-planner';
import { useGetActiveProjects } from '@/utils/hooks/student/use-get-active-projects';

import { DataTable } from '@/components/ui/data-table';
import { Skeleton } from '@/components/ui/skeleton';

import { columns } from './columns';

interface ProjectError extends Error {
	failedProjects?: Array<{
		project: { id: number; title: string };
		error: Error;
		statusCode?: number;
	}>;
}

export function ProjectListDataTable() {
	const router = useRouter();
	const { data, isPending } = useGetActiveProjects();
	const { mutate: addProjectsToPlanner, isPending: isAddingToPlanner } =
		useAddProjectsToPlanner();

	if (isPending) {
		return <Skeleton className="w-full h-64" />;
	}

	const handleAddToPlanner = (
		selectedItems: Array<{ id: number; title: string; description: string }>
	) => {
		addProjectsToPlanner(
			selectedItems.map((item) => ({ id: item.id, title: item.title })),
			{
				onSuccess: (successfulProjects) => {
					toast.success(
						successfulProjects.length > 1
							? `${successfulProjects.length} projects added to your plan`
							: `"${successfulProjects[0].project.title}" added to your plan`
					);

					router.refresh();
				},
				onError: (error) => {
					const projectError = error as ProjectError;

					if (projectError.failedProjects && projectError.failedProjects.length > 0) {
						// If the error has specific project information
						if (projectError.failedProjects.length === 1) {
							const projectTitle = projectError.failedProjects[0].project.title;
							const statusCode = projectError.failedProjects[0].statusCode;

							// Check if it's a 409 Conflict error
							if (
								statusCode === 409 ||
								projectError.failedProjects[0].error.message.includes('409')
							) {
								toast.error(`"${projectTitle}" is already in your plan`);
							} else {
								toast.error(`Failed to add "${projectTitle}"`);
							}
						} else {
							// Multiple projects failed
							const conflictProjects = projectError.failedProjects.filter(
								(p) => p.statusCode === 409 || p.error.message.includes('409')
							);

							const otherFailedProjects = projectError.failedProjects.filter(
								(p) => p.statusCode !== 409 && !p.error.message.includes('409')
							);

							if (conflictProjects.length > 0) {
								const titles = conflictProjects
									.map((p) => `"${p.project.title}"`)
									.join(', ');
								toast.error(
									`${titles} ${conflictProjects.length === 1 ? 'is' : 'are'} already in your plan`
								);
							}

							if (otherFailedProjects.length > 0) {
								const titles = otherFailedProjects
									.map((p) => `"${p.project.title}"`)
									.join(', ');
								toast.error(`Failed to add: ${titles}`);
							}
						}
					} else {
						// Fallback error message
						toast.error('Error: ' + error.message);
					}
				},
			}
		);
	};

	return (
		<DataTable
			columns={columns}
			data={data ?? []}
			filterBy="title"
			pageSize={6}
			showRowSelection={true}
			selectionButtonText={isAddingToPlanner ? 'Adding...' : 'Add to plan'}
			onSelectionButtonClick={handleAddToPlanner}
		/>
	);
}

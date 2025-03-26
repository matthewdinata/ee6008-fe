import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { Skeleton } from '@/components/ui/skeleton';

import { GradedComponentsView } from '@/app/faculty/grade/evaluation/components/graded-components-view';

interface PageProps {
	params: {
		projectId: string;
	};
	searchParams: {
		role?: string;
	};
}

export const metadata: Metadata = {
	title: 'Graded Components',
	description: 'View and edit graded components for this project',
};

export default function GradedComponentsPage({ params, searchParams }: PageProps) {
	const projectId = parseInt(params.projectId);

	if (isNaN(projectId)) {
		return notFound();
	}

	// Default to supervisor role if not specified
	const role = searchParams.role === 'moderator' ? 'moderator' : 'supervisor';

	return (
		<div className="container py-8">
			<Suspense fallback={<GradedComponentsSkeleton />}>
				<GradedComponentsView projectId={projectId} role={role} />
			</Suspense>
		</div>
	);
}

function GradedComponentsSkeleton() {
	return (
		<div className="space-y-8">
			<div className="space-y-2">
				<Skeleton className="h-10 w-32" />
				<Skeleton className="h-10 w-[80%]" />
				<Skeleton className="h-6 w-[40%]" />
			</div>

			<Skeleton className="h-24 w-full" />

			<div className="space-y-4">
				<Skeleton className="h-10 w-[60%]" />
				<div className="grid gap-6">
					<Skeleton className="h-64 w-full" />
					<Skeleton className="h-64 w-full" />
				</div>
			</div>
		</div>
	);
}

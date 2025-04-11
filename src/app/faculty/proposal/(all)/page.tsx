'use client';

import { AlertTriangle, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

import { useCheckCourseCoordinator } from '@/utils/hooks/faculty/use-check-course-coordinator';
import { useCheckProgrammeDirector } from '@/utils/hooks/faculty/use-check-programme-director';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import AllProposalTable from './components/all-proposal-table';

function AllProposals() {
	const { data, isPending } = useCheckCourseCoordinator();
	const { data: programmeDirectorData, isPending: isCheckingProgrammeDirector } =
		useCheckProgrammeDirector();
	const router = useRouter();

	if (isPending || isCheckingProgrammeDirector) {
		return (
			<div className="space-y-3">
				<Skeleton className="h-10 w-1/3" />
				<Skeleton className="h-48 w-full" />
			</div>
		);
	}

	if (!data?.isCourseCoordinator && !programmeDirectorData?.isProgrammeDirector) {
		return (
			<div className="space-y-6">
				<Alert variant="destructive" className="border-destructive bg-destructive/10">
					<AlertTriangle className="h-5 w-5" />
					<AlertTitle className="text-lg font-semibold">Access Restricted</AlertTitle>
					<AlertDescription className="mt-2">
						<p className="mb-4">
							This page is reserved for Course Coordinators and Programme Directors
							only. You do not have the necessary permissions to view this content.
						</p>
						<div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
							<Button
								variant="outline"
								className="hover:bg-destructive/15 hover:text-destructive"
								onClick={() => router.push('/faculty')}
							>
								Return to Dashboard
							</Button>
						</div>
					</AlertDescription>
				</Alert>

				<Card>
					<CardHeader className="flex items-center gap-3">
						<Shield className="h-8 w-8 text-muted-foreground" />
						<CardTitle className="text-xl font-medium">
							What is a Coordinator?
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="mt-3 text-card-foreground">
							Coordinators are faculty members responsible for overseeing projects
							within their course or programme. Course Coordinators have the ability
							to review, approve, and manage all proposals across the entire course,
							while Programme Directors can only access and manage proposals specific
							to their assigned programme.
						</p>
						<p className="mt-2 text-card-foreground">
							If you believe you should have Course Coordinator or Programme Director
							status, please contact your department administrator or the IT support
							team for assistance.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="mb-8 space-y-4">
			<Alert className="bg-chart-2/10">
				<Shield className="h-4 w-4" />
				<AlertTitle className="font-semibold text-chart-3">
					{data?.isCourseCoordinator
						? 'Course Coordinator View'
						: 'Programme Director View'}
				</AlertTitle>
				<AlertDescription className="mt-1 text-chart-3">
					{data?.isCourseCoordinator ? (
						<>
							You have access to view and manage all proposals across the entire
							course. Use the table below to review and take action on proposals.
						</>
					) : (
						<>
							You have access to view and manage proposals specific to your assigned
							programme. Use the table below to review and take action on proposals.
						</>
					)}
				</AlertDescription>
			</Alert>
			<AllProposalTable />
		</div>
	);
}

export default AllProposals;

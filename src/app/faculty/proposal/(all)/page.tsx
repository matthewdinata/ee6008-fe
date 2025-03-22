'use client';

import { AlertTriangle, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

import { useCheckCourseCoordinator } from '@/utils/hooks/faculty/use-check-course-coordinator';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import AllProposalTable from './components/all-proposal-table';

function AllProposals() {
	const { data, isPending } = useCheckCourseCoordinator();
	const router = useRouter();

	if (isPending) {
		return (
			<div className="space-y-3">
				<Skeleton className="h-10 w-1/3" />
				<Skeleton className="h-48 w-full" />
			</div>
		);
	}

	if (!data?.isCourseCoordinator) {
		return (
			<div className="space-y-6">
				<Alert variant="destructive" className="border-destructive bg-destructive/10">
					<AlertTriangle className="h-5 w-5" />
					<AlertTitle className="text-lg font-semibold">Access Restricted</AlertTitle>
					<AlertDescription className="mt-2">
						<p className="mb-4">
							This page is reserved for course coordinators only. You do not have the
							necessary permissions to view this content.
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
							What is a Course Coordinator?
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="mt-3 text-card-foreground">
							Course Coordinators are faculty members responsible for overseeing all
							projects within their course. They have additional privileges to review,
							approve, and manage proposals from all faculty members in their
							department.
						</p>
						<p className="mt-2 text-card-foreground">
							If you believe you should have Course Coordinator status, please contact
							your department administrator or the IT support team.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="mb-8">
			<div className="mb-4 rounded-md bg-chart-2/10 p-4">
				<div className="flex items-center">
					<Shield className="mr-3 h-5 w-5 text-chart-3" />
					<h2 className="font-semibold text-chart-3">Course Coordinator View</h2>
				</div>
				<p className="mt-1 text-chart-3">
					You have access to view and manage all proposals in your course.
				</p>
			</div>
			<AllProposalTable />
		</div>
	);
}

export default AllProposals;

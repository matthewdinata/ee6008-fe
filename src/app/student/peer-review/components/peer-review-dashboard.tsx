'use client';

import { AlertCircle, CheckCircle2, Edit, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { TeamMember } from '@/utils/actions/student/types';
import { usePeerReviews } from '@/utils/hooks/student/use-peer-reviews';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function PeerReviewDashboard() {
	const router = useRouter();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const { data, isLoading, isError, error, refetch } = usePeerReviews();

	useEffect(() => {
		if (isError && error) {
			setErrorMessage(typeof error === 'string' ? error : 'Failed to load peer reviews');
		} else {
			setErrorMessage(null);
		}
	}, [isError, error]);

	const handleReviewClick = (teamMemberId: number, reviewId?: number) => {
		if (reviewId) {
			// Edit existing review
			router.push(`/student/peer-review/edit/${reviewId}`);
		} else {
			// Create new review
			router.push(`/student/peer-review/new?revieweeId=${teamMemberId}`);
		}
	};

	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[400px]">
				<Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
				<p className="text-muted-foreground">Loading peer review data...</p>
			</div>
		);
	}

	if (errorMessage) {
		return (
			<Alert variant="destructive" className="mb-6">
				<AlertCircle className="h-4 w-4" />
				<AlertTitle>Error</AlertTitle>
				<AlertDescription>{errorMessage}</AlertDescription>
				<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
					Try Again
				</Button>
			</Alert>
		);
	}

	if (!data || !data.teamMembers || data.teamMembers.length === 0) {
		return (
			<Alert className="mb-6">
				<AlertCircle className="h-4 w-4" />
				<AlertTitle>No Team Members</AlertTitle>
				<AlertDescription>
					You don&apos;t have any team members to review at this time. This could be
					because:
					<ul className="list-disc pl-5 mt-2">
						<li>You haven&apos;t been allocated to a project yet</li>
						<li>Your project doesn&apos;t have any other team members</li>
						<li>The peer review period hasn&apos;t started yet</li>
					</ul>
				</AlertDescription>
			</Alert>
		);
	}

	const { projectTitle, teamMembers, completionProgress } = data;

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold tracking-tight">Peer Review Dashboard</h1>
				<p className="text-muted-foreground">
					Review and provide feedback for your team members on project: {projectTitle}
				</p>
			</div>

			{/* Progress Section */}
			<Card>
				<CardHeader className="pb-2">
					<CardTitle>Your Progress</CardTitle>
					<CardDescription>
						You&apos;ve completed {completionProgress.completedReviews} out of{' '}
						{completionProgress.totalReviews} reviews
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						<Progress value={completionProgress.percentComplete} className="h-2" />
						<p className="text-sm text-right text-muted-foreground">
							{completionProgress.percentComplete}% Complete
						</p>
					</div>
				</CardContent>
			</Card>

			{/* Team Members Section */}
			<div className="space-y-4">
				<h2 className="text-xl font-semibold">Team Members</h2>
				<div className="grid gap-4 md:grid-cols-2">
					{teamMembers.map((member: TeamMember) => (
						<Card key={member.id} className="overflow-hidden">
							<CardHeader className="pb-2">
								<div className="flex justify-between items-start">
									<div>
										<CardTitle>{member.name}</CardTitle>
										<CardDescription>
											{member.matriculationNumber}
										</CardDescription>
									</div>
									<Badge
										variant={
											member.reviewed ? 'outlineSuccess' : 'outlinePending'
										}
									>
										{member.reviewed ? 'Reviewed' : 'Pending'}
									</Badge>
								</div>
							</CardHeader>
							<CardContent className="pb-2">
								<p className="text-sm text-muted-foreground truncate">
									{member.email}
								</p>
								{member.reviewed && (
									<div className="mt-2">
										<p className="text-sm font-medium">
											Your rating: {member.score}/10
										</p>
									</div>
								)}
							</CardContent>
							<CardFooter className="pt-2">
								<Button
									onClick={() => handleReviewClick(member.id, member.reviewId)}
									variant={member.reviewed ? 'outline' : 'default'}
									className="w-full"
								>
									{member.reviewed ? (
										<>
											<Edit className="mr-2 h-4 w-4" />
											Edit Review
										</>
									) : (
										<>
											<CheckCircle2 className="mr-2 h-4 w-4" />
											Submit Review
										</>
									)}
								</Button>
							</CardFooter>
						</Card>
					))}
				</div>
			</div>
		</div>
	);
}

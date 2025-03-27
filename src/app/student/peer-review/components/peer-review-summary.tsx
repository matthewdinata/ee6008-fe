'use client';

import { ArrowLeft, Loader2, Star, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { usePeerReviewSummary } from '@/utils/hooks/student/use-peer-reviews';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

export default function PeerReviewSummary() {
	const router = useRouter();
	const { data: summary, isLoading, isError, error, refetch } = usePeerReviewSummary();

	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[400px]">
				<Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
				<p className="text-muted-foreground">Loading summary data...</p>
			</div>
		);
	}

	if (isError || !summary) {
		return (
			<div className="space-y-6">
				<div className="flex items-center">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => router.push('/student/peer-review')}
						className="mr-2"
					>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Dashboard
					</Button>
				</div>

				<Alert variant="destructive">
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>
						{error instanceof Error
							? error.message
							: 'Failed to load peer review summary. Please try again.'}
						<Button
							variant="outline"
							size="sm"
							onClick={() => refetch()}
							className="mt-2"
						>
							Try Again
						</Button>
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	const { student, project, reviewerStatus } = summary;

	// Calculate score distribution for visualization
	const scoreDistribution = Array(10).fill(0);
	student.scoresReceived.forEach((score) => {
		if (score >= 1 && score <= 10) {
			scoreDistribution[score - 1]++;
		}
	});

	// Find the maximum count for scaling the chart
	const maxCount = Math.max(...scoreDistribution);

	return (
		<div className="space-y-6">
			<div className="flex items-center">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => router.push('/student/peer-review')}
					className="mr-2"
				>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Back to Dashboard
				</Button>
				<h1 className="text-2xl font-bold tracking-tight">Peer Review Summary</h1>
			</div>

			<div className="grid gap-6 md:grid-cols-3">
				{/* Your Score Card */}
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Your Average Score</CardTitle>
						<CardDescription>
							Based on {student.reviewsReceived} reviews
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex items-center justify-center">
							<div className="flex items-center">
								<Star className="h-6 w-6 mr-2 text-yellow-500" />
								<span className="text-3xl font-bold">
									{student.averageScore.toFixed(1)}
								</span>
								<span className="text-sm text-muted-foreground ml-1">/ 10</span>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Team Completion Card */}
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Team Completion</CardTitle>
						<CardDescription>Overall team progress</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<Progress value={project.teamCompletionPercent} className="h-2" />
							<div className="flex justify-between text-xs text-muted-foreground">
								<span>{project.teamCompletionPercent}% Complete</span>
								<span>{project.totalReviews} Total Reviews</span>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Your Progress Card */}
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Your Progress</CardTitle>
						<CardDescription>Reviews given vs. required</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex items-center justify-center">
							<div className="flex items-center">
								<Users className="h-6 w-6 mr-2 text-primary" />
								<span className="text-3xl font-bold">{student.reviewsGiven}</span>
								<span className="text-sm text-muted-foreground ml-1">
									/ {project.teamSize - 1}
								</span>
							</div>
						</div>
						<p className="text-xs text-center text-muted-foreground mt-2">
							{student.completionPercent}% Complete
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Score Distribution */}
			<Card>
				<CardHeader>
					<CardTitle>Your Score Distribution</CardTitle>
					<CardDescription>How your team members rated you</CardDescription>
				</CardHeader>
				<CardContent>
					{student.scoresReceived.length === 0 ? (
						<p className="text-center text-muted-foreground py-8">
							No scores received yet
						</p>
					) : (
						<div className="flex items-end justify-between h-40 px-2">
							{scoreDistribution.map((count, index) => (
								<div key={index} className="flex flex-col items-center">
									<div
										className="w-8 bg-primary rounded-t-sm"
										style={{
											height:
												count > 0 ? `${(count / maxCount) * 100}%` : '0%',
											minHeight: count > 0 ? '8px' : '0',
										}}
									/>
									<span className="text-xs mt-2">{index + 1}</span>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Reviewer Status */}
			<Card>
				<CardHeader>
					<CardTitle>Team Review Status</CardTitle>
					<CardDescription>Who has reviewed you</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{reviewerStatus.teamMembers.length === 0 ? (
							<p className="text-center text-muted-foreground py-4">
								No team members assigned yet
							</p>
						) : (
							reviewerStatus.teamMembers.map((name, index) => (
								<div key={index}>
									<div className="flex justify-between items-center">
										<span className="font-medium">{name}</span>
										<span
											className={`text-sm ${reviewerStatus.hasReviewedYou[index] ? 'text-green-500' : 'text-amber-500'}`}
										>
											{reviewerStatus.hasReviewedYou[index]
												? 'Reviewed You'
												: 'Pending Review'}
										</span>
									</div>
									{index < reviewerStatus.teamMembers.length - 1 && (
										<Separator className="mt-2" />
									)}
								</div>
							))
						)}
					</div>
				</CardContent>
			</Card>

			{/* Project Information */}
			<Card>
				<CardHeader>
					<CardTitle>Project Information</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div>
							<p className="text-sm font-medium">Project Title</p>
							<p>{project.title}</p>
						</div>
						<Separator />
						<div>
							<p className="text-sm font-medium">Team Size</p>
							<p>{project.teamSize} members</p>
						</div>
						<Separator />
						<div>
							<p className="text-sm font-medium">Total Reviews Required</p>
							<p>{project.totalReviews} reviews</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

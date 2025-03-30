'use client';

import { BarChart } from 'lucide-react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { useGetProjectPeerReviews } from '@/utils/hooks/faculty/use-get-project-peer-reviews';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PeerReviewTabProps {
	projectId: number;
	disabled?: boolean;
}

export function PeerReviewTab({ projectId, disabled = false }: PeerReviewTabProps) {
	const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
	const { data: peerReviewData, isLoading, error } = useGetProjectPeerReviews(projectId);

	// Select first student by default when data loads
	useEffect(() => {
		if (peerReviewData?.team_members && peerReviewData.team_members.length > 0) {
			setSelectedStudent(peerReviewData.team_members[0].id);
		}
	}, [peerReviewData]);

	// Helper functions
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	// Memoize filtered reviews for better performance
	const reviewsGiven = useMemo(() => {
		if (!peerReviewData || !selectedStudent) return [];
		return peerReviewData.review_pairs.filter((pair) => pair.reviewer.id === selectedStudent);
	}, [peerReviewData, selectedStudent]);

	const reviewsReceived = useMemo(() => {
		if (!peerReviewData || !selectedStudent) return [];
		return peerReviewData.review_pairs.filter((pair) => pair.reviewee.id === selectedStudent);
	}, [peerReviewData, selectedStudent]);

	// Get currently selected student
	const currentStudent = useMemo(() => {
		if (!peerReviewData?.team_members || !selectedStudent) return null;
		return peerReviewData.team_members.find((s) => s.id === selectedStudent);
	}, [peerReviewData, selectedStudent]);

	if (isLoading) {
		return (
			<div className="flex justify-center items-center min-h-[60vh] mb-8">
				<div className="flex flex-col items-center gap-2">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<p>Loading peer reviews...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<Alert variant="destructive" className="max-w-2xl mx-auto my-8">
				<AlertCircle className="h-4 w-4" />
				<AlertTitle>Error</AlertTitle>
				<AlertDescription>Failed to load peer reviews. {error.message}</AlertDescription>
			</Alert>
		);
	}

	if (!peerReviewData) {
		return (
			<Alert className="max-w-2xl mx-auto my-8">
				<AlertTitle>No peer reviews</AlertTitle>
				<AlertDescription>
					There are no peer reviews available for this project yet.
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h2 className="text-xl font-bold">{peerReviewData.project.title}</h2>
				<div className="flex items-center gap-2 bg-muted p-2 rounded-md">
					<BarChart className="h-5 w-5 text-primary" />
					<span className="font-medium">Team Average: </span>
					<Badge>{peerReviewData.team_summary.average_team_score.toFixed(2)}</Badge>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-6">
				<Card>
					<CardHeader>
						<CardTitle>Score Matrix</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="overflow-x-auto">
							{peerReviewData?.score_matrix?.rows ? (
								<Table>
									<TableHeader>
										<TableRow>
											{peerReviewData.score_matrix.headers?.map(
												(header, i) => (
													<TableHead
														key={i}
														className={i === 0 ? '' : 'text-center'}
													>
														{header}
													</TableHead>
												)
											)}
										</TableRow>
									</TableHeader>
									<TableBody>
										{peerReviewData.score_matrix.rows.map((row, rowIndex) => (
											<TableRow key={rowIndex}>
												<TableCell className="font-medium">
													{row.name}
												</TableCell>
												{row.scores?.map((score, colIndex) => (
													<TableCell
														key={colIndex}
														className="text-center"
													>
														{score === null ? (
															'—'
														) : (
															<Badge>{score}</Badge>
														)}
													</TableCell>
												))}
											</TableRow>
										))}
									</TableBody>
								</Table>
							) : (
								<div className="py-8 text-center text-muted-foreground">
									<p>No peer reviews have been completed yet.</p>
									<p className="text-sm mt-2">
										Peer review data will appear here once team members submit
										their reviews.
									</p>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="grid grid-cols-1 gap-6">
				<Tabs defaultValue="members">
					<TabsList className="mb-4">
						<TabsTrigger value="members">Team Members</TabsTrigger>
						<TabsTrigger value="reviews">Individual Reviews</TabsTrigger>
					</TabsList>

					<TabsContent value="members">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Matriculation</TableHead>
									<TableHead className="text-center">Avg. Score</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{peerReviewData.team_members.map((member) => (
									<TableRow
										key={member.id}
										className={selectedStudent === member.id ? 'bg-muted' : ''}
									>
										<TableCell className="font-medium">
											{member.name || 'Unknown'}
										</TableCell>
										<TableCell>{member.matriculation_number}</TableCell>
										<TableCell className="text-center">
											<Badge>{member.scores.average.toFixed(2)}</Badge>
										</TableCell>
										<TableCell className="text-right">
											<Button
												variant={
													selectedStudent === member.id
														? 'secondary'
														: 'ghost'
												}
												size="sm"
												onClick={() => setSelectedStudent(member.id)}
												disabled={disabled}
											>
												View Details
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TabsContent>

					<TabsContent value="reviews">
						{currentStudent && (
							<div className="space-y-4">
								<div className="bg-muted p-3 rounded-md">
									<h3 className="font-medium">
										Reviews for {currentStudent.name}
									</h3>
								</div>

								<Tabs defaultValue="received">
									<TabsList>
										<TabsTrigger value="received">Received</TabsTrigger>
										<TabsTrigger value="given">Given</TabsTrigger>
									</TabsList>

									<TabsContent value="received" className="mt-4">
										{reviewsReceived.length === 0 ? (
											<p className="text-center py-4 text-muted-foreground">
												No reviews received
											</p>
										) : (
											<div className="space-y-4">
												{reviewsReceived.map((reviewPair) => (
													<Card
														key={reviewPair.review.id}
														className="overflow-hidden"
													>
														<div className={`h-2`} />
														<CardContent className="pt-4">
															<div className="flex justify-between items-start mb-2">
																<div>
																	<p className="text-sm text-muted-foreground">
																		From
																	</p>
																	<p className="font-medium">
																		{reviewPair.reviewer.name}
																	</p>
																</div>
																<Badge>
																	Score: {reviewPair.review.score}
																	/5
																</Badge>
															</div>
															<div className="mt-3">
																<p className="text-sm text-muted-foreground mb-1">
																	Comments:
																</p>
																<p>{reviewPair.review.comments}</p>
															</div>
															<div className="mt-3 text-xs text-right text-muted-foreground">
																Submitted on{' '}
																{formatDate(
																	reviewPair.review.submitted_at
																)}
															</div>
														</CardContent>
													</Card>
												))}
											</div>
										)}
									</TabsContent>

									<TabsContent value="given" className="mt-4">
										{reviewsGiven.length === 0 ? (
											<p className="text-center py-4 text-muted-foreground">
												No reviews given
											</p>
										) : (
											<div className="space-y-4">
												{reviewsGiven.map((reviewPair) => (
													<Card
														key={reviewPair.review.id}
														className="overflow-hidden"
													>
														<div className="h-2" />
														<CardContent className="pt-4">
															<div className="flex justify-between items-start mb-2">
																<div>
																	<p className="text-sm text-muted-foreground">
																		To
																	</p>
																	<p className="font-medium">
																		{reviewPair.reviewee.name}
																	</p>
																</div>
																<Badge>
																	Score: {reviewPair.review.score}
																	/5
																</Badge>
															</div>
															<div className="mt-3">
																<p className="text-sm text-muted-foreground mb-1">
																	Comments:
																</p>
																<p>{reviewPair.review.comments}</p>
															</div>
															<div className="mt-3 text-xs text-right text-muted-foreground">
																Submitted on{' '}
																{formatDate(
																	reviewPair.review.submitted_at
																)}
															</div>
														</CardContent>
													</Card>
												))}
											</div>
										)}
									</TabsContent>
								</Tabs>
							</div>
						)}
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}

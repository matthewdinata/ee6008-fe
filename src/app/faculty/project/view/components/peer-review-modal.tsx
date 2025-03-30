// /* eslint-disable prettier/prettier */
// // components/peer-review-modal.tsx
// 'use client';

// import { BarChart, X } from 'lucide-react';
// import { useEffect, useState } from 'react';

// import { useGetProjectPeerReviews } from '@/utils/hooks/faculty/use-get-project-peer-reviews';

// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import {
// 	Dialog,
// 	DialogContent,
// 	DialogFooter,
// 	DialogHeader,
// 	DialogTitle,
// } from '@/components/ui/dialog';
// import {
// 	Table,
// 	TableBody,
// 	TableCell,
// 	TableHead,
// 	TableHeader,
// 	TableRow,
// } from '@/components/ui/table';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// /* eslint-disable prettier/prettier */
// // components/peer-review-modal.tsx

// /* eslint-disable prettier/prettier */
// // components/peer-review-modal.tsx

// /* eslint-disable prettier/prettier */
// // components/peer-review-modal.tsx

// /* eslint-disable prettier/prettier */
// // components/peer-review-modal.tsx

// /* eslint-disable prettier/prettier */
// // components/peer-review-modal.tsx

// /* eslint-disable prettier/prettier */
// // components/peer-review-modal.tsx

// /* eslint-disable prettier/prettier */
// // components/peer-review-modal.tsx

// /* eslint-disable prettier/prettier */
// // components/peer-review-modal.tsx

// /* eslint-disable prettier/prettier */
// // components/peer-review-modal.tsx

// /* eslint-disable prettier/prettier */
// // components/peer-review-modal.tsx

// /* eslint-disable prettier/prettier */
// // components/peer-review-modal.tsx

// /* eslint-disable prettier/prettier */
// // components/peer-review-modal.tsx

// /* eslint-disable prettier/prettier */
// // components/peer-review-modal.tsx

// /* eslint-disable prettier/prettier */
// // components/peer-review-modal.tsx

// // components/peer-review-modal.tsx

// // components/peer-review-modal.tsx

// // components/peer-review-modal.tsx

// // eslint-disable-next-line prettier/prettier
// export function PeerReviewModal({
// 	projectId,
// 	isOpen,
// 	onClose,
// }: {
// 	projectId: number | null;
// 	isOpen: boolean;
// 	onClose: () => void;
// }) {
// 	const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
// 	const {
// 		data: peerReviewData,
// 		isLoading,
// 		error,
// 	} = useGetProjectPeerReviews(isOpen ? projectId : null);

// 	// Select first student by default when data loads
// 	useEffect(() => {
// 		if (peerReviewData?.team_members && peerReviewData.team_members.length > 0) {
// 			setSelectedStudent(peerReviewData.team_members[0].id);
// 		}
// 	}, [peerReviewData]);

// 	// Helper functions

// 	const formatDate = (dateString: string) => {
// 		return new Date(dateString).toLocaleDateString('en-US', {
// 			year: 'numeric',
// 			month: 'short',
// 			day: 'numeric',
// 		});
// 	};

// 	// Filter reviews for selected student
// 	const getReviewsGiven = (studentId: number) => {
// 		if (!peerReviewData) return [];
// 		return peerReviewData.review_pairs.filter((pair) => pair.reviewer.id === studentId);
// 	};

// 	const getReviewsReceived = (studentId: number) => {
// 		if (!peerReviewData) return [];
// 		return peerReviewData.review_pairs.filter((pair) => pair.reviewee.id === studentId);
// 	};

// 	// Get currently selected student
// 	const currentStudent = peerReviewData?.team_members.find((s) => s.id === selectedStudent);

// 	return (
// 		<Dialog open={isOpen} onOpenChange={onClose}>
// 			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
// 				<DialogHeader>
// 					<DialogTitle className="flex justify-between items-center">
// 						<span>Peer Reviews</span>
// 						<Button variant="ghost" size="icon" onClick={onClose}>
// 							<X className="h-4 w-4" />
// 						</Button>
// 					</DialogTitle>
// 				</DialogHeader>

// 				{isLoading ? (
// 					<div className="flex justify-center items-center h-64">
// 						<p className="text-lg">Loading peer review data...</p>
// 					</div>
// 				) : error ? (
// 					<div className="flex justify-center items-center h-64 text-red-500">
// 						<p>Error loading peer reviews: {error.message}</p>
// 					</div>
// 				) : !peerReviewData ? (
// 					<div className="flex justify-center items-center h-64">
// 						<p className="text-lg text-muted-foreground">
// 							No peer review data available
// 						</p>
// 					</div>
// 				) : (
// 					<div className="space-y-6">
// 						<div className="flex justify-between items-center">
// 							<h2 className="text-xl font-bold">{peerReviewData.project.title}</h2>
// 							<div className="flex items-center gap-2 bg-muted p-2 rounded-md">
// 								<BarChart className="h-5 w-5 text-primary" />
// 								<span className="font-medium">Team Average: </span>
// 								<Badge>
// 									{peerReviewData.team_summary.average_team_score.toFixed(2)}
// 								</Badge>
// 							</div>
// 						</div>

// 						<div className="grid grid-cols-1 gap-6">
// 							<Card>
// 								<CardHeader>
// 									<CardTitle>Score Matrix</CardTitle>
// 								</CardHeader>
// 								<CardContent>
// 									<div className="overflow-x-auto">
// 										{peerReviewData?.score_matrix?.rows ? (
// 											<Table>
// 												<TableHeader>
// 													<TableRow>
// 														{peerReviewData.score_matrix.headers?.map(
// 															(header, i) => (
// 																<TableHead
// 																	key={i}
// 																	className={
// 																		i === 0 ? '' : 'text-center'
// 																	}
// 																>
// 																	{header}
// 																</TableHead>
// 															)
// 														)}
// 													</TableRow>
// 												</TableHeader>
// 												<TableBody>
// 													{peerReviewData.score_matrix.rows.map(
// 														(row, rowIndex) => (
// 															<TableRow key={rowIndex}>
// 																<TableCell className="font-medium">
// 																	{row.name}
// 																</TableCell>
// 																{row.scores?.map(
// 																	(score, colIndex) => (
// 																		<TableCell
// 																			key={colIndex}
// 																			className="text-center"
// 																		>
// 																			{score === null ? (
// 																				'—'
// 																			) : (
// 																				<Badge>
// 																					{score}
// 																				</Badge>
// 																			)}
// 																		</TableCell>
// 																	)
// 																)}
// 															</TableRow>
// 														)
// 													)}
// 												</TableBody>
// 											</Table>
// 										) : (
// 											<div className="py-8 text-center text-muted-foreground">
// 												<p>No peer reviews have been completed yet.</p>
// 												<p className="text-sm mt-2">
// 													Peer review data will appear here once team
// 													members submit their reviews.
// 												</p>
// 											</div>
// 										)}
// 									</div>
// 								</CardContent>
// 							</Card>
// 						</div>

// 						<div className="grid grid-cols-1 gap-6">
// 							<Tabs defaultValue="members">
// 								<TabsList className="mb-4">
// 									<TabsTrigger value="members">Team Members</TabsTrigger>
// 									<TabsTrigger value="reviews">Individual Reviews</TabsTrigger>
// 								</TabsList>

// 								<TabsContent value="members">
// 									<Table>
// 										<TableHeader>
// 											<TableRow>
// 												<TableHead>Name</TableHead>
// 												<TableHead>Matriculation</TableHead>
// 												<TableHead className="text-center">
// 													Avg. Score
// 												</TableHead>
// 												<TableHead className="text-right">
// 													Actions
// 												</TableHead>
// 											</TableRow>
// 										</TableHeader>
// 										<TableBody>
// 											{peerReviewData.team_members.map((member) => (
// 												<TableRow
// 													key={member.id}
// 													className={
// 														selectedStudent === member.id
// 															? 'bg-muted'
// 															: ''
// 													}
// 												>
// 													<TableCell className="font-medium">
// 														{member.name || 'Unknown'}
// 													</TableCell>
// 													<TableCell>
// 														{member.matriculation_number}
// 													</TableCell>
// 													<TableCell className="text-center">
// 														<Badge>
// 															{member.scores.average.toFixed(2)}
// 														</Badge>
// 													</TableCell>
// 													<TableCell className="text-right">
// 														<Button
// 															variant={
// 																selectedStudent === member.id
// 																	? 'secondary'
// 																	: 'ghost'
// 															}
// 															size="sm"
// 															onClick={() =>
// 																setSelectedStudent(member.id)
// 															}
// 														>
// 															View Details
// 														</Button>
// 													</TableCell>
// 												</TableRow>
// 											))}
// 										</TableBody>
// 									</Table>
// 								</TabsContent>

// 								<TabsContent value="reviews">
// 									{currentStudent && (
// 										<div className="space-y-4">
// 											<div className="bg-muted p-3 rounded-md">
// 												<h3 className="font-medium">
// 													Reviews for {currentStudent.name}
// 												</h3>
// 											</div>

// 											<Tabs defaultValue="received">
// 												<TabsList>
// 													<TabsTrigger value="received">
// 														Received
// 													</TabsTrigger>
// 													<TabsTrigger value="given">Given</TabsTrigger>
// 												</TabsList>

// 												<TabsContent value="received" className="mt-4">
// 													{getReviewsReceived(currentStudent.id)
// 														.length === 0 ? (
// 														<p className="text-center py-4 text-muted-foreground">
// 															No reviews received
// 														</p>
// 													) : (
// 														<div className="space-y-4">
// 															{getReviewsReceived(
// 																currentStudent.id
// 															).map((reviewPair) => (
// 																<Card
// 																	key={reviewPair.review.id}
// 																	className="overflow-hidden"
// 																>
// 																	<div className={`h-2`} />
// 																	<CardContent className="pt-4">
// 																		<div className="flex justify-between items-start mb-2">
// 																			<div>
// 																				<p className="text-sm text-muted-foreground">
// 																					From
// 																				</p>
// 																				<p className="font-medium">
// 																					{
// 																						reviewPair
// 																							.reviewer
// 																							.name
// 																					}
// 																				</p>
// 																			</div>
// 																			<Badge>
// 																				Score:{' '}
// 																				{
// 																					reviewPair
// 																						.review
// 																						.score
// 																				}
// 																				/5
// 																			</Badge>
// 																		</div>
// 																		<div className="mt-3">
// 																			<p className="text-sm text-muted-foreground mb-1">
// 																				Comments:
// 																			</p>
// 																			<p>
// 																				{
// 																					reviewPair
// 																						.review
// 																						.comments
// 																				}
// 																			</p>
// 																		</div>
// 																		<div className="mt-3 text-xs text-right text-muted-foreground">
// 																			Submitted on{' '}
// 																			{formatDate(
// 																				reviewPair.review
// 																					.submitted_at
// 																			)}
// 																		</div>
// 																	</CardContent>
// 																</Card>
// 															))}
// 														</div>
// 													)}
// 												</TabsContent>

// 												<TabsContent value="given" className="mt-4">
// 													{getReviewsGiven(currentStudent.id).length ===
// 													0 ? (
// 														<p className="text-center py-4 text-muted-foreground">
// 															No reviews given
// 														</p>
// 													) : (
// 														<div className="space-y-4">
// 															{getReviewsGiven(currentStudent.id).map(
// 																(reviewPair) => (
// 																	<Card
// 																		key={reviewPair.review.id}
// 																		className="overflow-hidden"
// 																	>
// 																		<div className="h-2" />
// 																		<CardContent className="pt-4">
// 																			<div className="flex justify-between items-start mb-2">
// 																				<div>
// 																					<p className="text-sm text-muted-foreground">
// 																						To
// 																					</p>
// 																					<p className="font-medium">
// 																						{
// 																							reviewPair
// 																								.reviewee
// 																								.name
// 																						}
// 																					</p>
// 																				</div>
// 																				<Badge>
// 																					Score:{' '}
// 																					{
// 																						reviewPair
// 																							.review
// 																							.score
// 																					}
// 																					/5
// 																				</Badge>
// 																			</div>
// 																			<div className="mt-3">
// 																				<p className="text-sm text-muted-foreground mb-1">
// 																					Comments:
// 																				</p>
// 																				<p>
// 																					{
// 																						reviewPair
// 																							.review
// 																							.comments
// 																					}
// 																				</p>
// 																			</div>
// 																			<div className="mt-3 text-xs text-right text-muted-foreground">
// 																				Submitted on{' '}
// 																				{formatDate(
// 																					reviewPair
// 																						.review
// 																						.submitted_at
// 																				)}
// 																			</div>
// 																		</CardContent>
// 																	</Card>
// 																)
// 															)}
// 														</div>
// 													)}
// 												</TabsContent>
// 											</Tabs>
// 										</div>
// 									)}
// 								</TabsContent>
// 							</Tabs>
// 						</div>
// 					</div>
// 				)}

// 				<DialogFooter>
// 					<Button variant="outline" onClick={onClose}>
// 						Close
// 					</Button>
// 				</DialogFooter>
// 			</DialogContent>
// 		</Dialog>
// 	);
// }

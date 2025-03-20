import { CalendarIcon, User, Users2 } from 'lucide-react';
import React from 'react';

import { getAllocatedProject } from '@/utils/actions/student/get-allocated-project';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

async function AllocatedProject() {
	const data = await getAllocatedProject();

	if (!data) {
		return (
			<Card>
				<CardContent className="py-10">
					<div className="text-center space-y-2">
						<h3 className="font-semibold text-lg">No Project Allocated</h3>
						<p className="text-sm text-muted-foreground">
							You haven&apos;t been allocated to a project yet or there was an error
							loading your project details.
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	// Format academic year and semester for display
	const academicPeriod = `${data.academicYear} - ${data.semester}`;

	return (
		<div>
			<Card>
				<CardHeader className="space-y-1">
					<div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<h2 className="text-xl font-bold">{data.project.title}</h2>
						</div>
						<div className="sm:flex-shrink-0">
							{data.project.programme && <Badge>{data.project.programme.name}</Badge>}
						</div>
					</div>
				</CardHeader>

				<CardContent className="space-y-6">
					{/* Project Details */}
					<div className="space-y-4">
						<div>
							<p className="text-sm text-muted-foreground">
								{data.project.professor ? (
									<>
										Supervised by{' '}
										<span className="font-semibold">
											{data.project.professor.name}
										</span>
									</>
								) : (
									'No supervisor assigned'
								)}
							</p>
							<p className="text-sm text-muted-foreground">
								{data.project.moderator ? (
									<>
										Moderated by{' '}
										<span className="font-semibold">
											{data.project.moderator.name}
										</span>
									</>
								) : (
									'No moderator assigned'
								)}
							</p>
						</div>
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<CalendarIcon size={16} />
							<span>{academicPeriod}</span>
						</div>

						{data.project.venue && (
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<span>Venue: {data.project.venue.name}</span>
							</div>
						)}

						<div className="space-y-2">
							<h3 className="font-semibold">Description</h3>
							<p className="text-sm text-muted-foreground">
								{data.project.description}
							</p>
						</div>

						{/* Team Members */}
						<div>
							<h3 className="font-semibold mb-3 flex items-center gap-2">
								<Users2 size={18} />
								Team Members
							</h3>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								{data.teamMembers.map((member) => (
									<div
										key={member.student_id}
										className="flex items-center gap-2"
									>
										<Avatar className="h-8 w-8">
											<AvatarFallback>
												{member.name ? (
													member.name
														.split(' ')
														.map((n) => n[0])
														.join('')
												) : (
													<User key={member.student_id} size={20} />
												)}
											</AvatarFallback>
										</Avatar>
										<span className="text-sm">
											{member.name || member.matriculation_number}
										</span>
									</div>
								))}
							</div>
						</div>
					</div>
				</CardContent>

				{data.project.professor && (
					<CardFooter className="mt-4">
						<div className="w-full text-sm text-muted-foreground">
							<p>
								For any questions about this project, please contact your supervisor
								at{' '}
								<a
									href={`mailto:${data.project.professor.email}`}
									className="text-primary hover:text-primary/80 underline"
								>
									{data.project.professor.email}
								</a>{' '}
								or team members directly.
							</p>
						</div>
					</CardFooter>
				)}
			</Card>
		</div>
	);
}

// Create a loading component for Suspense
export function AllocatedProjectSkeleton() {
	return (
		<Card>
			<CardHeader className="space-y-1">
				<div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
					<div className="space-y-2">
						<div className="h-6 w-48 bg-muted animate-pulse rounded"></div>
						<div className="h-4 w-32 bg-muted animate-pulse rounded"></div>
					</div>
					<div className="h-6 w-24 bg-muted animate-pulse rounded"></div>
				</div>
			</CardHeader>

			<CardContent className="space-y-6">
				<div className="space-y-4">
					<div className="h-4 w-20 bg-muted animate-pulse rounded"></div>

					<div className="space-y-2">
						<div className="h-5 w-24 bg-muted animate-pulse rounded"></div>
						<div className="h-4 w-full bg-muted animate-pulse rounded"></div>
						<div className="h-4 w-full bg-muted animate-pulse rounded"></div>
						<div className="h-4 w-2/3 bg-muted animate-pulse rounded"></div>
					</div>

					<div className="space-y-3">
						<div className="h-5 w-32 bg-muted animate-pulse rounded"></div>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							{[1, 2, 3, 4].map((i, index) => (
								<div
									key={`skeleton-member-${index}`}
									className="flex items-center gap-2"
								>
									<div className="h-8 w-8 bg-muted animate-pulse rounded-full"></div>
									<div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
								</div>
							))}
						</div>
					</div>
				</div>
			</CardContent>

			<CardFooter className="mt-4">
				<div className="h-4 w-full bg-muted animate-pulse rounded"></div>
			</CardFooter>
		</Card>
	);
}

export default AllocatedProject;

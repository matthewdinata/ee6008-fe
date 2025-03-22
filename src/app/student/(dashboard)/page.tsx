'use client';

import { ArrowRight, BookOpen, FileUser, FolderGit2, Users2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useGetActiveSemesterTimeline } from '@/utils/hooks/student/use-get-active-semester-timeline';
import { useGetAllocatedProject } from '@/utils/hooks/student/use-get-allocated-project';
import { useGetRegistrations } from '@/utils/hooks/student/use-get-registrations';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

export default function StudentDashboard() {
	const router = useRouter();
	const { data: timeline, isPending: isTimelinePending } = useGetActiveSemesterTimeline();
	const { data: registrations, isPending: isRegistrationsPending } = useGetRegistrations();
	const { data: allocatedProject, isPending: isAllocatedPending } = useGetAllocatedProject();

	if (isTimelinePending || isRegistrationsPending || isAllocatedPending) {
		return <DashboardSkeleton />;
	}

	return (
		<div className="space-y-6">
			{/* Welcome Section */}
			<div className="space-y-2">
				<h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>
				<p className="text-muted-foreground">
					Here&apos;s an overview of your project course management
				</p>
			</div>

			{/* Quick Actions Grid */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{/* Registration Status Card */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<FileUser className="h-5 w-5" />
							Project Registration
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<p className="text-sm text-muted-foreground">
								{timeline?.studentRegistrationStart ? (
									<>
										Registration{' '}
										{new Date() < new Date(timeline.studentRegistrationStart)
											? 'opens'
											: 'closes'}{' '}
										on{' '}
										{new Date(
											timeline?.studentRegistrationEnd
										).toLocaleDateString()}
									</>
								) : (
									'No active registration period'
								)}
							</p>
							<Progress
								value={
									registrations?.projects?.length
										? (registrations.projects.length / 5) * 100
										: 0
								}
								className="h-2"
							/>
							<p className="text-xs text-muted-foreground">
								{registrations?.projects?.length || 0} of 5 projects registered
							</p>
						</div>
					</CardContent>
					<CardFooter>
						<Button
							variant="outline"
							className="w-full"
							onClick={() => router.push('/student/registration')}
						>
							Manage Registration
							<ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</CardFooter>
				</Card>

				{/* Project Status Card */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<FolderGit2 className="h-5 w-5" />
							Project Status
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<p className="text-sm">
								{allocatedProject ? (
									<>
										Allocated to:{' '}
										<span className="font-semibold">
											{allocatedProject.project.title}
										</span>
									</>
								) : (
									'No project allocated yet'
								)}
							</p>
							<p className="text-xs text-muted-foreground">
								{allocatedProject?.project.professor?.name
									? `Supervisor: ${allocatedProject.project.professor.name}`
									: 'Awaiting allocation'}
							</p>
						</div>
					</CardContent>
					<CardFooter>
						<Button
							variant="outline"
							className="w-full"
							onClick={() => router.push('/student/allocated-project')}
						>
							View Project Details
							<ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</CardFooter>
				</Card>

				{/* Team Card */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Users2 className="h-5 w-5" />
							Team Members
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							{allocatedProject?.teamMembers ? (
								<div className="space-y-1">
									{allocatedProject.teamMembers.map((member, index) => (
										<p key={index} className="text-sm">
											{member.name || member.matriculation_number}
										</p>
									))}
								</div>
							) : (
								<p className="text-sm text-muted-foreground">
									No team assigned yet
								</p>
							)}
						</div>
					</CardContent>
					<CardFooter>
						<Button
							variant="outline"
							className="w-full"
							onClick={() => router.push('/student/peer-review')}
						>
							Peer Review
							<ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</CardFooter>
				</Card>
			</div>

			{/* Quick Links */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<BookOpen className="h-5 w-5" />
						Quick Links
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-2 md:grid-cols-2">
						<Link href="/student/planner" className="w-full">
							<Button variant="outline" className="w-full justify-start">
								<FileUser className="mr-2 h-4 w-4" />
								Project Planner
							</Button>
						</Link>
						<Link href="/student/registration" className="w-full">
							<Button variant="outline" className="w-full justify-start">
								<FileUser className="mr-2 h-4 w-4" />
								Project Registration
							</Button>
						</Link>
						<Link href="/student/allocated-project" className="w-full">
							<Button variant="outline" className="w-full justify-start">
								<FolderGit2 className="mr-2 h-4 w-4" />
								Allocated Project
							</Button>
						</Link>
						<Link href="/student/peer-review" className="w-full">
							<Button variant="outline" className="w-full justify-start">
								<Users2 className="mr-2 h-4 w-4" />
								Peer Review
							</Button>
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

function DashboardSkeleton() {
	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<Skeleton className="h-8 w-[250px]" />
				<Skeleton className="h-4 w-[350px]" />
			</div>
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{[...Array(3)].map((_, i) => (
					<Card key={i}>
						<CardHeader>
							<Skeleton className="h-6 w-[140px]" />
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-[80%]" />
							</div>
						</CardContent>
						<CardFooter>
							<Skeleton className="h-9 w-full" />
						</CardFooter>
					</Card>
				))}
			</div>
			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-[120px]" />
				</CardHeader>
				<CardContent>
					<div className="grid gap-2 md:grid-cols-2">
						{[...Array(4)].map((_, i) => (
							<Skeleton key={i} className="h-9 w-full" />
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

'use client';

import { ArrowRight, FileSliders, FolderOpenDot, SquareRadical, Users2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useGetMyProposals } from '@/utils/hooks/faculty/use-get-my-proposals';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

export default function FacultyDashboard() {
	const router = useRouter();
	const { data: proposals, isPending: isProposalsPending } = useGetMyProposals();

	if (isProposalsPending) {
		return <DashboardSkeleton />;
	}

	return (
		<div className="space-y-6">
			{/* Welcome Section */}
			<div className="space-y-2">
				<h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>
				<p className="text-muted-foreground">
					Here&apos;s an overview of your projects and proposals
				</p>
			</div>

			{/* Quick Actions Grid */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{/* Proposals Card */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<FileSliders className="h-5 w-5" />
							Project Proposals
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<div className="flex justify-between text-sm">
								<span>Total Proposals</span>
								<span className="font-medium">{proposals?.length || 0}</span>
							</div>
							<Progress
								value={
									proposals?.length
										? (proposals.filter((p) => p.status === 'approved').length /
												proposals.length) *
											100
										: 0
								}
								className="h-2"
							/>
							<p className="text-xs text-muted-foreground">
								{proposals?.filter((p) => p.status === 'approved').length || 0}{' '}
								approved proposals
							</p>
						</div>
					</CardContent>
					<CardFooter>
						<Button
							variant="outline"
							className="w-full"
							onClick={() => router.push('/faculty/proposal/view')}
						>
							View Proposals
							<ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</CardFooter>
				</Card>

				{/* Active Projects Card */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<FolderOpenDot className="h-5 w-5" />
							Active Projects
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<p className="text-sm">View and manage your active projects</p>
							<div className="flex items-center gap-2">
								<Users2 className="h-4 w-4 text-muted-foreground" />
								<span className="text-sm text-muted-foreground">
									Access project details
								</span>
							</div>
						</div>
					</CardContent>
					<CardFooter>
						<Button
							variant="outline"
							className="w-full"
							onClick={() => router.push('/faculty/project/view')}
						>
							Manage Projects
							<ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</CardFooter>
				</Card>

				{/* Evaluation Card */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<SquareRadical className="h-5 w-5" />
							Project Evaluation
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<p className="text-sm">Manage project evaluations and grades</p>
							<div className="flex items-center gap-2">
								<Users2 className="h-4 w-4 text-muted-foreground" />
								<span className="text-sm text-muted-foreground">
									Grade student projects
								</span>
							</div>
						</div>
					</CardContent>
					<CardFooter>
						<Button
							variant="outline"
							className="w-full"
							onClick={() => router.push('/faculty/grade/evaluation')}
						>
							Start Evaluation
							<ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</CardFooter>
				</Card>
			</div>

			{/* Quick Links */}
			<Card>
				<CardHeader>
					<CardTitle>Quick Actions</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-2 md:grid-cols-2">
						<Link href="/faculty/proposal/add" className="w-full">
							<Button variant="outline" className="w-full justify-start">
								<FileSliders className="mr-2 h-4 w-4" />
								Add New Proposal
							</Button>
						</Link>
						<Link href="/faculty/project/view" className="w-full">
							<Button variant="outline" className="w-full justify-start">
								<FolderOpenDot className="mr-2 h-4 w-4" />
								View My Projects
							</Button>
						</Link>
						<Link href="/faculty/grade/evaluation" className="w-full">
							<Button variant="outline" className="w-full justify-start">
								<SquareRadical className="mr-2 h-4 w-4" />
								Grade Projects
							</Button>
						</Link>
						<Link href="/faculty/grade/analytics" className="w-full">
							<Button variant="outline" className="w-full justify-start">
								<SquareRadical className="mr-2 h-4 w-4" />
								View Analytics
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

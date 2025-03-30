'use client';

import {
	ArrowRight,
	CalendarCheck,
	CalendarCog,
	Database,
	FolderOpenDot,
	SquareRadical,
	UserRoundPen,
	Users,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { TimelineEvent } from '@/utils/actions/admin/types';
import { useGetSemesterTimeline } from '@/utils/hooks/admin/use-get-semester-timeline';
import { useGetSemesters } from '@/utils/hooks/admin/use-get-semesters';
import { useToast } from '@/utils/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboard() {
	const router = useRouter();
	const { toast } = useToast();
	const { data: semesters, isPending: isSemestersPending } = useGetSemesters();

	// Find active semester
	const activeSemester = semesters?.find((sem) => sem.isActive === true);
	const semesterId = activeSemester?.id || 0;

	// Get timeline for active semester
	const { data: timelineEvents, isPending: isTimelinePending } = useGetSemesterTimeline(
		semesterId,
		{
			onError: () => {
				toast({
					title: 'Error',
					description: 'Failed to load semester timeline data.',
					variant: 'destructive',
				});
			},
		}
	);

	if (isSemestersPending || isTimelinePending) {
		return <DashboardSkeleton />;
	}

	// Find specific timeline event by name
	const findEvent = (name: string): TimelineEvent | undefined => {
		return timelineEvents?.find((event) =>
			event.name.toLowerCase().includes(name.toLowerCase())
		);
	};

	// Get date from a timeline event
	const getEventDate = (eventName: string, isEndDate: boolean = false): Date | null => {
		const event = findEvent(eventName);
		if (!event) return null;

		const dateStr = isEndDate ? event.end_date : event.start_date;
		if (!dateStr) return null;

		return new Date(dateStr);
	};

	// Calculate semester progress
	const calculateSemesterProgress = () => {
		if (!activeSemester || !timelineEvents?.length) return 0;

		// Get semester start and end dates from timeline events
		const startDate = getEventDate('semester period');
		const endDate = getEventDate('semester period', true);

		if (!startDate || !endDate) return 0;

		const currentDate = new Date();

		if (currentDate < startDate) return 0;
		if (currentDate > endDate) return 100;

		const totalDuration = endDate.getTime() - startDate.getTime();
		const elapsedDuration = currentDate.getTime() - startDate.getTime();

		return Math.round((elapsedDuration / totalDuration) * 100);
	};

	// Format date for display
	const formatDate = (dateInput?: string | Date | null) => {
		if (!dateInput) return 'Not set';

		const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	return (
		<div className="space-y-6">
			{/* Welcome Section */}
			<div className="space-y-2">
				<p className="text-muted-foreground">
					Manage system settings, users, and course administration
				</p>
			</div>

			{/* Quick Actions Grid */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{/* User Management Card */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<UserRoundPen className="h-5 w-5" />
							User Management
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<p className="text-sm">Manage faculty, students, and admins</p>
							<div className="flex items-center gap-2">
								<Users className="h-4 w-4 text-muted-foreground" />
								<span className="text-sm text-muted-foreground">
									Control user access and roles
								</span>
							</div>
						</div>
					</CardContent>
					<CardFooter>
						<Button
							variant="outline"
							className="w-full"
							onClick={() => router.push('/admin/user/faculty')}
						>
							Manage Users
							<ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</CardFooter>
				</Card>

				{/* Semester Management Card */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<CalendarCog className="h-5 w-5" />
							Semester Management
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<p className="text-sm">Configure semester timelines and settings</p>
							<div className="flex items-center gap-2">
								<CalendarCheck className="h-4 w-4 text-muted-foreground" />
								<span className="text-sm text-muted-foreground">
									Set registration and evaluation periods
								</span>
							</div>
						</div>
					</CardContent>
					<CardFooter>
						<Button
							variant="outline"
							className="w-full"
							onClick={() => router.push('/admin/semester/manage')}
						>
							Manage Semesters
							<ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</CardFooter>
				</Card>

				{/* Project Management Card */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<FolderOpenDot className="h-5 w-5" />
							Project Management
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<p className="text-sm">Manage project allocations and registrations</p>
							<div className="flex items-center gap-2">
								<Database className="h-4 w-4 text-muted-foreground" />
								<span className="text-sm text-muted-foreground">
									Handle student project assignments
								</span>
							</div>
						</div>
					</CardContent>
					<CardFooter>
						<Button
							variant="outline"
							className="w-full"
							onClick={() => router.push('/admin/project/allocation')}
						>
							Manage Allocations
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
						<Link href="/admin/user/faculty" className="w-full">
							<Button variant="outline" className="w-full justify-start">
								<UserRoundPen className="mr-2 h-4 w-4" />
								Manage Faculty
							</Button>
						</Link>
						<Link href="/admin/user/student" className="w-full">
							<Button variant="outline" className="w-full justify-start">
								<Users className="mr-2 h-4 w-4" />
								Manage Students
							</Button>
						</Link>
						<Link href="/admin/project/allocation" className="w-full">
							<Button variant="outline" className="w-full justify-start">
								<FolderOpenDot className="mr-2 h-4 w-4" />
								Project Allocation
							</Button>
						</Link>
						<Link href="/admin/grade/analytics" className="w-full">
							<Button variant="outline" className="w-full justify-start">
								<SquareRadical className="mr-2 h-4 w-4" />
								Grade Analytics
							</Button>
						</Link>
					</div>
				</CardContent>
			</Card>

			{/* System Status Card */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<CalendarCog className="h-5 w-5" />
						Current Semester Status
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{activeSemester ? (
							<>
								<div>
									<div className="mb-1 flex items-center justify-between">
										<span className="text-sm font-medium">
											{`AY ${activeSemester.academicYear} ${activeSemester.name}`}
										</span>
										<span className="text-sm font-medium text-green-600">
											Active
										</span>
									</div>
									<Progress value={calculateSemesterProgress()} className="h-2" />
									<p className="mt-1 text-xs text-muted-foreground">
										{calculateSemesterProgress()}% complete
									</p>
								</div>

								<div className="grid grid-cols-2 gap-4 text-sm">
									<div>
										<p className="font-medium">Semester Dates</p>
										<p className="text-muted-foreground">
											{formatDate(
												findEvent('semester period')?.start_date || null
											)}{' '}
											-{' '}
											{formatDate(
												findEvent('semester period')?.end_date || null
											)}
										</p>
									</div>
									<div>
										<p className="font-medium">Faculty Registration</p>
										<p className="text-muted-foreground">
											{formatDate(
												findEvent('faculty proposal submission')
													?.start_date || null
											)}{' '}
											-{' '}
											{formatDate(
												findEvent('faculty proposal submission')
													?.end_date || null
											)}
										</p>
									</div>
									<div>
										<p className="font-medium">Student Registration</p>
										<p className="text-muted-foreground">
											{formatDate(
												findEvent('student registration')?.start_date ||
													null
											)}{' '}
											-{' '}
											{formatDate(
												findEvent('student registration')?.end_date || null
											)}
										</p>
									</div>
									<div>
										<p className="font-medium">Evaluation Period</p>
										<p className="text-muted-foreground">
											{formatDate(
												findEvent('faculty mark entry')?.start_date || null
											)}{' '}
											-{' '}
											{formatDate(
												findEvent('faculty mark entry')?.end_date || null
											)}
										</p>
									</div>
								</div>
							</>
						) : (
							<p className="text-sm text-muted-foreground">
								No active semester found
							</p>
						)}
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
							<Skeleton key={i} className="h-10 w-full" />
						))}
					</div>
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-[140px]" />
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="space-y-2">
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-2 w-full" />
							<Skeleton className="h-3 w-[60%]" />
						</div>
						<div className="space-y-2">
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-2 w-full" />
							<Skeleton className="h-3 w-full" />
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

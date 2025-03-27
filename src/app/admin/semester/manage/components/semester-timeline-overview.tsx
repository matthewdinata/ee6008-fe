'use client';

import { format } from 'date-fns';
import { Calendar, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { TimelineEvent } from '@/utils/actions/admin/types';
import {
	useGetMultipleSemesterTimelines,
	useGetSemesterTimeline,
} from '@/utils/hooks/admin/use-get-semester-timeline';
import { useGetSemesters } from '@/utils/hooks/admin/use-get-semesters';

import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TimelineData {
	semesterId: number;
	academicYear: string;
	semesterName: string;
	isActive: boolean;
	events: TimelineEvent[];
}

interface SemesterTimelineOverviewProps {
	semesterId?: number; // Optional - if provided, only shows that semester
}

export function SemesterTimelineOverview({ semesterId }: SemesterTimelineOverviewProps) {
	const [activeTab, setActiveTab] = useState<string>('active');
	const _router = useRouter();

	// Use the useGetSemesters hook
	const {
		data: semestersData = [],
		isLoading: semestersLoading,
		error: semestersError,
	} = useGetSemesters();

	// Use the useGetSemesterTimeline hook when a specific semester ID is provided
	const {
		data: singleSemesterTimeline = [],
		isLoading: singleTimelineLoading,
		error: singleTimelineError,
	} = useGetSemesterTimeline(semesterId ?? 0);

	// Get all semester IDs for multi-timeline fetching
	const allSemesterIds = useMemo(() => {
		if (semesterId || !semestersData) return [];
		return semestersData.map((s) => s.id);
	}, [semesterId, semestersData]);

	// Use the useGetMultipleSemesterTimelines hook for all semesters
	const multipleTimelineResults = useGetMultipleSemesterTimelines(allSemesterIds);

	// Track overall loading state for multiple timelines
	const multipleTimelinesLoading = useMemo(() => {
		return multipleTimelineResults.some((result) => result.isLoading);
	}, [multipleTimelineResults]);

	// Calculate overall loading state
	const isLoading = useMemo(() => {
		if (semesterId) {
			return semestersLoading || singleTimelineLoading;
		}

		if (allSemesterIds.length > 0) {
			return semestersLoading || multipleTimelinesLoading;
		}

		return semestersLoading;
	}, [
		semesterId,
		semestersLoading,
		singleTimelineLoading,
		multipleTimelinesLoading,
		allSemesterIds,
	]);

	// Track error state
	const error = useMemo(() => {
		if (semestersError) return 'Failed to load semesters';
		if (semesterId && singleTimelineError)
			return 'Failed to load timeline for the selected semester';
		return null;
	}, [semestersError, singleTimelineError, semesterId]);

	// Process and derive timeline data directly with useMemo instead of useEffect + state
	const timelineData = useMemo(() => {
		// Skip processing if loading or missing data
		if (isLoading || (!semesterId && multipleTimelinesLoading) || !semestersData) {
			return [];
		}

		// For a single semester view
		if (semesterId && singleSemesterTimeline) {
			const semester = semestersData.find((s) => s.id === semesterId);
			if (!semester) return [];

			return [
				{
					semesterId: semester.id,
					academicYear: String(semester.academicYear || semester.academic_year || ''),
					semesterName: semester.name,
					isActive: Boolean(semester.isActive || semester.active || false),
					events: singleSemesterTimeline,
				},
			];
		}

		// For multiple semesters view
		if (!semesterId) {
			const processedTimelines: TimelineData[] = [];

			// Match each timeline result with its corresponding semester
			multipleTimelineResults.forEach((result, index) => {
				if (index >= allSemesterIds.length) return;

				const semesterId = allSemesterIds[index];
				const semester = semestersData.find((s) => s.id === semesterId);

				if (semester && result.data) {
					processedTimelines.push({
						semesterId: semester.id,
						academicYear: String(semester.academicYear || semester.academic_year || ''),
						semesterName: semester.name,
						isActive: Boolean(semester.isActive || semester.active || false),
						events: result.data,
					});
				}
			});

			// Sort by active status then academic year
			return processedTimelines.sort((a, b) => {
				if (a.isActive && !b.isActive) return -1;
				if (!a.isActive && b.isActive) return 1;

				// For same active status, sort by academic year (descending)
				const yearA = parseInt(a.academicYear) || 0;
				const yearB = parseInt(b.academicYear) || 0;

				return yearB - yearA;
			});
		}

		return [];
	}, [
		isLoading,
		semesterId,
		semestersData,
		singleSemesterTimeline,
		multipleTimelineResults,
		multipleTimelinesLoading,
		allSemesterIds,
	]);

	// Determine if there are active semesters and set tab accordingly
	// With this approach, if activeTab isn't explicitly changed by the user,
	// it will naturally follow whether there are active semesters
	const hasActiveSemesters = useMemo(() => {
		return timelineData.some((timeline) => timeline.isActive);
	}, [timelineData]);

	// When hasActiveSemesters changes, update the activeTab
	useEffect(() => {
		if (timelineData.length > 0) {
			setActiveTab(hasActiveSemesters ? 'active' : 'all');
		}
	}, [hasActiveSemesters, timelineData.length]);

	const getStatusBadge = (event: TimelineEvent) => {
		const now = new Date();
		const startDate = event.start_date ? new Date(event.start_date) : null;
		const endDate = event.end_date ? new Date(event.end_date) : null;

		if (!startDate || !endDate) {
			return <Badge variant="outline">Not Scheduled</Badge>;
		}

		if (now < startDate) {
			return <Badge variant="outline">Upcoming</Badge>;
		} else if (now > endDate) {
			return <Badge variant="secondary">Completed</Badge>;
		} else {
			return <Badge variant="default">In Progress</Badge>;
		}
	};

	// Filter timeline data based on active tab
	const filteredTimelineData = useMemo(() => {
		if (activeTab === 'active') {
			return timelineData.filter((timeline) => timeline.isActive);
		}
		return timelineData;
	}, [timelineData, activeTab]);

	// Short-circuit rendering when there's no data and we're not loading
	if (!isLoading && filteredTimelineData.length === 0) {
		return (
			<div className="flex flex-col gap-4">
				<div className="flex justify-between">
					<h2 className="text-3xl font-semibold tracking-tight">Semester Timeline</h2>
					{!semesterId && (
						<Tabs value={activeTab} onValueChange={setActiveTab}>
							<TabsList className="grid grid-cols-2 h-8">
								<TabsTrigger value="active">Active</TabsTrigger>
								<TabsTrigger value="all">All</TabsTrigger>
							</TabsList>
						</Tabs>
					)}
				</div>
				<div className="py-8 text-center">
					<h3 className="text-lg font-medium mb-2">No Timeline Data Available</h3>
					<p className="text-muted-foreground">
						{semesterId
							? 'There are no timeline events for this semester.'
							: 'There are no semesters with timeline events.'}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="flex justify-between">
				<h2 className="text-3xl font-semibold tracking-tight">Semester Timeline</h2>
				{!semesterId && (
					<Tabs value={activeTab} onValueChange={setActiveTab}>
						<TabsList className="grid grid-cols-2 h-8">
							<TabsTrigger value="active">Active</TabsTrigger>
							<TabsTrigger value="all">All</TabsTrigger>
						</TabsList>
					</Tabs>
				)}
			</div>

			{error && <div className="text-red-500 my-2">{error}</div>}

			{isLoading ? (
				// Loading skeletons
				<div className="space-y-6">
					{[1, 2].map((i) => (
						<div key={i} className="space-y-4">
							<Skeleton className="h-8 w-64" />
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{[1, 2, 3].map((j) => (
									<Skeleton key={j} className="h-36 w-full" />
								))}
							</div>
						</div>
					))}
				</div>
			) : (
				<div className="space-y-6">
					{filteredTimelineData.map((timeline) => (
						<div key={timeline.semesterId} className="space-y-4">
							<div className="flex items-center gap-2">
								<h3 className="text-xl font-semibold">
									{timeline.academicYear} {timeline.semesterName}
								</h3>
								{timeline.isActive && <Badge>Active</Badge>}
							</div>

							{timeline.events.length === 0 ? (
								<p className="text-muted-foreground">
									No timeline events available for this semester.
								</p>
							) : (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
									{timeline.events.map((event, index) => (
										<Card
											key={index}
											className="cursor-pointer hover:shadow-md transition-shadow"
										>
											<CardHeader>
												<div className="flex justify-between items-start">
													<CardTitle className="mb-2">
														{event.name}
													</CardTitle>
													{getStatusBadge(event)}
												</div>
												<CardDescription>
													<div className="flex flex-col gap-1">
														<div className="flex gap-2 items-center">
															<Calendar className="h-4 w-4" />
															<span>
																{event.start_date
																	? format(
																			new Date(
																				event.start_date
																			),
																			'dd MMM yyyy'
																		)
																	: 'Not scheduled'}
															</span>
														</div>
														{event.end_date && (
															<div className="flex gap-2 items-center">
																<Clock className="h-4 w-4" />
																<span>
																	{format(
																		new Date(event.end_date),
																		'dd MMM yyyy'
																	)}
																</span>
															</div>
														)}
													</div>
												</CardDescription>
											</CardHeader>
										</Card>
									))}
								</div>
							)}

							<Separator className="my-4" />
						</div>
					))}
				</div>
			)}
		</div>
	);
}

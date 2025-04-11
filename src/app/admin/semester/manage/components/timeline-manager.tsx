'use client';

import { Calendar, Loader2, RefreshCw } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

import { getSemesterTimeline } from '@/utils/actions/admin/semester';
import { TimelineEvent } from '@/utils/actions/admin/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { ProgrammeManager } from './programme-manager';
import { SemesterTimelineForm } from './semester-timeline-form';
import { SemesterTimelineOverview } from './semester-timeline-overview';

interface TimelineManagerProps {
	semesterId: number;
	academicYear: string;
	semesterName: string;
}

export function TimelineManager({ semesterId, academicYear, semesterName }: TimelineManagerProps) {
	const [_timeline, setTimeline] = useState<TimelineEvent[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<string>('timeline');
	const [timelineData, setTimelineData] = useState<{
		start_date: Date | null;
		end_date: Date | null;
		faculty_proposal_submission_start: Date | null;
		faculty_proposal_submission_end: Date | null;
		faculty_proposal_review_start: Date | null;
		faculty_proposal_review_end: Date | null;
		student_registration_start: Date | null;
		student_registration_end: Date | null;
		faculty_mark_entry_start: Date | null;
		faculty_mark_entry_end: Date | null;
		student_peer_review_start: Date | null;
		student_peer_review_end: Date | null;
	} | null>(null);

	const fetchTimeline = useCallback(async () => {
		console.log('CLIENT: Fetching timeline for semester ID:', semesterId);
		try {
			setIsLoading(true);
			setError(null);

			const response = await getSemesterTimeline(semesterId);
			console.log('CLIENT: Timeline response:', response);

			if (!response.success) {
				throw new Error(response.error || 'Failed to fetch timeline');
			}

			console.log('CLIENT: Timeline data received successfully');
			if (response.data) {
				console.log('CLIENT: Number of events:', response.data.length);
			}

			// Process timeline events
			const events = response.data;
			if (events) {
				setTimeline(events);

				// Extract timeline periods for the form
				if (events.length > 0) {
					// Find events for each period
					const semesterPeriod = events.find((e) => e.name === 'Semester Period');
					const facultyProposalSubmission = events.find(
						(e) => e.name === 'Faculty Proposal Submission'
					);
					const facultyProposalReview = events.find(
						(e) => e.name === 'Faculty Proposal Review'
					);
					const studentRegistration = events.find(
						(e) => e.name === 'Student Registration'
					);
					const facultyMarkEntry = events.find((e) => e.name === 'Faculty Mark Entry');
					const studentPeerReview = events.find((e) => e.name === 'Student Peer Review');

					// Create data structure for the form
					setTimelineData({
						start_date: semesterPeriod?.start_date
							? new Date(semesterPeriod.start_date)
							: null,
						end_date: semesterPeriod?.end_date
							? new Date(semesterPeriod.end_date)
							: null,
						faculty_proposal_submission_start: facultyProposalSubmission?.start_date
							? new Date(facultyProposalSubmission.start_date)
							: null,
						faculty_proposal_submission_end: facultyProposalSubmission?.end_date
							? new Date(facultyProposalSubmission.end_date)
							: null,
						faculty_proposal_review_start: facultyProposalReview?.start_date
							? new Date(facultyProposalReview.start_date)
							: null,
						faculty_proposal_review_end: facultyProposalReview?.end_date
							? new Date(facultyProposalReview.end_date)
							: null,
						student_registration_start: studentRegistration?.start_date
							? new Date(studentRegistration.start_date)
							: null,
						student_registration_end: studentRegistration?.end_date
							? new Date(studentRegistration.end_date)
							: null,
						faculty_mark_entry_start: facultyMarkEntry?.start_date
							? new Date(facultyMarkEntry.start_date)
							: null,
						faculty_mark_entry_end: facultyMarkEntry?.end_date
							? new Date(facultyMarkEntry.end_date)
							: null,
						student_peer_review_start: studentPeerReview?.start_date
							? new Date(studentPeerReview.start_date)
							: null,
						student_peer_review_end: studentPeerReview?.end_date
							? new Date(studentPeerReview.end_date)
							: null,
					});
				}
			}
		} catch (error) {
			console.error('CLIENT: Exception in fetchTimeline:', error);
			console.error('Error fetching timeline:', error);
			setError(
				error instanceof Error
					? error.message
					: 'An unknown error occurred while fetching timeline'
			);
		} finally {
			setIsLoading(false);
		}
	}, [semesterId]);

	useEffect(() => {
		if (semesterId) {
			fetchTimeline();
		}
	}, [semesterId, fetchTimeline]);

	// Get the current URL to check for tab parameter
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const url = new URL(window.location.href);
			const tabParam = url.searchParams.get('tab');
			if (tabParam && ['timeline', 'bulk-timeline', 'programmes'].includes(tabParam)) {
				setActiveTab(tabParam);
			}

			// Listen for custom tab change events
			const handleTabChange = (event: Event) => {
				const customEvent = event as CustomEvent<{ tab: string }>;
				if (customEvent.detail && customEvent.detail.tab) {
					setActiveTab(customEvent.detail.tab);
				}
			};

			window.addEventListener('tabChange', handleTabChange);

			// Clean up event listener
			return () => {
				window.removeEventListener('tabChange', handleTabChange);
			};
		}
	}, []);

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<div>
					<CardTitle className="text-xl font-bold">
						Manage {academicYear} {semesterName}
					</CardTitle>
					<CardDescription>
						Configure timeline events and programmes for this semester
					</CardDescription>
				</div>
				<Button variant="outline" size="icon" onClick={fetchTimeline} disabled={isLoading}>
					{isLoading ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<RefreshCw className="h-4 w-4" />
					)}
				</Button>
			</CardHeader>

			<CardContent>
				{error && (
					<div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
						{error}
					</div>
				)}

				<Tabs
					value={activeTab}
					onValueChange={(value) => {
						setActiveTab(value);
						// Update URL when tab changes
						if (typeof window !== 'undefined') {
							const url = new URL(window.location.href);
							url.searchParams.set('tab', value);
							window.history.pushState({}, '', url.toString());
						}
					}}
				>
					<TabsList className="mb-4">
						<TabsTrigger value="timeline">Timeline Events</TabsTrigger>
						<TabsTrigger value="bulk-timeline">Bulk Update Timeline</TabsTrigger>
						<TabsTrigger value="programmes">Programmes</TabsTrigger>
					</TabsList>

					<TabsContent value="timeline" className="space-y-4">
						<div className="flex justify-between items-center">
							<h3 className="text-lg font-medium">Timeline Events</h3>
						</div>

						<div className="mb-1">
							<Card className="bg-slate-50">
								<CardContent className="pt-6">
									<SemesterTimelineOverview semesterId={semesterId} />
								</CardContent>
							</Card>
						</div>
					</TabsContent>

					<TabsContent value="bulk-timeline">
						<div className="space-y-4">
							<div className="flex items-center">
								<Calendar className="mr-2 h-5 w-5" />
								<h3 className="text-lg font-medium">Set All Timeline Dates</h3>
							</div>
							<p className="text-sm text-muted-foreground">
								Use this form to set all important dates for the semester at once.
								This will update all timeline periods.
							</p>

							<SemesterTimelineForm
								semesterId={semesterId}
								existingData={timelineData || undefined}
								onSuccess={fetchTimeline}
							/>
						</div>
					</TabsContent>

					<TabsContent value="programmes">
						<ProgrammeManager semesterId={semesterId} />
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
}

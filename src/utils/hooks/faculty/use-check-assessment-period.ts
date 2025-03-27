'use client';

import { useEffect, useState } from 'react';

import { useGetActiveSemesterTimeline } from './use-get-active-semester-timeline';

interface AssessmentPeriodStatus {
	isWithinAssessmentPeriod: boolean;
	timeMessage: string;
	isLoading: boolean;
	error: boolean;
}

/**
 * Hook to check if the current time is within the faculty mark entry period
 * Returns status information about the assessment period
 */
export function useCheckAssessmentPeriod(): AssessmentPeriodStatus {
	const {
		data: semesterTimeline,
		isPending: isLoadingSemesterTimeline,
		error: timelineError,
	} = useGetActiveSemesterTimeline();
	const [isWithinAssessmentPeriod, setIsWithinAssessmentPeriod] = useState(true); // Default to true to allow assessment if timeline fetch fails
	const [timeMessage, setTimeMessage] = useState('');
	const [error, setError] = useState(false);

	useEffect(() => {
		// Handle API error case
		if (timelineError) {
			setError(true);
			setIsWithinAssessmentPeriod(true); // Allow assessment if timeline data is unavailable
			setTimeMessage(
				'Assessment period information is currently unavailable. Please proceed with your assessment.'
			);
			console.error('Error fetching assessment period data:', timelineError);
			return;
		}

		// Check if current time is within the mark entry period
		if (semesterTimeline) {
			const now = new Date();
			const startDate = new Date(semesterTimeline.facultyMarkEntryStart);
			const endDate = new Date(semesterTimeline.facultyMarkEntryEnd);

			if (now < startDate) {
				setIsWithinAssessmentPeriod(false);
				const formattedStartDate = new Intl.DateTimeFormat('en-US', {
					dateStyle: 'full',
					timeStyle: 'long',
				}).format(startDate);
				setTimeMessage(`Assessment period will open on ${formattedStartDate}`);
			} else if (now > endDate) {
				setIsWithinAssessmentPeriod(false);
				setTimeMessage('The assessment period has ended.');
			} else {
				setIsWithinAssessmentPeriod(true);
				const formattedEndDate = new Intl.DateTimeFormat('en-US', {
					dateStyle: 'full',
					timeStyle: 'long',
				}).format(endDate);
				setTimeMessage(`Assessment period closes on ${formattedEndDate}`);
			}
		} else if (!isLoadingSemesterTimeline) {
			// If no timeline data but not loading, assume assessment is allowed
			setIsWithinAssessmentPeriod(true);
			setTimeMessage(
				'Assessment period information is not available. Please proceed with your assessment.'
			);
		}
	}, [semesterTimeline, isLoadingSemesterTimeline, timelineError]);

	return {
		isWithinAssessmentPeriod,
		timeMessage,
		isLoading: isLoadingSemesterTimeline && !error,
		error,
	};
}

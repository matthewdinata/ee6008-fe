'use client';

import { useEffect, useState } from 'react';

import { SemesterTimeline } from '@/types/student';

import { useGetActiveSemesterTimeline } from './use-get-active-semester-timeline';

/**
 * Interface for the status of the peer review period
 */
interface PeerReviewPeriodStatus {
	isWithinPeerReviewPeriod: boolean;
	timeMessage: string;
	isLoading: boolean;
	error: boolean;
}

/**
 * Hook to check if the current time is within the peer review period
 * Returns status information about the peer review period
 */
export function useCheckPeerReviewPeriod(): PeerReviewPeriodStatus {
	const {
		data: semesterTimeline,
		isPending: isLoadingSemesterTimeline,
		error: timelineError,
	} = useGetActiveSemesterTimeline();

	const [isWithinPeerReviewPeriod, setIsWithinPeerReviewPeriod] = useState(false); // Default to false - safer option
	const [timeMessage, setTimeMessage] = useState('');
	const [error, setError] = useState(false);

	useEffect(() => {
		console.log('🔍 Timeline data received:', semesterTimeline);

		// Handle API error case
		if (timelineError) {
			setError(true);
			setIsWithinPeerReviewPeriod(false); // Default to disabling reviews if there's an error
			setTimeMessage(
				'Peer review period information is currently unavailable. Please try again later.'
			);
			console.error('Error fetching peer review period data:', timelineError);
			return;
		}

		// If we have valid timeline data, check if we're in the peer review period
		if (semesterTimeline) {
			console.log('🔍 Checking semester timeline for peer review period');

			// Process the timeline data
			const timeline = semesterTimeline as SemesterTimeline;

			// Check if the timeline has the peer review dates
			if (timeline.studentPeerReviewStart && timeline.studentPeerReviewEnd) {
				console.log('🔍 Found peer review dates in timeline data');

				const now = new Date();
				const startDate = new Date(timeline.studentPeerReviewStart);
				const endDate = new Date(timeline.studentPeerReviewEnd);

				console.log('🔍 Current time:', now.toISOString());
				console.log('🔍 Peer review start date:', startDate.toISOString());
				console.log('🔍 Peer review end date:', endDate.toISOString());

				const isWithinPeriod = now >= startDate && now <= endDate;
				console.log('🔍 Is within peer review period:', isWithinPeriod);

				setIsWithinPeerReviewPeriod(isWithinPeriod);

				if (now < startDate) {
					// Peer review period hasn't started yet
					const daysUntilStart = Math.ceil(
						(startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
					);
					setTimeMessage(
						`Peer review period is not open yet. It will open in ${daysUntilStart} day${
							daysUntilStart !== 1 ? 's' : ''
						} (${startDate.toLocaleDateString()}).`
					);
				} else if (now > endDate) {
					// Peer review period has ended
					setTimeMessage(
						`Peer review period has closed. The submission deadline was ${endDate.toLocaleDateString()}.`
					);
				} else {
					// We're within the peer review period
					const daysRemaining = Math.ceil(
						(endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
					);
					setTimeMessage(
						`Peer review period is currently open! You have ${daysRemaining} day${
							daysRemaining !== 1 ? 's' : ''
						} left to submit your reviews (deadline: ${endDate.toLocaleDateString()}).`
					);
				}
			} else {
				// No peer review dates found
				console.log('🔍 No peer review dates found in timeline');
				setIsWithinPeerReviewPeriod(false); // Default to disabling reviews if dates aren't set
				setTimeMessage('No peer review period has been set by your instructor.');
			}
		} else {
			// No timeline data available
			console.log('🔍 No timeline data available');
			setIsWithinPeerReviewPeriod(false); // Default to disabling reviews if timeline data is missing
			setTimeMessage(
				'Peer review period information is unavailable. Please try again later.'
			);
		}
	}, [semesterTimeline, timelineError]);

	return {
		isWithinPeerReviewPeriod,
		timeMessage,
		isLoading: isLoadingSemesterTimeline,
		error,
	};
}

'use client';

import { Venue } from '@/utils/actions/admin/venue';
import { useGetSemesters } from '@/utils/hooks/admin/use-get-semesters';

import { VenueAddForm } from './venue-add-form';

export function SingleVenueAdd() {
	// Fetch semesters for the dropdown
	const { data: semesters = [] } = useGetSemesters();

	// Find active semester if available
	const activeSemester = semesters.find((sem) => sem.isActive);
	const defaultSemesterId = activeSemester?.id || semesters[0]?.id || undefined;

	// Handle venue creation
	const handleVenueCreated = (_venue: Venue) => {
		// This could be used to trigger a refresh of the venue table
		// or show a notification, etc.
	};

	return (
		<VenueAddForm
			semesters={semesters}
			defaultSemesterId={defaultSemesterId}
			onVenueCreated={handleVenueCreated}
		/>
	);
}

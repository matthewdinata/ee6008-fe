/* eslint-disable prettier/prettier, import/extensions */
'use client';

import { ChevronLeft, ChevronRight, Pencil, RefreshCw, Search, Trash2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Semester } from '@/utils/actions/admin/types';
import { Venue, deleteVenue } from '@/utils/actions/admin/venue';
import { useGetSemesters } from '@/utils/hooks/admin/use-get-semesters';
import { useGetVenuesBySemester } from '@/utils/hooks/admin/use-get-venues-by-semester';

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

import { VenueAddDialog } from './venue-add-dialog';
import { VenueEditDialog } from './venue-edit-dialog';

/* eslint-disable prettier/prettier, import/extensions */

/* eslint-disable prettier/prettier, import/extensions */

/* eslint-disable prettier/prettier, import/extensions */

/* eslint-disable prettier/prettier, import/extensions */

/* eslint-disable prettier/prettier, import/extensions */

/* eslint-disable prettier/prettier, import/extensions */

/* eslint-disable prettier/prettier, import/extensions */

/* eslint-disable prettier/prettier, import/extensions */

export function VenueTable() {
	const _router = useRouter();
	const searchParams = useSearchParams();

	// Get semesterId from URL if available
	const semesterIdFromUrl = searchParams.get('semesterId');

	// Update URL with semester ID
	const updateUrlWithSemesterId = useCallback((semesterId: number) => {
		const url = new URL(window.location.href);
		url.searchParams.set('semesterId', semesterId.toString());
		window.history.replaceState({}, '', url.toString());
	}, []);

	// Fetch semesters
	const {
		data: semestersData,
		isLoading: isSemestersLoading,
		error: semestersError,
		refetch: _refetchSemesters,
	} = useGetSemesters();

	// Transform semesters to ensure academicYear is always a number
	const semesters = useMemo(() => {
		if (!semestersData) return [];
		return semestersData.map((sem) => ({
			...sem,
			academicYear: sem.academicYear || 0,
			academic_year: sem.academic_year || 0,
			isActive: sem.isActive === true, // Ensure isActive is always a boolean
		}));
	}, [semestersData]);

	const formatSemesterDisplay = (semester: Semester): string => {
		const activeStatus = semester.isActive ? ' (Active)' : '';
		return `AY ${semester.academicYear} - ${semester.name}${activeStatus}`;
	};

	const [selectedSemester, setSelectedSemester] = useState<number | null>(
		semesterIdFromUrl ? parseInt(semesterIdFromUrl) : null
	);
	const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, _setPageSize] = useState('10');
	const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

	// Set selected semester when semesters data is loaded
	useEffect(() => {
		if (semesters.length > 0 && !selectedSemester) {
			// Find active semester or use the first one
			const activeSemester = semesters.find((sem) => sem.isActive);
			if (activeSemester) {
				setSelectedSemester(activeSemester.id);
				updateUrlWithSemesterId(activeSemester.id);
			} else {
				setSelectedSemester(semesters[0].id);
				updateUrlWithSemesterId(semesters[0].id);
			}
		}
	}, [semesters, selectedSemester, updateUrlWithSemesterId]);

	// Use React Query hooks to fetch venues by semester
	const {
		data: venuesBySemester = [],
		isLoading: venuesLoading,
		error: venuesError,
		refetch: refetchVenues,
	} = useGetVenuesBySemester(selectedSemester);

	// Handle semester change
	const handleSemesterChange = (semesterId: string) => {
		const id = parseInt(semesterId);
		setSelectedSemester(id);
		updateUrlWithSemesterId(id);
		setCurrentPage(1); // Reset to first page when changing semester
	};

	// Filter venues based on search query
	const filteredVenues = useMemo(() => {
		return venuesBySemester.filter((venue) => {
			const searchLower = searchQuery.toLowerCase();
			return (
				venue.name.toLowerCase().includes(searchLower) ||
				venue.location.toLowerCase().includes(searchLower)
			);
		});
	}, [venuesBySemester, searchQuery]);

	// Calculate pagination
	const totalItems = filteredVenues.length;
	const totalPages = Math.ceil(totalItems / parseInt(pageSize));
	const startIndex = (currentPage - 1) * parseInt(pageSize);
	const endIndex = startIndex + parseInt(pageSize);
	const currentVenues = filteredVenues.slice(startIndex, endIndex);

	const handleDelete = async (venueId: number) => {
		try {
			setDeleteLoading(venueId);

			const response = await deleteVenue(venueId);

			if (!response.success) {
				throw new Error(response.error || 'Failed to delete venue');
			}

			// Remove the deleted venue from the local state and refetch data
			refetchVenues();
		} catch (error) {
			console.error('Error:', error);
		} finally {
			setDeleteLoading(null);
		}
	};

	const handleEdit = (venue: Venue) => {
		setEditingVenue(venue);
	};

	const _handleAdd = () => {
		setIsAddDialogOpen(true);
	};

	const handlePageChange = (newPage: number) => {
		if (newPage >= 1 && newPage <= totalPages) {
			setCurrentPage(newPage);
		}
	};

	// Handle venue update success
	const handleVenueUpdated = (_updatedVenue: Venue) => {
		refetchVenues();
		setEditingVenue(null);
	};

	// Handle new venue creation success
	const handleVenueCreated = (_newVenue: Venue) => {
		refetchVenues();
		setIsAddDialogOpen(false);
	};

	// Combine errors
	const error = venuesError || semestersError ? `Error: ${venuesError || semestersError}` : null;

	// Combined loading state
	const _isLoading = venuesLoading || isSemestersLoading;

	// Render loading state
	if (venuesLoading || isSemestersLoading) {
		return (
			<div className="flex justify-center items-center h-64">
				<div className="flex flex-col items-center gap-2">
					<RefreshCw className="h-8 w-8 animate-spin text-primary" />
					<p className="text-sm text-muted-foreground">Loading venues...</p>
				</div>
			</div>
		);
	}

	// Render error state
	if (venuesError || semestersError) {
		return (
			<div className="flex justify-center items-center h-64">
				<div className="text-center">
					<p className="text-red-500 mb-2">
						{venuesError instanceof Error
							? venuesError.message
							: 'Failed to load venues data'}
					</p>
					<Button onClick={() => refetchVenues()} variant="outline">
						<RefreshCw className="h-4 w-4 mr-2" />
						Try Again
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div className="w-full sm:w-auto">
					<Select
						value={selectedSemester?.toString() || ''}
						onValueChange={handleSemesterChange}
					>
						<SelectTrigger className="w-full sm:w-[200px]">
							<SelectValue placeholder="Select a semester" />
						</SelectTrigger>
						<SelectContent>
							{semesters.map((semester) => (
								<SelectItem key={semester.id} value={semester.id.toString()}>
									{formatSemesterDisplay(semester)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
					<div className="relative w-full sm:w-auto">
						<Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search venues..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-8 w-full sm:w-[300px]"
						/>
					</div>
				</div>
			</div>

			{error && (
				<div className="rounded-md bg-destructive/15 p-3 text-destructive">
					<p>{error}</p>
				</div>
			)}

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[60px]">ID</TableHead>
							<TableHead>Name</TableHead>
							<TableHead>Location</TableHead>
							<TableHead>Semester</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{currentVenues.length === 0 ? (
							<TableRow>
								<TableCell colSpan={6} className="h-24 text-center">
									No venues found.
								</TableCell>
							</TableRow>
						) : (
							currentVenues.map((venue) => {
								// Find the semester name
								const semester = semesters.find(
									(sem) => sem.id === venue.semesterId
								);
								const semesterDisplay = semester
									? formatSemesterDisplay(semester)
									: 'Unknown';

								return (
									<TableRow key={venue.id}>
										<TableCell className="font-medium">{venue.id}</TableCell>
										<TableCell>{venue.name}</TableCell>
										<TableCell>{venue.location}</TableCell>
										<TableCell>{semesterDisplay}</TableCell>
										<TableCell className="text-right">
											<div className="flex justify-end gap-2">
												<Button
													variant="ghost"
													size="icon"
													onClick={() => handleEdit(venue)}
												>
													<Pencil className="h-4 w-4" />
												</Button>
												<AlertDialog>
													<AlertDialogTrigger asChild>
														<Button variant="ghost" size="icon">
															<Trash2 className="h-4 w-4 text-destructive" />
														</Button>
													</AlertDialogTrigger>
													<AlertDialogContent>
														<AlertDialogHeader>
															<AlertDialogTitle>
																Confirm Deletion
															</AlertDialogTitle>
															<AlertDialogDescription>
																Are you sure you want to delete{' '}
																{venue.name}? This action cannot be
																undone.
															</AlertDialogDescription>
														</AlertDialogHeader>
														<AlertDialogFooter>
															<AlertDialogCancel>
																Cancel
															</AlertDialogCancel>
															<AlertDialogAction
																onClick={() =>
																	handleDelete(venue.id)
																}
																className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
															>
																{deleteLoading === venue.id
																	? 'Deleting...'
																	: 'Delete'}
															</AlertDialogAction>
														</AlertDialogFooter>
													</AlertDialogContent>
												</AlertDialog>
											</div>
										</TableCell>
									</TableRow>
								);
							})
						)}
					</TableBody>
				</Table>
			</div>

			{totalPages > 1 && (
				<div className="flex items-center justify-between">
					<div className="text-sm text-muted-foreground">
						Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems}{' '}
						venues
					</div>
					<div className="flex items-center space-x-2">
						<Button
							variant="outline"
							size="icon"
							onClick={() => handlePageChange(currentPage - 1)}
							disabled={currentPage === 1}
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							size="icon"
							onClick={() => handlePageChange(currentPage + 1)}
							disabled={currentPage === totalPages}
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			)}

			{/* Edit Venue Dialog */}
			{editingVenue && (
				<VenueEditDialog
					venue={editingVenue}
					semesters={semesters}
					open={!!editingVenue}
					onOpenChange={(open) => {
						if (!open) setEditingVenue(null);
					}}
					onVenueUpdated={handleVenueUpdated}
				/>
			)}

			{/* Add Venue Dialog */}
			<VenueAddDialog
				semesters={semesters}
				defaultSemesterId={selectedSemester || undefined}
				open={isAddDialogOpen}
				onOpenChange={(open: boolean) => setIsAddDialogOpen(open)}
				onVenueCreated={handleVenueCreated}
			/>
		</div>
	);
}

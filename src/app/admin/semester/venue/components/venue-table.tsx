/* eslint-disable prettier/prettier, import/extensions */
'use client';

import { ChevronLeft, ChevronRight, Pencil, RefreshCw, Search, Trash2 } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import { Venue, deleteVenue } from '@/utils/actions/admin/venue';
import { useGetSemesters } from '@/utils/hooks/admin/use-get-semesters';
import { useGetVenues } from '@/utils/hooks/admin/use-get-venues';

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

/* eslint-disable prettier/prettier, import/extensions */

/* eslint-disable prettier/prettier, import/extensions */

/* eslint-disable prettier/prettier, import/extensions */

/* eslint-disable prettier/prettier, import/extensions */

/* eslint-disable prettier/prettier, import/extensions */

/* eslint-disable prettier/prettier, import/extensions */

/* eslint-disable prettier/prettier, import/extensions */

/* eslint-disable prettier/prettier, import/extensions */

/* eslint-disable prettier/prettier, import/extensions */

/* eslint-disable prettier/prettier, import/extensions */

/* eslint-disable prettier/prettier, import/extensions */

/* eslint-disable prettier/prettier, import/extensions */

/* eslint-disable prettier/prettier, import/extensions */

/* eslint-disable prettier/prettier, import/extensions */

/* eslint-disable prettier/prettier, import/extensions */

export function VenueTable() {
	// Use React Query hooks instead of manual fetching
	const {
		data: allVenues = [],
		isLoading: venuesLoading,
		error: venuesError,
		refetch: refetchVenues,
	} = useGetVenues();

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

	const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
	const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState('10');
	const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

	// Set selected semester when semesters data is loaded
	useMemo(() => {
		if (semesters.length > 0 && !selectedSemester) {
			// Find active semester or use the first one
			const activeSemester = semesters.find((sem) => sem.isActive);
			if (activeSemester) {
				setSelectedSemester(activeSemester.id);
			} else {
				setSelectedSemester(semesters[0].id);
			}
		}
	}, [semesters, selectedSemester]);

	// Filter venues based on search query
	const filteredVenues = useMemo(() => {
		return allVenues.filter((venue) => {
			const searchLower = searchQuery.toLowerCase();
			return (
				venue.name.toLowerCase().includes(searchLower) ||
				venue.location.toLowerCase().includes(searchLower)
			);
		});
	}, [allVenues, searchQuery]);

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

	const handleAdd = () => {
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
	const isLoading = venuesLoading || isSemestersLoading;

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-2">
					<h2 className="text-2xl font-bold tracking-tight">Venue Management</h2>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => refetchVenues()}
						disabled={isLoading}
					>
						<RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
					</Button>
					<Button variant="default" size="sm" onClick={handleAdd}>
						Add Venue
					</Button>
				</div>

				<div className="flex flex-col gap-2 sm:flex-row">
					<div className="relative">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							type="search"
							placeholder="Search venues..."
							className="w-full pl-8 sm:w-[250px]"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>

					<Select
						value={pageSize}
						onValueChange={(value) => {
							setPageSize(value);
							setCurrentPage(1);
						}}
					>
						<SelectTrigger className="w-[120px]">
							<SelectValue placeholder="10 per page" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="10">10 per page</SelectItem>
							<SelectItem value="20">20 per page</SelectItem>
							<SelectItem value="50">50 per page</SelectItem>
						</SelectContent>
					</Select>
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
						{isLoading ? (
							<TableRow>
								<TableCell colSpan={6} className="h-24 text-center">
									Loading...
								</TableCell>
							</TableRow>
						) : currentVenues.length === 0 ? (
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
									? `${semester.academicYear} ${semester.name}`
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

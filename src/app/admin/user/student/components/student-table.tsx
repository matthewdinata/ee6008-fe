'use client';

import { ArrowUpDown, ChevronLeft, ChevronRight, Pencil, Search, Trash2 } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

import { Semester } from '@/utils/actions/admin/types';
import { User, deleteUser, fetchStudentUsers } from '@/utils/actions/admin/user';
import { useGetSemesters } from '@/utils/hooks/admin/use-get-semesters';

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

// Extended user interface to include semester information
interface StudentUser extends User {
	semester?: {
		id: number;
		academicYear: number;
		name: string;
		isActive: boolean;
	};
	matriculation_number?: string;
}

export function StudentTable() {
	const [allUsers, setAllUsers] = useState<StudentUser[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState('10');
	const [error, setError] = useState<string | null>(null);
	const [editingStudent, setEditingStudent] = useState<StudentUser | null>(null);
	const [isAddDialogOpen, _setIsAddDialogOpen] = useState<boolean>(false);
	const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
	const [sortColumn, setSortColumn] = useState<string | null>(null);
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

	// Fetch semesters
	const { data: semestersData } = useGetSemesters();

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

	// Format semester display for readability
	const formatSemesterDisplay = (semester: Semester): string => {
		const activeStatus = semester.isActive ? ' (Active)' : '';
		return `AY ${semester.academicYear} - ${semester.name}${activeStatus}`;
	};

	// Filter users based on search query and selected semester
	const filteredUsers = useMemo(() => {
		return allUsers.filter((user) => {
			// Filter by semester if selected
			if (selectedSemester && user.semester?.id !== selectedSemester) {
				return false;
			}

			// Filter by search query
			if (!searchQuery.trim()) return true;

			const searchLower = searchQuery.toLowerCase().trim();
			return (
				user.name.toLowerCase().includes(searchLower) ||
				user.email.toLowerCase().includes(searchLower) ||
				(user.matriculation_number?.toLowerCase().includes(searchLower) ?? false)
			);
		});
	}, [allUsers, searchQuery, selectedSemester]);

	// Sort filtered users
	const sortedUsers = useMemo(() => {
		if (!sortColumn || !sortDirection) return filteredUsers;

		return [...filteredUsers].sort((a, b) => {
			let aValue: string | number = '';
			let bValue: string | number = '';

			// Handle special cases for nested properties
			if (sortColumn === 'semester') {
				aValue = a.semester?.name || '';
				bValue = b.semester?.name || '';
			} else if (sortColumn === 'matriculation_number') {
				aValue = a.matriculation_number || '';
				bValue = b.matriculation_number || '';
			} else {
				// Use type assertion for safe indexing with double casting
				aValue = (a as unknown as Record<string, string | number>)[sortColumn] || '';
				bValue = (b as unknown as Record<string, string | number>)[sortColumn] || '';
			}

			// Convert to lowercase for string comparison
			if (typeof aValue === 'string' && typeof bValue === 'string') {
				aValue = aValue.toLowerCase();
				bValue = bValue.toLowerCase();
			}

			// Handle undefined or null values
			if (aValue === undefined || aValue === null) aValue = '';
			if (bValue === undefined || bValue === null) bValue = '';

			// Perform comparison
			const result = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
			return sortDirection === 'asc' ? result : -result;
		});
	}, [filteredUsers, sortColumn, sortDirection]);

	// Calculate pagination - use sorted users instead of filtered
	const totalItems = sortedUsers.length;
	const totalPages = Math.ceil(totalItems / parseInt(pageSize));
	const startIndex = (currentPage - 1) * parseInt(pageSize);
	const endIndex = startIndex + parseInt(pageSize);
	const currentUsers = sortedUsers.slice(startIndex, endIndex);

	const fetchUsers = async (forceRefresh: boolean = false) => {
		try {
			setIsLoading(true);
			setError(null);

			// Use utility function to fetch student users (server-side)
			// Pass forceRefresh to bypass cache and get fresh data
			const formattedData = await fetchStudentUsers(forceRefresh);

			// Log raw data to see if matriculation_number is included
			console.log('Raw student data:', formattedData);

			// Add isActive property to each student's semester object and handle matriculation numbers
			const studentsWithIsActive = formattedData.map((student) => ({
				...student,
				// If available, assign matriculation_number from the API response
				// This is a placeholder - we'll need to see the actual API response
				matriculation_number:
					(student as unknown as Record<string, string | undefined>)
						.matriculation_number || `M${student.id.toString().padStart(8, '0')}`,
				semester: student.semester
					? {
							...student.semester,
							isActive: true, // Default to true as this data isn't provided by the API
						}
					: undefined,
			}));

			setAllUsers(studentsWithIsActive);

			setCurrentPage(1); // Reset to first page when new data is fetched
			setSearchQuery(''); // Clear search when new data is fetched
		} catch (error) {
			console.error('Error fetching users:', error);
			setError(error instanceof Error ? error.message : 'An unexpected error occurred');
		} finally {
			setIsLoading(false);
		}
	};

	const handleDelete = async (userId: number) => {
		try {
			setDeleteLoading(userId);

			// Use utility function to delete a user
			console.log('Attempting to delete user ID:', userId);
			await deleteUser(userId);
			console.log('Delete API call completed');

			// Instead of just updating the local state, fetch fresh data from the server
			// to ensure our UI reflects the current database state
			console.log('Refreshing student list from server...');
			await fetchUsers(true); // Pass true to force a fresh fetch
			console.log('Student list refreshed');
		} catch (error) {
			console.error('Error deleting user:', error);
		} finally {
			setDeleteLoading(null);
		}
	};

	const handleEdit = (student: StudentUser) => {
		setEditingStudent(student);
	};

	const handlePageChange = (newPage: number) => {
		if (newPage >= 1 && newPage <= totalPages) {
			setCurrentPage(newPage);
		}
	};

	// Format semester display for readability
	const formatSemester = (user: StudentUser) => {
		if (!user.semester) return 'N/A';
		const activeStatus = user.semester.isActive ? ' (Active)' : '';
		return `AY ${user.semester.academicYear} - ${user.semester.name}${activeStatus}`;
	};

	useEffect(() => {
		fetchUsers();
	}, []);

	return (
		<div className="w-full text-foreground">
			<div className="flex flex-col space-y-4">
				<div className="flex justify-between items-center">
					<h2 className="text-2xl font-bold text-foreground">Student List</h2>
				</div>

				{error && (
					<div
						className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg"
						role="alert"
					>
						<span className="font-medium">Error:</span> {error}
					</div>
				)}

				{allUsers.length > 0 && (
					<div className="flex flex-wrap items-center justify-between gap-4 my-4">
						<div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
							<Select
								value={selectedSemester?.toString() || 'all'}
								onValueChange={(value) => {
									setSelectedSemester(
										value && value !== 'all' ? parseInt(value) : null
									);
									setCurrentPage(1); // Reset to first page when semester changes
								}}
							>
								<SelectTrigger className="w-[180px]">
									<SelectValue placeholder="Filter by semester" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Semesters</SelectItem>
									{semesters.map((semester) => (
										<SelectItem
											key={semester.id}
											value={semester.id.toString()}
										>
											{formatSemesterDisplay(semester)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							<div className="relative flex items-center w-full md:w-auto min-w-[200px]">
								<Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
								<Input
									type="search"
									placeholder="Search by name, email or matric..."
									className="pl-8"
									value={searchQuery}
									onChange={(e) => {
										setSearchQuery(e.target.value);
										setCurrentPage(1); // Reset to first page when search changes
									}}
								/>
							</div>
						</div>

						<div className="flex items-center gap-3 ml-auto">
							<div className="text-sm text-muted-foreground whitespace-nowrap">
								Showing <span className="font-medium">{startIndex + 1}</span>-
								<span className="font-medium">
									{Math.min(endIndex, totalItems)}
								</span>{' '}
								of <span className="font-medium">{totalItems}</span>
							</div>

							<div className="flex items-center gap-1.5">
								<span className="text-sm text-muted-foreground whitespace-nowrap">
									Show
								</span>
								<Select
									value={pageSize}
									onValueChange={(value) => {
										setPageSize(value);
										setCurrentPage(1); // Reset to first page when page size changes
									}}
								>
									<SelectTrigger className="h-8 w-[60px]">
										<SelectValue placeholder="{pageSize}" />
									</SelectTrigger>
									<SelectContent side="top">
										{[10, 20, 30, 40, 50].map((size) => (
											<SelectItem key={size} value={size.toString()}>
												{size}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<span className="text-sm text-muted-foreground whitespace-nowrap">
									per page
								</span>
							</div>
						</div>
					</div>
				)}

				<div className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-[60px]">
									<div
										className="flex items-center cursor-pointer"
										onClick={() => {
											if (sortColumn === 'id') {
												setSortDirection(
													sortDirection === 'asc' ? 'desc' : 'asc'
												);
											} else {
												setSortColumn('id');
												setSortDirection('asc');
											}
										}}
									>
										ID
										<ArrowUpDown className="ml-2 h-4 w-4" />
									</div>
								</TableHead>
								<TableHead>
									<div
										className="flex items-center cursor-pointer"
										onClick={() => {
											if (sortColumn === 'matriculation_number') {
												setSortDirection(
													sortDirection === 'asc' ? 'desc' : 'asc'
												);
											} else {
												setSortColumn('matriculation_number');
												setSortDirection('asc');
											}
										}}
									>
										Matric No.
										<ArrowUpDown className="ml-2 h-4 w-4" />
									</div>
								</TableHead>
								<TableHead>
									<div
										className="flex items-center cursor-pointer"
										onClick={() => {
											if (sortColumn === 'name') {
												setSortDirection(
													sortDirection === 'asc' ? 'desc' : 'asc'
												);
											} else {
												setSortColumn('name');
												setSortDirection('asc');
											}
										}}
									>
										Name
										<ArrowUpDown className="ml-2 h-4 w-4" />
									</div>
								</TableHead>
								<TableHead>
									<div
										className="flex items-center cursor-pointer"
										onClick={() => {
											if (sortColumn === 'email') {
												setSortDirection(
													sortDirection === 'asc' ? 'desc' : 'asc'
												);
											} else {
												setSortColumn('email');
												setSortDirection('asc');
											}
										}}
									>
										Email
										<ArrowUpDown className="ml-2 h-4 w-4" />
									</div>
								</TableHead>
								<TableHead>
									<div
										className="flex items-center cursor-pointer"
										onClick={() => {
											if (sortColumn === 'semester') {
												setSortDirection(
													sortDirection === 'asc' ? 'desc' : 'asc'
												);
											} else {
												setSortColumn('semester');
												setSortDirection('asc');
											}
										}}
									>
										Semester
										<ArrowUpDown className="ml-2 h-4 w-4" />
									</div>
								</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading ? (
								<TableRow>
									<TableCell colSpan={6} className="text-center py-8">
										<div className="flex justify-center">
											<div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
										</div>
									</TableCell>
								</TableRow>
							) : currentUsers.length === 0 ? (
								<TableRow>
									<TableCell colSpan={6} className="h-24 text-center">
										No students found.
									</TableCell>
								</TableRow>
							) : (
								currentUsers.map((user) => (
									<TableRow key={user.email}>
										<TableCell className="font-medium">
											{user.user_id || user.id}
										</TableCell>
										<TableCell>{user.matriculation_number}</TableCell>
										<TableCell>{user.name}</TableCell>
										<TableCell>{user.email}</TableCell>
										<TableCell>{formatSemester(user)}</TableCell>
										<TableCell className="text-right">
											<div className="flex justify-end gap-2">
												<Button
													variant="ghost"
													size="icon"
													onClick={() => handleEdit(user)}
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
																{user.name}? This action cannot be
																undone.
															</AlertDialogDescription>
														</AlertDialogHeader>
														<AlertDialogFooter>
															<AlertDialogCancel>
																Cancel
															</AlertDialogCancel>
															<AlertDialogAction
																onClick={() =>
																	handleDelete(user.id)
																}
																className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
															>
																{deleteLoading === user.id
																	? 'Deleting...'
																	: 'Delete'}
															</AlertDialogAction>
														</AlertDialogFooter>
													</AlertDialogContent>
												</AlertDialog>
											</div>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>

				{/* Pagination controls */}
				{totalPages > 1 && (
					<div className="flex items-center justify-between mt-4">
						<div className="text-sm text-muted-foreground">
							Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of{' '}
							{totalItems} students
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

				{/* Edit Student Dialog - This will need to be created separately */}
				{editingStudent && (
					<div className="text-sm text-muted-foreground mt-2">
						Student edit functionality will be implemented in a separate file.
					</div>
				)}

				{/* Add Student Dialog - This will need to be created separately */}
				{isAddDialogOpen && (
					<div className="text-sm text-muted-foreground mt-2">
						Student add dialog functionality will be implemented in a separate file.
					</div>
				)}
			</div>
		</div>
	);
}

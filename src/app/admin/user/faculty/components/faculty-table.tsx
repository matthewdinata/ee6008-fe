'use client';

import {
	ArrowUpDown,
	ChevronLeft,
	ChevronRight,
	Pencil,
	RefreshCw,
	Search,
	Trash2,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

import { User, deleteUser } from '@/utils/actions/admin/user';
import { useGetFacultyUsers } from '@/utils/hooks/admin/use-get-facullty-users';

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

import { FacultyRoleEditDialog } from './faculty-role-edit-dialog';

// Type for sort columns
type SortColumn = 'id' | 'name' | 'email';
type SortDirection = 'asc' | 'desc';

export default function FacultyTable() {
	const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
	const [selectedFaculty, setSelectedFaculty] = useState<User | null>(null);
	const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState('10');
	// Add sorting state
	const [sortColumn, setSortColumn] = useState<SortColumn>('id');
	const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

	// Use React Query hook for faculty users
	const {
		data: allUsers = [],
		isLoading,
		refetch,
		error,
	} = useGetFacultyUsers({
		onError: (error) => {
			console.error('Error fetching faculty users:', error);
		},
		onSuccess: (data) => {
			// Reset pagination and search when new data arrives
			setCurrentPage(1);
			setSearchQuery('');
			// Log the full data
			console.log('All users data:', data);
		},
	});

	// Filter and sort users
	const filteredUsers = useMemo(() => {
		// First normalize the users data to ensure proper property access
		const normalizedUsers = allUsers.map((user) => ({
			...user,
			// Ensure both property formats are available
			isCourseCoordinator: user.isCourseCoordinator || user.isCourseCoordinator || false,
		}));

		// Log for debugging
		console.log('Normalized users data:', normalizedUsers);

		// Then filter by search query
		const filtered = normalizedUsers.filter((user) => {
			const searchLower = searchQuery.toLowerCase();
			return (
				user.name.toLowerCase().includes(searchLower) ||
				user.email.toLowerCase().includes(searchLower)
			);
		});

		// Then sort the filtered results
		return [...filtered].sort((a, b) => {
			// Default to comparing IDs if values are equal
			const defaultCompare = () => {
				const aId = a.id || a.userId || 0;
				const bId = b.id || b.userId || 0;
				return sortDirection === 'asc' ? aId - bId : bId - aId;
			};

			// Define compare based on sortColumn
			let result = 0;
			// Prepare variables outside switch statement to avoid case block declarations
			let aId = 0;
			let bId = 0;

			switch (sortColumn) {
				case 'id':
					aId = a.id || a.userId || 0;
					bId = b.id || b.userId || 0;
					result = aId - bId;
					break;
				case 'name':
					result = a.name.localeCompare(b.name);
					break;
				case 'email':
					result = a.email.localeCompare(b.email);
					break;

				default:
					return defaultCompare();
			}

			// Apply sort direction
			return sortDirection === 'asc' ? result : -result;
		});
	}, [allUsers, searchQuery, sortColumn, sortDirection]);

	// Calculate pagination
	const totalItems = filteredUsers.length;
	const totalPages = Math.ceil(totalItems / parseInt(pageSize));
	const startIndex = (currentPage - 1) * parseInt(pageSize);
	const endIndex = startIndex + parseInt(pageSize);
	const currentUsers = filteredUsers.slice(startIndex, endIndex);

	const handleDelete = async (userId: number | undefined) => {
		if (userId === undefined) {
			console.error('Cannot delete user with undefined userId');
			return;
		}

		try {
			setDeleteLoading(userId);
			// Use utility function to delete a user
			await deleteUser(userId);

			// Refetch data after successful deletion instead of manual filtering
			refetch();
		} catch (error) {
			console.error('Error deleting user:', error);
		} finally {
			setDeleteLoading(null);
		}
	};

	const handlePageChange = (newPage: number) => {
		if (newPage >= 1 && newPage <= totalPages) {
			setCurrentPage(newPage);
		}
	};

	return (
		<div className="w-full text-foreground">
			<div className="flex flex-col space-y-4">
				<div className="flex justify-between items-center">
					<h2 className="text-2xl font-bold text-foreground">Faculty List</h2>
				</div>

				{error && (
					<div
						className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg"
						role="alert"
					>
						<span className="font-medium">Error:</span> {String(error)}
					</div>
				)}

				{allUsers.length > 0 && (
					<div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
						<div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
							<div className="relative w-full md:w-80">
								<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search by name or email..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-8 w-full"
								/>
							</div>
							<Button
								variant="outline"
								size="icon"
								onClick={() => {
									console.log('Refreshing faculty data');
									refetch();
								}}
								className="flex-shrink-0"
							>
								<RefreshCw className="h-4 w-4" />
							</Button>
						</div>
						<div className="flex items-center gap-2">
							<span className="text-sm text-muted-foreground">Show</span>
							<Select
								value={pageSize}
								onValueChange={(val) => {
									setPageSize(val);
									setCurrentPage(1); // Reset to first page when page size changes
								}}
							>
								<SelectTrigger className="w-16 h-8">
									<SelectValue placeholder="10" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="10">10</SelectItem>
									<SelectItem value="20">20</SelectItem>
									<SelectItem value="50">50</SelectItem>
									<SelectItem value="100">100</SelectItem>
								</SelectContent>
							</Select>
							<span className="text-sm text-muted-foreground hidden md:inline">
								per page
							</span>
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

								<TableHead className="w-[150px]">Course Coordinator</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading ? (
								<TableRow>
									<TableCell colSpan={5} className="text-center py-8">
										<div className="flex justify-center">
											<div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
										</div>
									</TableCell>
								</TableRow>
							) : currentUsers.length === 0 ? (
								<TableRow>
									<TableCell colSpan={5} className="h-24 text-center">
										No faculty users found.
									</TableCell>
								</TableRow>
							) : (
								currentUsers.map((user) => (
									<TableRow key={user.email}>
										<TableCell className="font-medium">
											{user.userId || user.id}
										</TableCell>
										<TableCell>{user.name}</TableCell>
										<TableCell>{user.email}</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												<span className="font-medium text-foreground">
													{user.isCourseCoordinator ||
													user.isCourseCoordinator
														? 'YES'
														: 'NO'}
												</span>
											</div>
										</TableCell>
										<TableCell className="text-right">
											<div className="flex justify-end gap-2">
												<Button
													variant="ghost"
													size="icon"
													title="Edit Faculty"
													onClick={() => {
														const mappedUser: User = {
															id: user.id,
															userId: user.userId || user.id,
															user_id: user.userId || user.id,
															email: user.email,
															name: user.name,
															is_course_coordinator:
																user.is_course_coordinator ||
																user.isCourseCoordinator ||
																false,
															isCourseCoordinator:
																user.isCourseCoordinator ||
																user.is_course_coordinator ||
																false,
														};
														setSelectedFaculty(mappedUser);
														setIsRoleDialogOpen(true);
													}}
												>
													<Pencil className="h-4 w-4" />
												</Button>
												<AlertDialog>
													<AlertDialogTrigger asChild>
														<Button variant="ghost" size="icon">
															{' '}
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
																	handleDelete(
																		user.userId || user.id
																	)
																}
																className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
															>
																{deleteLoading === user.userId ||
																deleteLoading === user.id
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
					<div className="flex items-center justify-end mt-4">
						<div className="flex items-center gap-6">
							<div className="text-sm text-muted-foreground">
								Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of{' '}
								{totalItems} faculty
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
					</div>
				)}

				{/* Faculty Edit Dialog */}
				{selectedFaculty && (
					<FacultyRoleEditDialog
						faculty={selectedFaculty}
						open={isRoleDialogOpen}
						onOpenChange={setIsRoleDialogOpen}
						onFacultyUpdated={refetch}
					/>
				)}
			</div>
		</div>
	);
}

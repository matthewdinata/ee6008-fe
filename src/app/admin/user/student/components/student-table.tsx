'use client';

import { ChevronLeft, ChevronRight, RefreshCw, Search, Trash2 } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

import { User, deleteUser, fetchStudentUsers } from '@/utils/actions/admin/user';

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
	};
}

export function StudentTable() {
	const [allUsers, setAllUsers] = useState<StudentUser[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState('10');
	const [error, setError] = useState<string | null>(null);

	// Filter users based on search query
	const filteredUsers = useMemo(() => {
		return allUsers.filter((user) => {
			const searchLower = searchQuery.toLowerCase();
			return (
				user.name.toLowerCase().includes(searchLower) ||
				user.email.toLowerCase().includes(searchLower)
			);
		});
	}, [allUsers, searchQuery]);

	// Calculate pagination
	const totalItems = filteredUsers.length;
	const totalPages = Math.ceil(totalItems / parseInt(pageSize));
	const startIndex = (currentPage - 1) * parseInt(pageSize);
	const endIndex = startIndex + parseInt(pageSize);
	const currentUsers = filteredUsers.slice(startIndex, endIndex);

	const fetchUsers = async () => {
		try {
			setIsLoading(true);
			setError(null);

			// Use utility function to fetch student users (server-side)
			const formattedData = await fetchStudentUsers();
			setAllUsers(formattedData);

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
			await deleteUser(userId);

			// Remove the deleted user from the local state
			setAllUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
		} catch (error) {
			console.error('Error:', error);
		} finally {
			setDeleteLoading(null);
		}
	};

	const handlePageChange = (newPage: number) => {
		if (newPage >= 1 && newPage <= totalPages) {
			setCurrentPage(newPage);
		}
	};

	// Format semester display for readability
	const formatSemester = (user: StudentUser) => {
		if (!user.semester) return 'N/A';
		return `Year ${user.semester.academicYear} ${user.semester.name}`;
	};

	useEffect(() => {
		fetchUsers();
	}, []);

	return (
		<div className="container mx-auto p-6 text-foreground">
			<div className="flex flex-col space-y-4">
				<div className="flex justify-between items-center">
					<h2 className="text-2xl font-bold text-foreground">Student List</h2>
					<Button
						onClick={fetchUsers}
						disabled={isLoading}
						className="flex items-center gap-2"
					>
						{isLoading ? (
							<>
								<div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
								Loading...
							</>
						) : (
							<>
								<RefreshCw className="h-4 w-4" />
								Get Students
							</>
						)}
					</Button>
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
					<div className="flex justify-between items-center gap-4">
						{/* Search bar */}
						<div className="flex items-center flex-1 max-w-sm">
							<div className="relative w-full">
								<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search by name or email..."
									value={searchQuery}
									onChange={(e) => {
										setSearchQuery(e.target.value);
										setCurrentPage(1); // Reset to first page on search
									}}
									className="pl-8"
								/>
							</div>
						</div>

						{/* Page size selector */}
						<div className="flex items-center gap-2">
							<span className="text-sm text-muted-foreground">Show:</span>
							<Select
								value={pageSize}
								onValueChange={(value) => {
									setPageSize(value);
									setCurrentPage(1); // Reset to first page when changing page size
								}}
							>
								<SelectTrigger className="w-[100px]">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="10">10</SelectItem>
									<SelectItem value="25">25</SelectItem>
									<SelectItem value="50">50</SelectItem>
									<SelectItem value="100">100</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				)}

				<div className="rounded-md border border-border bg-card">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-[100px]">ID</TableHead>
								<TableHead>Name</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Semester Academic Year</TableHead>
								<TableHead className="w-[100px]">Actions</TableHead>
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
									<TableCell colSpan={5} className="text-center py-8">
										{allUsers.length === 0
											? 'Click "Get Students" to load data'
											: 'No students found'}
									</TableCell>
								</TableRow>
							) : (
								currentUsers.map((user) => (
									<TableRow key={user.email}>
										<TableCell className="font-medium">
											{user.user_id}
										</TableCell>
										<TableCell>{user.name}</TableCell>
										<TableCell>{user.email}</TableCell>
										<TableCell>{formatSemester(user)}</TableCell>
										<TableCell>
											<AlertDialog>
												<AlertDialogTrigger asChild>
													<Button
														variant="outline"
														size="icon"
														className="h-8 w-8 text-red-600 hover:text-red-700"
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</AlertDialogTrigger>
												<AlertDialogContent>
													<AlertDialogHeader>
														<AlertDialogTitle>
															Are you sure you want to delete this
															user?
														</AlertDialogTitle>
														<AlertDialogDescription>
															This action cannot be undone. This will
															permanently delete the user account and
															remove their data from the servers.
														</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter>
														<AlertDialogCancel>
															Cancel
														</AlertDialogCancel>
														<AlertDialogAction
															onClick={() => handleDelete(user.id)}
															className="bg-red-600 hover:bg-red-700 text-white"
															disabled={deleteLoading === user.id}
														>
															{deleteLoading === user.id && (
																<div className="mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
															)}
															Delete
														</AlertDialogAction>
													</AlertDialogFooter>
												</AlertDialogContent>
											</AlertDialog>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>

				{/* Pagination controls */}
				{allUsers.length > 0 && totalPages > 1 && (
					<div className="flex justify-between items-center">
						<div className="text-sm text-muted-foreground">
							Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of{' '}
							{totalItems} results
						</div>
						<div className="flex gap-1">
							<Button
								variant="outline"
								size="icon"
								onClick={() => handlePageChange(currentPage - 1)}
								disabled={currentPage === 1}
							>
								<ChevronLeft className="h-4 w-4" />
							</Button>
							{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
								<Button
									key={page}
									variant={currentPage === page ? 'default' : 'outline'}
									className="h-8 w-8"
									onClick={() => handlePageChange(page)}
								>
									{page}
								</Button>
							))}
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
			</div>
		</div>
	);
}

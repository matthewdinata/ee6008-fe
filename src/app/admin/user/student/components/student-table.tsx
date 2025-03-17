'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ChevronLeft, ChevronRight, RefreshCw, Search, Trash2 } from 'lucide-react';
import React from 'react';
import { useMemo, useState } from 'react';

// Import types from fetch.ts for API responses and data models
import { User as ApiUser } from '@/utils/actions/admin/fetch';
import { deleteUser, getUsers } from '@/utils/actions/admin/fetch';

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

// Define the User interface used in the component
interface User {
	id: number;
	user_id: number;
	email: string;
	name: string;
	is_course_coordinator: boolean;
}

export function StudentTable() {
	const [allUsers, setAllUsers] = useState<User[]>([]); // Store all fetched users
	const [isLoading, setIsLoading] = useState(false);
	const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState('10');
	const supabase = createClientComponentClient();

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
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session) {
				throw new Error('No session found');
			}
			const response = await getUsers(session.access_token);

			if (!response.success) {
				throw new Error(response.error || 'Failed to fetch users');
			}

			const data = response.data as ApiUser[];
			console.log(data);
			const formattedData = data.map((userData) => ({
				id: userData.id,
				user_id: userData.id,
				email: userData.email,
				name: userData.name,
				is_course_coordinator: Boolean(userData.is_course_coordinator),
			}));

			setAllUsers(formattedData);

			setCurrentPage(1); // Reset to first page when new data is fetched
			setSearchQuery(''); // Clear search when new data is fetched
		} catch (error) {
			console.error('Error:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleDelete = async (userId: number) => {
		try {
			setDeleteLoading(userId);
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session) {
				throw new Error('No session found');
			}
			const response = await deleteUser(userId, session.access_token);

			if (!response.success) {
				throw new Error(response.error || 'Failed to delete user');
			}

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

	return (
		<div className="container mx-auto p-6 text-foreground">
			<div className="flex flex-col space-y-4">
				<div className="flex justify-between items-center">
					<h2 className="text-2xl font-bold text-foreground">User List</h2>
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
								Get Users
							</>
						)}
					</Button>
				</div>

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
								onValueChange={(val) => {
									setPageSize(val);
									setCurrentPage(1); // Reset to first page when changing page size
								}}
							>
								<SelectTrigger className="w-20">
									<SelectValue placeholder="10" />
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

				{/* Users Table */}
				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-[50px]">ID</TableHead>
								<TableHead>Name</TableHead>
								<TableHead>Email</TableHead>
								<TableHead className="w-[150px]">Course Coordinator</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading ? (
								<TableRow>
									<TableCell colSpan={5} className="text-center py-10">
										<div className="flex flex-col items-center justify-center">
											<div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
											<span className="text-muted-foreground">
												Loading users...
											</span>
										</div>
									</TableCell>
								</TableRow>
							) : allUsers.length === 0 ? (
								<TableRow>
									<TableCell colSpan={5} className="text-center py-10">
										<div className="flex flex-col items-center justify-center">
											<span className="text-muted-foreground mb-2">
												No users found.
											</span>
											<span className="text-sm text-muted-foreground">
												Click &quot;Get Users&quot; to load faculty members.
											</span>
										</div>
									</TableCell>
								</TableRow>
							) : currentUsers.length === 0 ? (
								<TableRow>
									<TableCell colSpan={5} className="text-center py-10">
										<div className="flex flex-col items-center justify-center">
											<span className="text-muted-foreground">
												No matching results for &quot;{searchQuery}&quot;
											</span>
										</div>
									</TableCell>
								</TableRow>
							) : (
								currentUsers.map((user) => (
									<TableRow key={user.id}>
										<TableCell className="font-medium">
											{user.user_id}
										</TableCell>
										<TableCell>{user.name}</TableCell>
										<TableCell>{user.email}</TableCell>
										<TableCell>
											{user.is_course_coordinator ? 'Yes' : 'No'}
										</TableCell>
										<TableCell className="text-right">
											<AlertDialog>
												<AlertDialogTrigger asChild>
													<Button
														variant="ghost"
														className="h-8 w-8 p-0 text-destructive hover:text-destructive/90"
														disabled={deleteLoading === user.id}
													>
														{deleteLoading === user.id ? (
															<div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
														) : (
															<Trash2 className="h-4 w-4" />
														)}
														<span className="sr-only">Delete</span>
													</Button>
												</AlertDialogTrigger>
												<AlertDialogContent>
													<AlertDialogHeader>
														<AlertDialogTitle>
															Are you absolutely sure?
														</AlertDialogTitle>
														<AlertDialogDescription>
															This action cannot be undone. This will
															permanently delete the user{' '}
															<span className="font-semibold">
																{user.name} ({user.email})
															</span>{' '}
															and remove their data from the system.
														</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter>
														<AlertDialogCancel>
															Cancel
														</AlertDialogCancel>
														<AlertDialogAction
															onClick={() =>
																handleDelete(user.user_id)
															}
															className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
														>
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

				{/* Pagination */}
				{allUsers.length > 0 && (
					<div className="flex items-center justify-between space-x-6 lg:space-x-8">
						<div className="flex items-center space-x-2">
							<p className="text-sm font-medium">
								Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of{' '}
								{totalItems}
							</p>
						</div>
						<div className="flex items-center space-x-2">
							<Button
								variant="outline"
								className="hidden h-8 w-8 p-0 lg:flex"
								onClick={() => handlePageChange(1)}
								disabled={currentPage === 1}
							>
								<span className="sr-only">Go to first page</span>
								<ChevronLeft className="h-4 w-4" />
								<ChevronLeft className="h-4 w-4" />
							</Button>
							<Button
								variant="outline"
								className="h-8 w-8 p-0"
								onClick={() => handlePageChange(currentPage - 1)}
								disabled={currentPage === 1}
							>
								<span className="sr-only">Go to previous page</span>
								<ChevronLeft className="h-4 w-4" />
							</Button>
							<div className="flex items-center justify-center text-sm font-medium">
								<span className="px-0.5">Page</span>
								<span className="px-0.5">{currentPage}</span>
								<span className="px-0.5">of</span>
								<span className="px-0.5">{totalPages || 1}</span>
							</div>
							<Button
								variant="outline"
								className="h-8 w-8 p-0"
								onClick={() => handlePageChange(currentPage + 1)}
								disabled={currentPage >= totalPages}
							>
								<span className="sr-only">Go to next page</span>
								<ChevronRight className="h-4 w-4" />
							</Button>
							<Button
								variant="outline"
								className="hidden h-8 w-8 p-0 lg:flex"
								onClick={() => handlePageChange(totalPages)}
								disabled={currentPage >= totalPages}
							>
								<span className="sr-only">Go to last page</span>
								<ChevronRight className="h-4 w-4" />
								<ChevronRight className="h-4 w-4" />
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

'use client';

import { ChevronLeft, ChevronRight, RefreshCw, Search, Trash2 } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import { deleteUser, fetchStudentUsers } from '@/utils/actions/admin/upload';

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

interface User {
	id: number;
	student_id: number;
	email: string;
	name: string;
	semester_name: string;
	academic_year: number;
	is_active: boolean;
}

export function UserTable() {
	const [allUsers, setAllUsers] = useState<User[]>([]); // Store all fetched users
	const [isLoading, setIsLoading] = useState(false);
	const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState('10');

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

	const fetchAllStudents = async () => {
		try {
			setIsLoading(true);
			const data = await fetchStudentUsers();
			const formattedData = data.map((user: User) => ({
				id: user.student_id,
				email: user.email,
				name: user.name,
				semester_name: user.semester_name,
				academic_year: user.academic_year,
				is_active: user.is_active,
			}));
			setAllUsers(formattedData);
			setCurrentPage(1); // Reset to first page when new data is fetched
			setSearchQuery(''); // Clear search when new data is fetched
		} catch (error) {
			console.error('Error fetching students:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleDelete = async (userId: number) => {
		try {
			setDeleteLoading(userId);
			await deleteUser(userId.toString());
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
		<div className="container mx-auto p-6">
			<div className="flex flex-col space-y-4">
				<div className="flex justify-between items-center">
					<h2 className="text-2xl font-bold">User List</h2>
					<Button
						onClick={fetchAllStudents}
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

				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-[100px]">ID</TableHead>
								<TableHead>Name</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Semester Name</TableHead>
								<TableHead>Academic Year</TableHead>
								<TableHead>Is Active</TableHead>
								<TableHead className="w-[100px]">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading ? (
								<TableRow>
									<TableCell colSpan={7} className="text-center py-8">
										<div className="flex justify-center">
											<div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
										</div>
									</TableCell>
								</TableRow>
							) : currentUsers.length === 0 ? (
								<TableRow>
									<TableCell colSpan={7} className="text-center py-8">
										{allUsers.length === 0
											? 'Click "Get Users" to load data'
											: 'No users found'}
									</TableCell>
								</TableRow>
							) : (
								currentUsers.map((user) => (
									<TableRow key={user.id}>
										<TableCell className="font-medium">{user.id}</TableCell>
										<TableCell>{user.name}</TableCell>
										<TableCell>{user.email}</TableCell>
										<TableCell>{user.semester_name ?? 'N/A'}</TableCell>
										<TableCell>{user.academic_year ?? 'N/A'}</TableCell>
										<TableCell>{user.is_active ? 'Yes' : 'No'}</TableCell>
										<TableCell>
											<AlertDialog>
												<AlertDialogTrigger asChild>
													<Button
														variant="destructive"
														size="sm"
														disabled={deleteLoading === user.id}
													>
														{deleteLoading === user.id ? (
															<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
														) : (
															<Trash2 className="h-4 w-4" />
														)}
													</Button>
												</AlertDialogTrigger>
												<AlertDialogContent>
													<AlertDialogHeader>
														<AlertDialogTitle>
															Are you sure?
														</AlertDialogTitle>
														<AlertDialogDescription>
															This action cannot be undone. This will
															permanently delete the user and remove
															their data from our servers.
														</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter>
														<AlertDialogCancel>
															Cancel
														</AlertDialogCancel>
														<AlertDialogAction
															onClick={() => handleDelete(user.id)}
															className="bg-red-600 hover:bg-red-700"
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

				{allUsers.length > 0 && (
					<div className="flex items-center justify-between">
						<p className="text-sm text-muted-foreground">
							Showing {currentUsers.length > 0 ? startIndex + 1 : 0}-
							{Math.min(endIndex, totalItems)} of {totalItems} results
						</p>
						<div className="flex items-center space-x-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => handlePageChange(currentPage - 1)}
								disabled={currentPage === 1}
							>
								<ChevronLeft className="h-4 w-4" />
							</Button>
							<div className="flex items-center gap-1">
								{Array.from({ length: totalPages }, (_, i) => i + 1)
									.filter((page) => {
										return (
											page === 1 ||
											page === totalPages ||
											Math.abs(page - currentPage) <= 1
										);
									})
									.map((page, index, array) => (
										<React.Fragment key={page}>
											{index > 0 && array[index - 1] !== page - 1 && (
												<span className="px-2">...</span>
											)}
											<Button
												variant={
													currentPage === page ? 'default' : 'outline'
												}
												size="sm"
												onClick={() => handlePageChange(page)}
											>
												{page}
											</Button>
										</React.Fragment>
									))}
							</div>
							<Button
								variant="outline"
								size="sm"
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

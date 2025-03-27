'use client';

import { ChevronLeft, ChevronRight, RefreshCw, Search, Trash2 } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import { deleteUser } from '@/utils/actions/admin/user';
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

export default function FacultyTable() {
	const [searchQuery, setSearchQuery] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState('10');

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

	const handleDelete = async (userId: number | undefined) => {
		if (userId === undefined) {
			console.error('Cannot delete user with undefined userId');
			return;
		}

		try {
			// Use utility function to delete a user
			await deleteUser(userId);

			// Refetch data after successful deletion instead of manual filtering
			refetch();
		} catch (error) {
			console.error('Error:', error);
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
					<h2 className="text-2xl font-bold text-foreground">Faculty List</h2>
					<Button
						onClick={() => refetch()}
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
								Get Faculty
							</>
						)}
					</Button>
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
								<TableHead>Role</TableHead>
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
											? 'Click "Get Faculty" to load data'
											: 'No faculty users found'}
									</TableCell>
								</TableRow>
							) : (
								currentUsers.map((user) => (
									<TableRow key={user.email}>
										<TableCell className="font-medium">{user.userId}</TableCell>
										<TableCell>{user.name}</TableCell>
										<TableCell>{user.email}</TableCell>
										<TableCell>
											{user.isCourseCoordinator
												? 'Course Coordinator'
												: 'Faculty'}
										</TableCell>
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
															Delete User
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
																handleDelete(user.userId)
															}
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
									.map((page, index, array) => {
										// Add ellipsis for skipped pages
										const prevPage = array[index - 1];
										if (prevPage && page - prevPage > 1) {
											return (
												<React.Fragment key={`ellipsis-${page}`}>
													<span className="px-2 text-muted-foreground">
														...
													</span>
													<Button
														key={page}
														variant={
															currentPage === page
																? 'default'
																: 'outline'
														}
														size="sm"
														onClick={() => handlePageChange(page)}
														className="w-8 h-8"
													>
														{page}
													</Button>
												</React.Fragment>
											);
										}
										return (
											<Button
												key={page}
												variant={
													currentPage === page ? 'default' : 'outline'
												}
												size="sm"
												onClick={() => handlePageChange(page)}
												className="w-8 h-8"
											>
												{page}
											</Button>
										);
									})}
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

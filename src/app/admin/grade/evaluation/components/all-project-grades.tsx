'use client';

import { ArrowUpDown, DownloadIcon, Loader2, SearchIcon } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import { useGetAllProjectGrades } from '@/utils/hooks/admin/use-get-all-project-grades';
import { useToast } from '@/utils/hooks/use-toast';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@/components/ui/pagination';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

interface AllProjectGradesProps {
	semesterId: number | null;
	academicYear?: number;
}

export default function AllProjectGrades({ semesterId, academicYear }: AllProjectGradesProps) {
	const { toast } = useToast();
	const [searchTerm, setSearchTerm] = useState('');
	const [expandedProjects, setExpandedProjects] = useState<Record<number, boolean>>({});
	const [sortColumn, setSortColumn] = useState<string | null>(null);
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

	// Fetch all project grades
	const {
		data: allProjectGrades,
		isLoading: isGradesLoading,
		error,
	} = useGetAllProjectGrades(semesterId !== null ? semesterId.toString() : null);

	// Search functionality
	const filteredProjects = useMemo(() => {
		if (!allProjectGrades) return [];
		if (!searchTerm) return allProjectGrades;

		const lowerSearchTerm = searchTerm.toLowerCase();
		return allProjectGrades.filter(
			(project) =>
				project.title?.toLowerCase().includes(lowerSearchTerm) ||
				(project.supervisorName?.toLowerCase() || '').includes(lowerSearchTerm) ||
				(project.moderatorName?.toLowerCase() || '').includes(lowerSearchTerm) ||
				project.students.some(
					(student) =>
						(student.name?.toLowerCase() || '').includes(lowerSearchTerm) ||
						(student.matricNumber?.toLowerCase() || '').includes(lowerSearchTerm)
				)
		);
	}, [allProjectGrades, searchTerm]);

	// Pagination
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 10;

	// Apply sorting to filtered projects
	const sortedProjects = useMemo(() => {
		if (!filteredProjects || !sortColumn || !sortDirection) return filteredProjects;

		return [...filteredProjects].sort((a, b) => {
			let aValue: string | number = '';
			let bValue: string | number = '';

			// Handle special cases for nested objects/arrays
			switch (sortColumn) {
				case 'title':
					aValue = a.title || '';
					bValue = b.title || '';
					break;
				case 'supervisor':
					aValue = a.supervisorName || '';
					bValue = b.supervisorName || '';
					break;
				case 'moderator':
					aValue = a.moderatorName || '';
					bValue = b.moderatorName || '';
					break;
				case 'studentsCount':
					aValue = a.students.length;
					bValue = b.students.length;
					break;
				default:
					return 0;
			}

			// Handle string comparisons
			if (typeof aValue === 'string' && typeof bValue === 'string') {
				const comparison = aValue.localeCompare(bValue);
				return sortDirection === 'asc' ? comparison : -comparison;
			}

			// Handle number comparisons
			const numA = typeof aValue === 'number' ? aValue : 0;
			const numB = typeof bValue === 'number' ? bValue : 0;

			return sortDirection === 'asc' ? numA - numB : numB - numA;
		});
	}, [filteredProjects, sortColumn, sortDirection]);

	// Handle sorting toggle
	const toggleSort = (column: string) => {
		if (sortColumn === column) {
			// Cycle through: asc -> desc -> null
			if (sortDirection === 'asc') {
				setSortDirection('desc');
			} else if (sortDirection === 'desc') {
				setSortColumn(null);
				setSortDirection(null);
			} else {
				setSortDirection('asc');
			}
		} else {
			setSortColumn(column);
			setSortDirection('asc');
		}
	};

	// Calculate total pages after we have sorted projects
	const totalPages = Math.ceil((sortedProjects?.length || 0) / itemsPerPage);

	const paginatedProjects = useMemo(() => {
		if (!sortedProjects || sortedProjects.length === 0) return [];
		const startIndex = (currentPage - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		return sortedProjects.slice(startIndex, endIndex);
	}, [sortedProjects, currentPage]);

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	// Toggle project expansion
	const toggleProjectExpansion = (projectId: number) => {
		setExpandedProjects((prev) => ({
			...prev,
			[projectId]: !prev[projectId],
		}));
	};

	// Export to Excel (CSV format)
	const exportToExcel = () => {
		try {
			if (!allProjectGrades || allProjectGrades.length === 0) {
				toast({
					title: 'No data to export',
					description: 'There are no project grades available to export.',
					variant: 'destructive',
				});
				return;
			}

			// Define CSV headers
			const headers = [
				'Project ID',
				'Project Title',
				'Supervisor',
				'Moderator',
				'Student ID',
				'Student Name',
				'Matric Number',
				'Final Grade',
				'Letter Grade',
			];

			// Create CSV content
			let csvContent = headers.join(',') + '\n';

			// Add data rows
			allProjectGrades.forEach((project) => {
				project.students.forEach((student) => {
					const row = [
						project.projectId,
						`"${project.title.replace(/"/g, '""')}"`,
						`"${(project.supervisorName || 'Not assigned').replace(/"/g, '""')}"`,
						`"${(project.moderatorName || 'Not assigned').replace(/"/g, '""')}"`,
						student.studentId,
						`"${(student.name || 'Unknown').replace(/"/g, '""')}"`,
						student.matricNumber,
						student.finalGrade !== undefined && student.finalGrade !== null
							? Number(student.finalGrade).toFixed(1)
							: 0,
						student.letterGrade && student.letterGrade !== 'F'
							? student.letterGrade
							: 'NO GRADE GIVEN',
					];
					csvContent += row.join(',') + '\n';
				});
			});

			// Create a blob and download link
			const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
			const url = URL.createObjectURL(blob);

			// Create download link and trigger click
			const link = document.createElement('a');
			const semesterText = semesterId ? `_Semester_${semesterId}` : '';
			const academicYearText = academicYear ? `_Academic_Year_${academicYear}` : '';
			const fileName = `Project_Grades${semesterText}${academicYearText}_${new Date().toISOString().split('T')[0]}.csv`;

			link.setAttribute('href', url);
			link.setAttribute('download', fileName);
			link.style.visibility = 'hidden';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			toast({
				title: 'Export successful',
				description: `Exported project grades to ${fileName}`,
			});
		} catch (error) {
			console.error('Error exporting to CSV:', error);
			toast({
				title: 'Export failed',
				description: 'Failed to export data. Please try again.',
				variant: 'destructive',
			});
		}
	};

	// Show loading state
	if (isGradesLoading) {
		return (
			<div className="flex justify-center items-center min-h-[60vh]">
				<div className="flex flex-col items-center gap-2">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<p>Loading project grades...</p>
				</div>
			</div>
		);
	}

	// Show error state
	if (error) {
		return (
			<Alert variant="destructive">
				<AlertTitle>Error</AlertTitle>
				<AlertDescription>
					Failed to load project grades. Please try again later.
				</AlertDescription>
			</Alert>
		);
	}

	// Show empty state
	if (!allProjectGrades || allProjectGrades.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>No Project Grades</CardTitle>
				</CardHeader>
				<CardContent>
					<p>There are no project grades available for the selected semester.</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-4">
			<h2 className="text-xl font-semibold mb-2">All Project Grades</h2>
			<div className="flex items-center gap-2">
				<div className="relative flex-1">
					<SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
					<Input
						placeholder="Search by project, supervisor, moderator or student..."
						className="pl-8 w-full h-10"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
				<Button
					onClick={exportToExcel}
					className="flex items-center gap-2 whitespace-nowrap h-10"
				>
					<DownloadIcon className="h-4 w-4" />
					Export to CSV
				</Button>
			</div>

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[300px]">
								<Button
									variant="ghost"
									onClick={() => toggleSort('title')}
									className="p-0 h-auto hover:bg-transparent"
								>
									Project
									<ArrowUpDown className="ml-2 h-4 w-4" />
								</Button>
							</TableHead>
							<TableHead>
								<Button
									variant="ghost"
									onClick={() => toggleSort('supervisor')}
									className="p-0 h-auto hover:bg-transparent"
								>
									Supervisor
									<ArrowUpDown className="ml-2 h-4 w-4" />
								</Button>
							</TableHead>
							<TableHead>
								<Button
									variant="ghost"
									onClick={() => toggleSort('moderator')}
									className="p-0 h-auto hover:bg-transparent"
								>
									Moderator
									<ArrowUpDown className="ml-2 h-4 w-4" />
								</Button>
							</TableHead>
							<TableHead className="text-center">
								<Button
									variant="ghost"
									onClick={() => toggleSort('studentsCount')}
									className="p-0 h-auto hover:bg-transparent flex items-center justify-center w-full"
								>
									Students
									<ArrowUpDown className="ml-2 h-4 w-4" />
								</Button>
							</TableHead>
							<TableHead className="text-center">Avg. Grade</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isGradesLoading ? (
							<TableRow>
								<TableCell colSpan={6} className="h-24 text-center">
									<div className="flex justify-center items-center">
										<Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
										<span>Loading project grades...</span>
									</div>
								</TableCell>
							</TableRow>
						) : paginatedProjects.length === 0 ? (
							<TableRow>
								<TableCell colSpan={6} className="h-24 text-center">
									{searchTerm ? (
										<span>No projects match your search criteria.</span>
									) : (
										<span>No project grades available for this semester.</span>
									)}
								</TableCell>
							</TableRow>
						) : (
							paginatedProjects.map((project) => {
								const isExpanded = expandedProjects[project.projectId];
								const validGrades = project.students.filter(
									(student) =>
										student.finalGrade !== undefined &&
										student.finalGrade !== null
								);

								const avgGrade =
									validGrades.length > 0
										? validGrades.reduce(
												(sum, student) => sum + Number(student.finalGrade),
												0
											) / validGrades.length
										: 0;

								return (
									<React.Fragment key={project.projectId}>
										<TableRow>
											<TableCell className="font-medium">
												{project.title}
											</TableCell>
											<TableCell>
												{project.supervisorName || 'Not assigned'}
											</TableCell>
											<TableCell>
												{project.moderatorName || 'Not assigned'}
											</TableCell>
											<TableCell className="text-center">
												{project.students.length}
											</TableCell>
											<TableCell className="text-center">
												{validGrades.length > 0
													? avgGrade.toFixed(1)
													: 'N/A'}
											</TableCell>
											<TableCell className="text-right">
												<Button
													variant="ghost"
													onClick={() =>
														toggleProjectExpansion(project.projectId)
													}
												>
													{isExpanded ? 'Hide Details' : 'Show Details'}
												</Button>
											</TableCell>
										</TableRow>

										{/* Expanded student details */}
										{isExpanded && (
											<TableRow>
												<TableCell colSpan={6} className="p-0">
													<div className="p-4 bg-muted/30">
														<Table>
															<TableHeader>
																<TableRow>
																	<TableHead>
																		Matric Number
																	</TableHead>
																	<TableHead>
																		Student Name
																	</TableHead>

																	<TableHead className="text-center">
																		Final Grade
																	</TableHead>
																	<TableHead className="text-center">
																		Letter Grade
																	</TableHead>
																</TableRow>
															</TableHeader>
															<TableBody>
																{project.students.map((student) => (
																	<TableRow
																		key={student.studentId}
																	>
																		<TableCell>
																			{student.matricNumber}
																		</TableCell>
																		<TableCell>
																			{student.name ||
																				'Unknown'}
																		</TableCell>

																		<TableCell className="text-center">
																			{student.finalGrade !==
																				undefined &&
																			student.finalGrade !==
																				null
																				? Number(
																						student.finalGrade
																					).toFixed(1)
																				: 'N/A'}
																		</TableCell>
																		<TableCell className="text-center">
																			{student.letterGrade &&
																			student.letterGrade !==
																				'F'
																				? student.letterGrade
																				: 'NO GRADE GIVEN'}
																		</TableCell>
																	</TableRow>
																))}
															</TableBody>
														</Table>
													</div>
												</TableCell>
											</TableRow>
										)}
									</React.Fragment>
								);
							})
						)}
					</TableBody>
				</Table>

				{/* Pagination */}
				{totalPages > 1 && (
					<div className="flex justify-center mt-4">
						<Pagination>
							<PaginationContent>
								<PaginationItem>
									<PaginationPrevious
										onClick={() =>
											handlePageChange(Math.max(1, currentPage - 1))
										}
										className={
											currentPage === 1
												? 'pointer-events-none opacity-50'
												: 'cursor-pointer'
										}
									/>
								</PaginationItem>

								{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
									// Show first page, last page, current page, and pages around current
									let pageToShow: number | null = null;

									if (totalPages <= 5) {
										// If 5 or fewer pages, show all
										pageToShow = i + 1;
									} else if (i === 0) {
										// First button is always page 1
										pageToShow = 1;
									} else if (i === 4) {
										// Last button is always the last page
										pageToShow = totalPages;
									} else if (currentPage <= 2) {
										// Near the start
										pageToShow = i + 1;
									} else if (currentPage >= totalPages - 1) {
										// Near the end
										pageToShow = totalPages - 4 + i;
									} else {
										// In the middle
										pageToShow = currentPage - 1 + i;
									}

									// Show ellipsis instead of page numbers in certain cases
									if (totalPages > 5) {
										if (
											(i === 1 && currentPage > 3) ||
											(i === 3 && currentPage < totalPages - 2)
										) {
											return (
												<PaginationItem key={`ellipsis-${i}`}>
													<PaginationEllipsis />
												</PaginationItem>
											);
										}
									}

									if (pageToShow !== null) {
										return (
											<PaginationItem key={pageToShow}>
												<PaginationLink
													onClick={() => handlePageChange(pageToShow!)}
													isActive={currentPage === pageToShow}
												>
													{pageToShow}
												</PaginationLink>
											</PaginationItem>
										);
									}

									return null;
								})}

								<PaginationItem>
									<PaginationNext
										onClick={() =>
											handlePageChange(Math.min(totalPages, currentPage + 1))
										}
										className={
											currentPage === totalPages
												? 'pointer-events-none opacity-50'
												: 'cursor-pointer'
										}
									/>
								</PaginationItem>
							</PaginationContent>
						</Pagination>
					</div>
				)}
			</div>
		</div>
	);
}

'use client';

import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

// Define local interfaces to avoid type conflicts
interface StudentGrade {
	studentId: string | number;
	name?: string;
	matricNumber?: string;
	finalGrade?: number;
	letterGrade?: string;
	supervisorGrade?: number;
	moderatorGrade?: number;
}

interface ProjectGradeResponse {
	projectId: string | number;
	title: string;
	supervisorName?: string;
	moderatorName?: string;
	students: StudentGrade[];
}

interface ProjectsTableProps {
	projects: ProjectGradeResponse[];
	showAllData?: boolean;
}

export default function ProjectsTable({ projects, showAllData = false }: ProjectsTableProps) {
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	// Function to render letter grade with appropriate color
	const renderLetterGrade = (grade: string) => {
		let badgeClass = '';

		if (grade === 'A+' || grade === 'A' || grade === 'A-') {
			badgeClass = 'bg-green-500 hover:bg-green-600';
		} else if (grade === 'B+' || grade === 'B' || grade === 'B-') {
			badgeClass = 'bg-blue-500 hover:bg-blue-600';
		} else if (grade === 'C+' || grade === 'C' || grade === 'C-') {
			badgeClass = '';
		} else if (grade === 'D+' || grade === 'D') {
			badgeClass = 'bg-orange-500 hover:bg-orange-600';
		} else if (grade === 'F') {
			badgeClass = 'bg-red-500 hover:bg-red-600';
		}

		return <Badge className={badgeClass}>{grade}</Badge>;
	};

	// Filter projects based on search term
	const filteredProjects = projects.filter((project) => {
		const searchLower = searchTerm.toLowerCase();

		// Search in project title
		if (project.title.toLowerCase().includes(searchLower)) {
			return true;
		}

		// Search in supervisor/moderator names
		if (
			project.supervisorName?.toLowerCase().includes(searchLower) ||
			project.moderatorName?.toLowerCase().includes(searchLower)
		) {
			return true;
		}

		// Search in student data
		return (
			project.students?.some(
				(student) =>
					student.name?.toLowerCase().includes(searchLower) ||
					student.matricNumber?.toLowerCase().includes(searchLower)
			) || false
		);
	});

	// Calculate project statistics
	const getProjectStats = (project: ProjectGradeResponse) => {
		const validGrades =
			(project.students
				?.map((student) => student.finalGrade)
				.filter((grade) => grade !== undefined && grade !== null) as number[]) || [];

		if (!validGrades.length) {
			return { avg: 'N/A', max: 'N/A', min: 'N/A', passingRate: 'N/A' };
		}

		const avg = validGrades.reduce((sum, grade) => sum + grade, 0) / validGrades.length;
		const max = Math.max(...validGrades);
		const min = Math.min(...validGrades);
		const passingCount = validGrades.filter((grade) => grade >= 40).length;
		const passingRate = (passingCount / validGrades.length) * 100;

		return {
			avg: avg.toFixed(2),
			max: max.toString(),
			min: min.toString(),
			passingRate: `${passingRate.toFixed(1)}%`,
		};
	};

	// Pagination logic
	const totalPages = Math.ceil(filteredProjects.length / pageSize);
	const startIndex = (currentPage - 1) * pageSize;
	const endIndex = startIndex + pageSize;
	const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

	const handlePreviousPage = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
		}
	};

	const handleNextPage = () => {
		if (currentPage < totalPages) {
			setCurrentPage(currentPage + 1);
		}
	};

	const handlePageSizeChange = (value: string) => {
		setPageSize(parseInt(value));
		setCurrentPage(1); // Reset to first page when changing page size
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center space-x-2">
				<div className="relative flex-1">
					<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search projects, supervisors, or students..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-8"
					/>
				</div>
			</div>

			<Card>
				<CardContent className="p-0">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Project Title</TableHead>
								<TableHead>Supervisor</TableHead>
								<TableHead>Moderator</TableHead>
								<TableHead>Students</TableHead>
								<TableHead>Stats</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{paginatedProjects.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={5}
										className="text-center py-8 text-muted-foreground"
									>
										No projects found matching your search criteria.
									</TableCell>
								</TableRow>
							) : (
								paginatedProjects.map((project) => {
									const stats = getProjectStats(project);

									return (
										<TableRow key={project.projectId}>
											<TableCell className="font-medium">
												{project.title}
											</TableCell>
											<TableCell>
												{project.supervisorName || 'Not assigned'}
											</TableCell>
											<TableCell>
												{project.moderatorName || 'Not assigned'}
											</TableCell>
											<TableCell>
												<div className="space-y-2">
													{project.students?.map((student) => (
														<div
															key={student.studentId}
															className="flex items-center justify-between"
														>
															<div className="text-sm">
																{student.name} (
																{student.matricNumber})
															</div>
															<div className="flex items-center space-x-2">
																{showAllData && (
																	<>
																		<span className="text-xs text-muted-foreground">
																			S:{' '}
																			{student.supervisorGrade ||
																				'N/A'}
																		</span>
																		<span className="text-xs text-muted-foreground">
																			M:{' '}
																			{student.moderatorGrade ||
																				'N/A'}
																		</span>
																	</>
																)}
																<span className="font-medium">
																	{student.finalGrade || 'N/A'}
																</span>
																{renderLetterGrade(
																	student.letterGrade || 'N/A'
																)}
															</div>
														</div>
													))}
												</div>
											</TableCell>
											<TableCell>
												<div className="space-y-1 text-sm">
													<div>
														Avg:{' '}
														<span className="font-medium">
															{stats.avg}
														</span>
													</div>
													<div>
														Max:{' '}
														<span className="font-medium">
															{stats.max}
														</span>
													</div>
													<div>
														Min:{' '}
														<span className="font-medium">
															{stats.min}
														</span>
													</div>
													<div>
														Pass:{' '}
														<span className="font-medium">
															{stats.passingRate}
														</span>
													</div>
												</div>
											</TableCell>
										</TableRow>
									);
								})
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			{/* Pagination controls */}
			<div className="flex items-center justify-between">
				<div className="text-sm text-muted-foreground">
					Showing {filteredProjects.length > 0 ? startIndex + 1 : 0} to{' '}
					{Math.min(endIndex, filteredProjects.length)} of {filteredProjects.length}{' '}
					projects
				</div>

				<div className="flex items-center space-x-2">
					<div className="flex items-center space-x-2">
						<span className="text-sm text-muted-foreground">Rows per page:</span>
						<Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
							<SelectTrigger className="w-[70px]">
								<SelectValue placeholder={pageSize.toString()} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="5">5</SelectItem>
								<SelectItem value="10">10</SelectItem>
								<SelectItem value="20">20</SelectItem>
								<SelectItem value="50">50</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="flex items-center space-x-2">
						<Button
							variant="outline"
							size="icon"
							onClick={handlePreviousPage}
							disabled={currentPage === 1}
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<span className="text-sm">
							Page {currentPage} of {totalPages || 1}
						</span>
						<Button
							variant="outline"
							size="icon"
							onClick={handleNextPage}
							disabled={currentPage === totalPages || totalPages === 0}
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

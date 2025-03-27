'use client';

import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useState } from 'react';

import { ProjectGradeResponse } from '@/types/grade';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface ProjectsTableProps {
	projects: ProjectGradeResponse[];
	showAllData?: boolean;
}

export default function ProjectsTable({ projects, showAllData = false }: ProjectsTableProps) {
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(5);

	// Function to render letter grade with appropriate color
	const renderLetterGrade = (grade: string) => {
		let variant:
			| 'default'
			| 'destructive'
			| 'outline'
			| 'secondary'
			| 'outlineSuccess'
			| 'outlinePending'
			| 'outlineFail' = 'outline';

		if (grade === 'A+' || grade === 'A' || grade === 'A-') {
			variant = 'outlineSuccess';
		} else if (grade === 'B+' || grade === 'B' || grade === 'B-') {
			variant = 'secondary';
		} else if (grade === 'C+' || grade === 'C' || grade === 'C-') {
			variant = 'default';
		} else if (grade === 'D+' || grade === 'D') {
			variant = 'outline';
		} else if (grade === 'F') {
			variant = 'outlineFail';
		}

		return <Badge variant={variant}>{grade}</Badge>;
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
		return project.students.some(
			(student) =>
				student.name?.toLowerCase().includes(searchLower) ||
				student.matricNumber?.toLowerCase().includes(searchLower)
		);
	});

	// Calculate project statistics
	const getProjectStats = (project: ProjectGradeResponse) => {
		const students = project.students || [];
		if (!students.length) return { avg: 0, max: 0, min: 0, passing: 0 };

		const validGrades = students
			.map((s) => s.finalGrade || 0)
			.filter((grade) => grade !== undefined && grade !== null);

		if (!validGrades.length) return { avg: 0, max: 0, min: 0, passing: 0 };

		const sum = validGrades.reduce((acc, grade) => acc + grade, 0);
		const avg = sum / validGrades.length;
		const max = Math.max(...validGrades);
		const min = Math.min(...validGrades);
		const passing = validGrades.filter((grade) => grade >= 40).length;

		return {
			avg: avg.toFixed(2),
			max,
			min,
			passing: `${passing}/${validGrades.length} (${((passing / validGrades.length) * 100).toFixed(0)}%)`,
		};
	};

	// Paginate filtered projects
	const paginatedProjects = filteredProjects.slice(
		(currentPage - 1) * pageSize,
		currentPage * pageSize
	);

	return (
		<div className="space-y-4">
			{/* Search input and pagination controls */}
			<div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
				<div className="relative w-full sm:w-auto flex-1">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						type="text"
						placeholder="Search projects, supervisors, or students..."
						className="pl-8 w-full"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>

				<div className="flex items-center gap-2">
					<span className="text-sm text-muted-foreground whitespace-nowrap">
						Projects per page:
					</span>
					<Select
						value={pageSize.toString()}
						onValueChange={(value) => {
							setPageSize(Number(value));
							setCurrentPage(1); // Reset to first page when changing page size
						}}
					>
						<SelectTrigger className="w-[100px]">
							<SelectValue placeholder={`${pageSize}`} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="5">5</SelectItem>
							<SelectItem value="10">10</SelectItem>
							<SelectItem value="20">20</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Projects list */}
			<div className="space-y-6">
				{paginatedProjects.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground">
						No projects found matching your search criteria.
					</div>
				) : (
					paginatedProjects.map((project) => {
						const stats = getProjectStats(project);

						return (
							<Card key={project.projectId} className="overflow-hidden">
								<CardHeader className="bg-muted/50">
									<div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
										<CardTitle className="text-lg">{project.title}</CardTitle>
										<div className="flex flex-wrap gap-2 text-sm">
											<Badge variant="outline" className="font-normal">
												Avg: {stats.avg}
											</Badge>
											<Badge variant="outline" className="font-normal">
												Max: {stats.max}
											</Badge>
											<Badge variant="outline" className="font-normal">
												Min: {stats.min}
											</Badge>
											<Badge variant="outline" className="font-normal">
												Passing: {stats.passing}
											</Badge>
										</div>
									</div>
									<div className="text-sm text-muted-foreground grid grid-cols-1 md:grid-cols-2 gap-1">
										<div>
											Supervisor: {project.supervisorName || 'Not assigned'}
										</div>
										<div>
											Moderator: {project.moderatorName || 'Not assigned'}
										</div>
									</div>
								</CardHeader>
								<CardContent className="p-0">
									<div className="overflow-x-auto">
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead>Student Name</TableHead>
													<TableHead>Matric Number</TableHead>
													{showAllData && (
														<TableHead>Supervisor Grade</TableHead>
													)}
													{showAllData && (
														<TableHead>Moderator Grade</TableHead>
													)}
													<TableHead>Final Grade</TableHead>
													<TableHead>Letter Grade</TableHead>
													{showAllData && (
														<TableHead>
															Grade Difference
															<span className="block text-xs font-normal text-muted-foreground">
																(Supervisor - Moderator)
															</span>
														</TableHead>
													)}
												</TableRow>
											</TableHeader>
											<TableBody>
												{project.students.map((student) => {
													const gradeDiff = showAllData
														? (student.supervisorGrade || 0) -
															(student.moderatorGrade || 0)
														: 0;

													return (
														<TableRow key={student.studentId}>
															<TableCell className="font-medium">
																{student.name || (
																	<span className="text-muted-foreground italic">
																		No name
																	</span>
																)}
															</TableCell>
															<TableCell>
																{student.matricNumber}
															</TableCell>
															{showAllData && (
																<TableCell>
																	{student.supervisorGrade || 0}
																</TableCell>
															)}
															{showAllData && (
																<TableCell>
																	{student.moderatorGrade || 0}
																</TableCell>
															)}
															<TableCell className="font-semibold">
																{student.finalGrade || 0}
															</TableCell>
															<TableCell>
																{renderLetterGrade(
																	student.letterGrade || 'N/A'
																)}
															</TableCell>
															{showAllData && (
																<TableCell>
																	<span
																		className={
																			gradeDiff > 10
																				? 'text-red-500'
																				: gradeDiff < -10
																					? 'text-blue-500'
																					: 'text-muted-foreground'
																		}
																	>
																		{gradeDiff > 0 ? '+' : ''}
																		{gradeDiff.toFixed(1)}
																	</span>
																</TableCell>
															)}
														</TableRow>
													);
												})}
											</TableBody>
										</Table>
									</div>
								</CardContent>
							</Card>
						);
					})
				)}
			</div>

			{/* Pagination navigation controls */}
			<div className="flex justify-between items-center py-4">
				<Button
					onClick={() => setCurrentPage(currentPage - 1)}
					disabled={currentPage === 1}
					variant="outline"
					size="sm"
				>
					<ChevronLeft className="h-4 w-4" />
				</Button>
				<div className="text-sm text-muted-foreground">
					Page {currentPage} of {Math.ceil(filteredProjects.length / pageSize)}
				</div>
				<Button
					onClick={() => setCurrentPage(currentPage + 1)}
					disabled={currentPage * pageSize >= filteredProjects.length}
					variant="outline"
					size="sm"
				>
					<ChevronRight className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}

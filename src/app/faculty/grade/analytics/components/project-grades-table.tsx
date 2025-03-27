'use client';

import { ChevronDown, ChevronUp, User, Users } from 'lucide-react';
import { useState } from 'react';

import { ProjectGradeResponse } from '@/types/grade';

import { Badge } from '@/components/ui/badge';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

interface ProjectGradesTableProps {
	projects: ProjectGradeResponse[];
	role: 'supervisor' | 'moderator';
}

export default function ProjectGradesTable({ projects, role }: ProjectGradesTableProps) {
	const [expandedProjects, setExpandedProjects] = useState<Record<number, boolean>>({});

	const toggleProject = (projectId: number) => {
		setExpandedProjects((prev) => ({
			...prev,
			[projectId]: !prev[projectId],
		}));
	};

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

	return (
		<div className="space-y-4">
			{projects.map((project) => (
				<div key={project.projectId} className="border rounded-lg overflow-hidden">
					<div
						className="bg-muted/50 p-4 flex justify-between items-center cursor-pointer"
						onClick={() => toggleProject(project.projectId!)}
					>
						<div>
							<h3 className="font-medium text-lg">{project.title}</h3>
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								{role === 'supervisor' ? (
									<span className="flex items-center gap-1">
										<Users className="h-4 w-4" /> Moderator:{' '}
										{project.moderatorName}
									</span>
								) : (
									<span className="flex items-center gap-1">
										<User className="h-4 w-4" /> Supervisor:{' '}
										{project.supervisorName}
									</span>
								)}
							</div>
						</div>
						<div>
							{expandedProjects[project.projectId!] ? (
								<ChevronUp className="h-5 w-5" />
							) : (
								<ChevronDown className="h-5 w-5" />
							)}
						</div>
					</div>

					{expandedProjects[project.projectId!] && (
						<div className="p-4">
							{project.students && project.students.length > 0 ? (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Student Name</TableHead>
											<TableHead>Matric Number</TableHead>
											{role === 'supervisor' && (
												<TableHead>Supervisor Grade</TableHead>
											)}
											{role === 'moderator' && (
												<TableHead>Moderator Grade</TableHead>
											)}
											<TableHead>Final Grade</TableHead>
											<TableHead>Letter Grade</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{project.students.map((student) => (
											<TableRow key={student.studentId}>
												<TableCell className="font-medium">
													{student.name || (
														<span className="text-muted-foreground italic">
															No name
														</span>
													)}
												</TableCell>
												<TableCell>{student.matricNumber}</TableCell>
												{role === 'supervisor' && (
													<TableCell>{student.supervisorGrade}</TableCell>
												)}
												{role === 'moderator' && (
													<TableCell>{student.moderatorGrade}</TableCell>
												)}
												<TableCell className="font-semibold">
													{student.finalGrade}
												</TableCell>
												<TableCell>
													{renderLetterGrade(
														student.letterGrade || 'N/A'
													)}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							) : (
								<p className="text-muted-foreground italic py-4 text-center">
									No students assigned to this project
								</p>
							)}
						</div>
					)}
				</div>
			))}
		</div>
	);
}

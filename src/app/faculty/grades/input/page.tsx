'use client';

import React from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
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

export default function GradeEntryPage() {
	const { handleSubmit, setValue } = useForm();

	const onSubmit = (data) => {
		console.log('Submitted Grades:', data);
		alert('Grades have been submitted successfully!');
	};

	const students = [
		{
			matriculationNumber: 'U2100001',
			name: 'John Doe',
			proposalTitle: 'AI-Based Recommendation System',
		},
		{
			matriculationNumber: 'U2100002',
			name: 'Jane Smith',
			proposalTitle: 'Blockchain for Supply Chain',
		},
		{
			matriculationNumber: 'U2100003',
			name: 'Alan Turing',
			proposalTitle: 'Optimization Algorithms',
		},
	];

	return (
		<div className="container mx-auto p-6">
			<h1 className="text-2xl font-bold text-center mb-6">Professor Grade Entry Page</h1>

			<form onSubmit={handleSubmit(onSubmit)}>
				<div className="flex items-center gap-4 mb-6">
					<div>
						<label htmlFor="semester" className="block text-sm font-medium">
							Semester:
						</label>
						<Select onValueChange={(value) => setValue('semester', value)}>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select a semester" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="2024-2025-Sem1">2024-2025 Sem 1</SelectItem>
								<SelectItem value="2024-2025-Sem2">2024-2025 Sem 2</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div>
						<label htmlFor="programme" className="block text-sm font-medium">
							Programme ID:
						</label>
						<Select onValueChange={(value) => setValue('programme', value)}>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select a programme" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="P001">P001</SelectItem>
								<SelectItem value="P002">P002</SelectItem>
								<SelectItem value="P003">P003</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Matriculation Number</TableHead>
							<TableHead>Student Name</TableHead>
							<TableHead>Proposal Title</TableHead>
							<TableHead>Grade</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{students.map((student) => (
							<TableRow key={student.matriculationNumber}>
								<TableCell>{student.matriculationNumber}</TableCell>
								<TableCell>{student.name}</TableCell>
								<TableCell>{student.proposalTitle}</TableCell>
								<TableCell>
									<Select
										onValueChange={(value) =>
											setValue(`grade[${student.matriculationNumber}]`, value)
										}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Select a grade" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="A+">A+</SelectItem>
											<SelectItem value="A">A</SelectItem>
											<SelectItem value="A-">A-</SelectItem>
											<SelectItem value="B+">B+</SelectItem>
											<SelectItem value="B">B</SelectItem>
											<SelectItem value="B-">B-</SelectItem>
											<SelectItem value="C+">C+</SelectItem>
											<SelectItem value="C">C</SelectItem>
											<SelectItem value="D-">D+</SelectItem>
											<SelectItem value="D">D</SelectItem>
											<SelectItem value="F">F</SelectItem>
										</SelectContent>
									</Select>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>

				<Button type="submit" className="mt-6 w-full">
					Submit Grades
				</Button>
			</form>
		</div>
	);
}

'use client';

import { FormLabel } from '@/components/ui/form';

// Define interfaces for the component props
interface Student {
	matriculation_number: string;
	name?: string;
	email?: string;
	// Add other specific properties as needed
}

interface Grade {
	score: number;
	feedback?: string;
	created_at?: string;
	updated_at?: string;
	// Add other specific properties as needed
}

interface GradeComponent {
	max_score: number;
	name?: string;
	description?: string;
	// Add other specific properties as needed
}

// This file appears to contain code snippets rather than a complete component
// Here are the snippets organized for reference:

// Snippet 1: Display matric number
export const MatricDisplay = ({ student }: { student: Student }) => (
	<div className="text-sm font-normal text-muted-foreground mt-1">
		Matric: {student.matriculation_number}
	</div>
);

// Snippet 2: Previous grade display
export const PreviousGradeDisplay = ({
	isGraded,
	grade,
	component,
}: {
	isGraded: boolean;
	grade: Grade | null;
	component: GradeComponent;
}) => (
	<>
		{isGraded && (
			<div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
				<h4 className="text-sm font-medium mb-2">Previous Grade</h4>
				<div className="flex items-center">
					<span className="text-lg font-bold">{grade?.score}</span>
					<span className="text-sm text-muted-foreground ml-2">
						/ {component.max_score || 100}
					</span>
				</div>
				{grade?.feedback && (
					<div className="mt-2">
						<h5 className="text-xs font-medium">Comments:</h5>
						<p className="text-xs text-muted-foreground">{grade.feedback}</p>
					</div>
				)}
			</div>
		)}
	</>
);

// Snippet 3: Score label
export const ScoreLabel = ({ component }: { component: GradeComponent }) => (
	<FormLabel>New Score (out of {component.max_score || 100})</FormLabel>
);

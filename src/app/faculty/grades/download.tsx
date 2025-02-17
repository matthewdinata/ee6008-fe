import React from 'react';
import { utils, writeFile } from 'xlsx';

const NTUBellCurveWithDownload = () => {
	// Mock data for NTU system
	const mockGradeData = {
		grades: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'D', 'F'],
		counts: [5, 15, 20, 30, 50, 30, 20, 15, 5, 0], // Empty entry
	};

	const semester = 'YEAR X SEM X'; // Placeholder for semester
	const programmeName = ''; // Placeholder for programme name

	const handleDownload = () => {
		// Prepare data for Excel
		const data = [
			{ SEMESTER: semester, PROGRAMME: programmeName }, // Additional fields
			...mockGradeData.grades.map((grade, index) => ({
				Grade: grade,
				Count: mockGradeData.counts[index],
			})),
		];

		// Create a new workbook and worksheet
		const worksheet = utils.json_to_sheet(data, { skipHeader: true }); // Skipping headers for a cleaner Excel layout
		const workbook = utils.book_new();
		utils.book_append_sheet(workbook, worksheet, 'Grades');

		// Trigger download
		writeFile(workbook, 'Grade_Distribution_NTU.xlsx');
	};

	return (
		<div style={{ width: '80%', margin: '0 auto' }}>
			<h1>NTU Student (With Download)</h1>
			{/* Add your chart component here if necessary */}
			<button
				onClick={handleDownload}
				style={{
					marginTop: '20px',
					padding: '10px 20px',
					backgroundColor: '#4CAF50',
					color: 'white',
					border: 'none',
					borderRadius: '5px',
					cursor: 'pointer',
				}}
			>
				Download as Excel
			</button>
		</div>
	);
};

export default NTUBellCurveWithDownload;

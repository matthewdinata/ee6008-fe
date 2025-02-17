import {
	CategoryScale,
	Chart as ChartJS,
	Legend,
	LineElement,
	LinearScale,
	PointElement,
	Title,
	Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const BellCurveDashboard = () => {
	const mockData = {
		grades: ['F', 'D', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+'],
		counts: [0, 5, 15, 20, 30, 50, 30, 20, 15, 5],
	};

	const data = {
		labels: mockData.grades,
		datasets: [
			{
				label: 'Student Distribution',
				data: mockData.counts,
				borderColor: 'rgba(75, 192, 192, 1)',
				backgroundColor: 'rgba(75, 192, 192, 0.2)',
				fill: true,
				tension: 0.4, // Smooth curve
			},
		],
	};

	const options = {
		responsive: true,
		plugins: {
			legend: {
				position: 'top' as const,
			},
			title: {
				display: true,
				text: 'Grade Distribution',
			},
		},
		scales: {
			x: {
				title: {
					display: true,
					text: 'Grades',
				},
			},
			y: {
				beginAtZero: true,
				title: {
					display: true,
					text: 'Number of Students',
				},
			},
		},
	};

	return (
		<div style={{ width: '80%', margin: '0 auto' }}>
			<h1>Grade Distribution</h1>
			<Line data={data} options={options} />
		</div>
	);
};

export default BellCurveDashboard;

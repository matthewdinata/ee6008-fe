import {
	BarElement,
	CategoryScale,
	Chart as ChartJS,
	Legend,
	LinearScale,
	Title,
	Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BellCurveBarChart = () => {
	const mockData = {
		grades: ['F', 'D', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+'],
		counts: [0, 5, 15, 20, 30, 50, 30, 20, 15, 5],
	};

	const data = {
		labels: mockData.grades,
		datasets: [
			{
				label: 'Number of Students',
				data: mockData.counts,
				backgroundColor: 'rgba(75, 192, 192, 0.6)',
				borderColor: 'rgba(75, 192, 192, 1)',
				borderWidth: 1,
			},
		],
	};

	const options = {
		responsive: true,
		plugins: {
			legend: {
				display: true,
				position: 'top',
			},
			title: {
				display: true,
				text: 'Grade Distribution (with Bar Chart)',
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
			<h1>Grade Bell Curve (Bar Chart)</h1>
			<Bar data={data} options={options} />
		</div>
	);
};

export default BellCurveBarChart;

'use client';

import { useTheme } from 'next-themes';
import {
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';

interface GradeDistributionChartProps {
	data: Record<string, number>;
}

export default function GradeDistributionChart({ data }: GradeDistributionChartProps) {
	const { theme } = useTheme();
	const isDark = theme === 'dark';

	// Transform data for the chart
	const chartData = Object.entries(data).map(([grade, count]) => ({
		grade,
		count,
	}));

	// Sort by grade (A, B, C, D, F)
	const gradeOrder: Record<string, number> = {
		'A+': 0,
		A: 1,
		'A-': 2,
		'B+': 3,
		B: 4,
		'B-': 5,
		'C+': 6,
		C: 7,
		'D+': 8,
		D: 9,
		F: 10,
	};

	chartData.sort((a, b) => {
		const orderA = gradeOrder[a.grade] !== undefined ? gradeOrder[a.grade] : 999;
		const orderB = gradeOrder[b.grade] !== undefined ? gradeOrder[b.grade] : 999;
		return orderA - orderB;
	});

	// Colors based on theme
	const textColor = isDark ? '#f8fafc' : '#0f172a';
	const gridColor = isDark ? '#334155' : '#e2e8f0';
	const barColor = isDark ? '#3b82f6' : '#2563eb';

	return (
		<ResponsiveContainer width="100%" height="100%">
			<BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
				<CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
				<XAxis
					dataKey="grade"
					tick={{ fill: textColor }}
					tickLine={{ stroke: textColor }}
				/>
				<YAxis
					tick={{ fill: textColor }}
					tickLine={{ stroke: textColor }}
					allowDecimals={false}
				/>
				<Tooltip
					contentStyle={{
						backgroundColor: isDark ? '#1e293b' : '#ffffff',
						color: textColor,
						border: `1px solid ${gridColor}`,
					}}
					labelStyle={{ color: textColor }}
				/>
				<Legend wrapperStyle={{ color: textColor }} />
				<Bar
					dataKey="count"
					name="Number of Students"
					fill={barColor}
					radius={[4, 4, 0, 0]}
				/>
			</BarChart>
		</ResponsiveContainer>
	);
}

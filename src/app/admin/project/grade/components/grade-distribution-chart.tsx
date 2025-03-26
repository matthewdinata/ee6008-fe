'use client';

import { useMemo } from 'react';
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';

import { Card } from '@/components/ui/card';

interface GradeDistributionChartProps {
	distribution: Record<string, number>;
}

// Define grade colors
const GRADE_COLORS: Record<string, string> = {
	'A+': '#4CAF50',
	A: '#66BB6A',
	'A-': '#81C784',
	'B+': '#7CB342',
	B: '#9CCC65',
	'B-': '#AED581',
	'C+': '#FFB74D',
	C: '#FFA726',
	'C-': '#FF9800',
	'D+': '#FF7043',
	D: '#FF5722',
	F: '#F44336',
	'N/A': '#9E9E9E',
};

// Grade order for display
const GRADE_ORDER = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F', 'N/A'];

export default function GradeDistributionChart({ distribution }: GradeDistributionChartProps) {
	// Format data for the chart
	const chartData = useMemo(() => {
		const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);

		return GRADE_ORDER.filter((grade) => distribution[grade] !== undefined).map((grade) => ({
			grade,
			count: distribution[grade] || 0,
			percentage: total > 0 ? (((distribution[grade] || 0) / total) * 100).toFixed(1) : '0',
		}));
	}, [distribution]);

	// Custom tooltip
	const CustomTooltip = ({
		active,
		payload,
		label,
	}: {
		active?: boolean;
		payload?: Array<{
			value: number;
			payload: {
				percentage: string; // Changed to string to match the type of percentage in chartData
			};
		}>;
		label?: string;
	}) => {
		if (active && payload && payload.length) {
			const grade = label;
			const count = payload[0].value;
			const percentage = payload[0].payload.percentage;

			return (
				<Card className="p-3 bg-background border shadow-md">
					<p className="font-medium">{`Grade: ${grade}`}</p>
					<p className="text-sm text-muted-foreground">{`Count: ${count}`}</p>
					<p className="text-sm text-muted-foreground">{`Percentage: ${percentage}%`}</p>
				</Card>
			);
		}
		return null;
	};

	return (
		<ResponsiveContainer width="100%" height="100%">
			<BarChart
				data={chartData}
				margin={{
					top: 20,
					right: 30,
					left: 20,
					bottom: 60,
				}}
			>
				<CartesianGrid strokeDasharray="3 3" opacity={0.2} />
				<XAxis
					dataKey="grade"
					tick={{ fontSize: 12 }}
					label={{
						value: 'Letter Grade',
						position: 'insideBottom',
						offset: -15,
						fontSize: 14,
					}}
				/>
				<YAxis
					label={{
						value: 'Student Count',
						angle: -90,
						position: 'insideLeft',
						style: { textAnchor: 'middle' },
						fontSize: 14,
					}}
				/>
				<Tooltip content={<CustomTooltip />} />
				<Bar dataKey="count" radius={[4, 4, 0, 0]}>
					{chartData.map((entry, index) => (
						<Cell key={`cell-${index}`} fill={GRADE_COLORS[entry.grade] || '#9E9E9E'} />
					))}
				</Bar>
			</BarChart>
		</ResponsiveContainer>
	);
}

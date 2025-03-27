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

interface ProjectData {
	projectId: string | number;
	title: string;
	averageGrade: number;
	studentCount: number;
}

interface ProjectComparisonChartProps {
	data: ProjectData[];
}

export default function ProjectComparisonChart({ data }: ProjectComparisonChartProps) {
	// Format and sort data for the chart
	const chartData = useMemo(() => {
		return [...data]
			.sort((a, b) => b.averageGrade - a.averageGrade)
			.map((project) => ({
				...project,
				shortTitle:
					project.title.length > 30
						? `${project.title.substring(0, 27)}...`
						: project.title,
			}));
	}, [data]);

	// Define colors based on grade ranges
	const getBarColor = (grade: number) => {
		if (grade >= 85) return '#4CAF50'; // A range - Green
		if (grade >= 70) return '#8BC34A'; // B range - Light Green
		if (grade >= 55) return '#FFC107'; // C range - Yellow
		if (grade >= 40) return '#FF9800'; // D range - Orange
		return '#F44336'; // F - Red
	};

	// Custom tooltip
	const CustomTooltip = ({
		active,
		payload,
		_label,
	}: {
		active?: boolean;
		payload?: Array<{
			payload: {
				title: string;
				averageGrade: number;
				studentCount: number;
			};
		}>;
		_label?: string;
	}) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload;

			return (
				<Card className="p-3 bg-background border shadow-md">
					<p className="font-medium">{data.title}</p>
					<p className="text-sm text-muted-foreground">{`Average Grade: ${data.averageGrade}`}</p>
					<p className="text-sm text-muted-foreground">{`Students: ${data.studentCount}`}</p>
				</Card>
			);
		}
		return null;
	};

	return (
		<ResponsiveContainer width="100%" height="100%">
			<BarChart
				data={chartData}
				layout="vertical"
				margin={{
					top: 20,
					right: 30,
					left: 150, // Extra space for project titles
					bottom: 20,
				}}
			>
				<CartesianGrid
					strokeDasharray="3 3"
					opacity={0.2}
					horizontal={true}
					vertical={false}
				/>
				<XAxis
					type="number"
					domain={[0, 100]}
					label={{
						value: 'Average Grade',
						position: 'insideBottom',
						offset: -10,
						fontSize: 14,
					}}
				/>
				<YAxis type="category" dataKey="shortTitle" tick={{ fontSize: 12 }} width={150} />
				<Tooltip content={<CustomTooltip />} />
				<Bar dataKey="averageGrade" radius={[0, 4, 4, 0]}>
					{chartData.map((entry, index) => (
						<Cell key={`cell-${index}`} fill={getBarColor(entry.averageGrade)} />
					))}
				</Bar>
			</BarChart>
		</ResponsiveContainer>
	);
}

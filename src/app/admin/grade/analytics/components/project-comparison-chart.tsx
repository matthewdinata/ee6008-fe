'use client';

import { useMemo } from 'react';
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	LabelList,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';

import { Card } from '@/components/ui/card';

interface ProjectData {
	projectId: number;
	title: string;
	averageGrade: number;
	studentCount: number;
}

interface ProjectComparisonChartProps {
	data: (ProjectData | null)[];
}

export default function ProjectComparisonChart({ data }: ProjectComparisonChartProps) {
	// Format data for the chart
	const chartData = useMemo(() => {
		return data
			.filter((project): project is ProjectData => project !== null)
			.map((project) => ({
				name:
					project.title.length > 20
						? project.title.substring(0, 20) + '...'
						: project.title,
				fullTitle: project.title,
				averageGrade: project.averageGrade,
				studentCount: project.studentCount,
				// Color based on grade
				color: getColorForGrade(project.averageGrade),
			}))
			.sort((a, b) => b.averageGrade - a.averageGrade);
	}, [data]);

	// Get color based on grade value
	function getColorForGrade(grade: number): string {
		if (grade >= 85) return '#4ade80'; // green for excellent
		if (grade >= 70) return '#60a5fa'; // blue for good
		if (grade >= 55) return '#facc15'; // yellow for average
		if (grade >= 40) return '#fb923c'; // orange for poor
		return '#f87171'; // red for failing
	}

	// Custom tooltip
	const CustomTooltip = ({
		active,
		payload,
		_label,
	}: {
		active?: boolean;
		payload?: Array<{
			payload: {
				fullTitle: string;
				averageGrade: number;
				studentCount: number;
			};
		}>;
		_label?: string;
	}) => {
		if (active && payload && payload.length) {
			const project = payload[0].payload;

			return (
				<Card className="p-3 bg-background border shadow-md">
					<p className="font-medium">{project.fullTitle}</p>
					<p className="text-sm text-muted-foreground">{`Average Grade: ${project.averageGrade}`}</p>
					<p className="text-sm text-muted-foreground">{`Number of Students: ${project.studentCount}`}</p>
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
					right: 50,
					left: 150,
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
						position: 'insideBottom',
						offset: -10,
						fontSize: 14,
					}}
				/>
				<YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 12 }} />
				<Tooltip content={<CustomTooltip />} />
				<Legend />
				<Bar dataKey="averageGrade" name="Average Grade" radius={[0, 4, 4, 0]}>
					{chartData.map((entry, index) => (
						<Cell key={`cell-${index}`} fill={entry.color} />
					))}
					<LabelList
						dataKey="averageGrade"
						position="right"
						formatter={(value: number) => value.toFixed(1)}
					/>
				</Bar>
			</BarChart>
		</ResponsiveContainer>
	);
}

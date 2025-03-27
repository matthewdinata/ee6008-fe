'use client';

import {
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';

import { Card } from '@/components/ui/card';

interface GradeData {
	semester: string;
	averageGrade: number;
	passingRate: number;
}

interface GradeProgressionChartProps {
	data: GradeData[];
}

export default function GradeProgressionChart({ data }: GradeProgressionChartProps) {
	// Custom tooltip
	const CustomTooltip = ({
		active,
		payload,
		label,
	}: {
		active?: boolean;
		payload?: Array<{
			value: number;
		}>;
		label?: string;
	}) => {
		if (active && payload && payload.length) {
			return (
				<Card className="p-3 bg-background border shadow-md">
					<p className="font-medium">{`Semester: ${label}`}</p>
					<p className="text-sm text-muted-foreground">{`Average Grade: ${payload[0].value.toFixed(2)}`}</p>
					<p className="text-sm text-muted-foreground">{`Passing Rate: ${payload[1].value.toFixed(2)}%`}</p>
				</Card>
			);
		}
		return null;
	};

	return (
		<ResponsiveContainer width="100%" height="100%">
			<LineChart
				data={data}
				margin={{
					top: 20,
					right: 30,
					left: 20,
					bottom: 30,
				}}
			>
				<CartesianGrid strokeDasharray="3 3" opacity={0.2} />
				<XAxis
					dataKey="semester"
					label={{
						value: 'Semester',
						position: 'insideBottom',
						offset: -10,
						fontSize: 14,
					}}
				/>
				<YAxis
					yAxisId="left"
					domain={[0, 100]}
					label={{
						value: 'Average Grade',
						angle: -90,
						position: 'insideLeft',
						style: { textAnchor: 'middle' },
						fontSize: 14,
					}}
				/>
				<YAxis
					yAxisId="right"
					orientation="right"
					domain={[0, 100]}
					label={{
						value: 'Passing Rate (%)',
						angle: 90,
						position: 'insideRight',
						style: { textAnchor: 'middle' },
						fontSize: 14,
					}}
				/>
				<Tooltip content={<CustomTooltip />} />
				<Legend />

				{/* Reference line for passing grade */}
				<ReferenceLine
					yAxisId="left"
					y={40}
					label={{
						value: 'Passing Grade (40)',
						position: 'insideBottomRight',
						fontSize: 12,
					}}
					stroke="#94a3b8"
					strokeDasharray="3 3"
				/>

				<Line
					yAxisId="left"
					type="monotone"
					dataKey="averageGrade"
					name="Average Grade"
					stroke="#3b82f6"
					strokeWidth={2}
					dot={{ r: 6 }}
					activeDot={{ r: 8 }}
				/>
				<Line
					yAxisId="right"
					type="monotone"
					dataKey="passingRate"
					name="Passing Rate (%)"
					stroke="#10b981"
					strokeWidth={2}
					dot={{ r: 6 }}
					activeDot={{ r: 8 }}
				/>
			</LineChart>
		</ResponsiveContainer>
	);
}

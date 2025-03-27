'use client';

import { useMemo } from 'react';
import {
	CartesianGrid,
	Legend,
	ReferenceLine,
	ResponsiveContainer,
	Scatter,
	ScatterChart,
	Tooltip,
	XAxis,
	YAxis,
	ZAxis,
} from 'recharts';

import { Card } from '@/components/ui/card';

interface CorrelationData {
	supervisorGrade: number;
	moderatorGrade: number;
	studentId: number;
	name: string;
}

interface GradeCorrelationChartProps {
	data: CorrelationData[];
}

export default function GradeCorrelationChart({ data }: GradeCorrelationChartProps) {
	// Calculate correlation coefficient
	const correlationStats = useMemo(() => {
		if (data.length < 2) return { r: 0, slope: 1, intercept: 0 };

		// Calculate means
		const meanX = data.reduce((sum, item) => sum + item.supervisorGrade, 0) / data.length;
		const meanY = data.reduce((sum, item) => sum + item.moderatorGrade, 0) / data.length;

		// Calculate correlation coefficient
		let numerator = 0;
		let denominatorX = 0;
		let denominatorY = 0;

		data.forEach((item) => {
			const xDiff = item.supervisorGrade - meanX;
			const yDiff = item.moderatorGrade - meanY;
			numerator += xDiff * yDiff;
			denominatorX += xDiff * xDiff;
			denominatorY += yDiff * yDiff;
		});

		const r = numerator / (Math.sqrt(denominatorX) * Math.sqrt(denominatorY));

		// Calculate regression line (y = mx + b)
		const slope = numerator / denominatorX;
		const intercept = meanY - slope * meanX;

		return { r, slope, intercept };
	}, [data]);

	// Generate regression line data points
	const regressionLineData = useMemo(() => {
		if (data.length < 2) return [];

		// Find min and max x values
		const minX = Math.min(...data.map((item) => item.supervisorGrade));
		const maxX = Math.max(...data.map((item) => item.supervisorGrade));

		// Create two points for the regression line
		return [
			{ x: minX, y: correlationStats.slope * minX + correlationStats.intercept },
			{ x: maxX, y: correlationStats.slope * maxX + correlationStats.intercept },
		];
	}, [data, correlationStats]);

	// Custom tooltip
	const CustomTooltip = ({
		active,
		payload,
	}: {
		active?: boolean;
		payload?: Array<{
			payload: {
				name: string;
				supervisorGrade: number;
				moderatorGrade: number;
			};
		}>;
	}) => {
		if (active && payload && payload.length) {
			const student = payload[0].payload;

			return (
				<Card className="p-3 bg-background border shadow-md">
					<p className="font-medium">{student.name}</p>
					<p className="text-sm text-muted-foreground">{`Supervisor Grade: ${student.supervisorGrade}`}</p>
					<p className="text-sm text-muted-foreground">{`Moderator Grade: ${student.moderatorGrade}`}</p>
					<p className="text-sm text-muted-foreground">{`Difference: ${(student.supervisorGrade - student.moderatorGrade).toFixed(2)}`}</p>
				</Card>
			);
		}
		return null;
	};

	return (
		<ResponsiveContainer width="100%" height="100%">
			<ScatterChart
				margin={{
					top: 20,
					right: 30,
					bottom: 60,
					left: 30,
				}}
			>
				<CartesianGrid strokeDasharray="3 3" opacity={0.2} />
				<XAxis
					type="number"
					dataKey="supervisorGrade"
					name="Supervisor Grade"
					domain={[0, 100]}
					label={{
						value: 'Supervisor Grade',
						position: 'insideBottom',
						offset: -10,
						fontSize: 14,
					}}
				/>
				<YAxis
					type="number"
					dataKey="moderatorGrade"
					name="Moderator Grade"
					domain={[0, 100]}
					label={{
						value: 'Moderator Grade',
						angle: -90,
						position: 'insideLeft',
						style: { textAnchor: 'middle' },
						fontSize: 14,
					}}
				/>
				<ZAxis range={[60, 60]} />
				<Tooltip content={<CustomTooltip />} />
				<Legend />

				{/* Perfect correlation reference line */}
				<ReferenceLine
					segment={[
						{ x: 0, y: 0 },
						{ x: 100, y: 100 },
					]}
					stroke="#94a3b8"
					strokeDasharray="3 3"
					label={{
						value: 'Perfect Agreement',
						position: 'insideBottomRight',
						fontSize: 12,
					}}
				/>

				{/* Regression line */}
				<ReferenceLine
					segment={regressionLineData}
					stroke="#f97316"
					strokeWidth={2}
					label={{
						value: `Correlation: ${correlationStats.r.toFixed(2)}`,
						position: 'insideTopRight',
						fontSize: 12,
					}}
				/>

				{/* Scatter plot */}
				<Scatter
					name="Student Grades"
					data={data}
					fill="#3b82f6"
					shape="circle"
					line={{ stroke: '#3b82f6', strokeWidth: 1 }}
					lineType="fitting"
				/>
			</ScatterChart>
		</ResponsiveContainer>
	);
}
